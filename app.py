from flask import Flask, jsonify
from flask_cors import CORS
import yfinance as yf
from sec_api import QueryApi
import pandas as pd
import datetime
import os

app = Flask(__name__)
CORS(app)

# SEC API Configuration
SEC_API_KEY = os.environ.get("SEC_API_KEY")  # Get API Key from Environment Variable
query_api = QueryApi(api_key=SEC_API_KEY) if SEC_API_KEY else None

def get_filings_data(ticker):
    if not query_api:
        return None  # Return None if SEC API is not configured

    try:
        search_10k = f'ticker:{ticker} AND formType:"10-K" AND filedAt:[2019-01-01 TO 2024-12-31]'
        search_10q = f'ticker:{ticker} AND formType:"10-Q" AND filedAt:[2019-01-01 TO 2024-12-31]'
        res_10k = {"query": search_10k, "from": "0"}
        res_10q = {"query": search_10q, "from": "0"}
        response_10k = query_api.get_filings(res_10k)
        response_10q = query_api.get_filings(res_10q)
        filings_10k = pd.DataFrame(response_10k.get("filings", []))
        filings_10q = pd.DataFrame(response_10q.get("filings", []))
        filings = pd.concat([filings_10k, filings_10q], ignore_index=True)

        if filings.empty:
            return None

        filings['filedAt'] = pd.to_datetime(filings['filedAt'])
        return filings
    except Exception as e:
        print(f"Error fetching filings: {e}")
        return None

def get_stock_data(ticker, start_date, end_date):
    try:
        stock_data = yf.download(ticker, start=start_date, end=end_date)
        return stock_data
    except Exception as e:
        print(f"Error fetching stock data: {e}")
        return None

def calculate_returns_volatility(stock_data, announcement_date):
    try:
        pre_announcement_start = announcement_date - datetime.timedelta(days=3)
        pre_announcement_end = announcement_date
        post_announcement_start = announcement_date + datetime.timedelta(days=1)
        post_announcement_end = announcement_date + datetime.timedelta(days=3)

        pre_announcement_data = stock_data[pre_announcement_start:pre_announcement_end]
        post_announcement_data = stock_data[post_announcement_start:post_announcement_end]

        if pre_announcement_data.empty or post_announcement_data.empty:
            return None

        pre_returns = pre_announcement_data['Close'].pct_change().dropna()
        post_returns = post_announcement_data['Close'].pct_change().dropna()

        avg_return = pd.concat([pre_returns, post_returns]).mean()
        volatility = pd.concat([pre_returns, post_returns]).std()

        return avg_return.item(), volatility.item()
    except Exception as e:
        print(f"Error calculating returns/volatility: {e}")
        return None

def format_data(ticker, filings_data):
    formatted_data = {"Years": []}

    if filings_data is None:
        # If no filings data, get basic stock data for the last 2 years
        end_date = datetime.datetime.now()
        start_date = end_date - datetime.timedelta(days=730)
        stock_data = get_stock_data(ticker, start_date, end_date)

        if stock_data is None or stock_data.empty:
            return formatted_data

        # Group by year and quarter
        stock_data['year'] = stock_data.index.year
        stock_data['quarter'] = stock_data.index.quarter

        for year in sorted(stock_data['year'].unique(), reverse=True):
            year_data = {str(year): [{"Quarterly": []}]}
            year_stock = stock_data[stock_data['year'] == year]

            for quarter in sorted(year_stock['quarter'].unique(), reverse=True):
                quarter_stock = year_stock[year_stock['quarter'] == quarter]
                returns = ((quarter_stock['Close'] - quarter_stock['Open']) / quarter_stock['Open'] * 100).mean()
                volatility = (quarter_stock['Close'].std() / quarter_stock['Close'].mean()) * 100

                year_data[str(year)][0]["Quarterly"].append({
                    f"Q{quarter}": {
                        "return": round(returns, 2),
                        "volatility": round(volatility, 2)
                    }
                })

            formatted_data["Years"].append(year_data)
    else:
        # Use filings data if available
        for year, year_filings in filings_data.groupby(filings_data['filedAt'].dt.year):
            year_data = {str(year): [{"Quarterly": []}]}

            for quarter, quarter_filings in year_filings.groupby(filings_data['filedAt'].dt.quarter):
                filing = quarter_filings.iloc[0]
                filing_date = filing['filedAt'].to_pydatetime()

                stock_data = get_stock_data(
                    ticker,
                    filing_date - datetime.timedelta(days=7),
                    filing_date + datetime.timedelta(days=7)
                )

                if stock_data is not None and not stock_data.empty:
                    returns_volatility = calculate_returns_volatility(stock_data, filing_date)
                    if returns_volatility:
                        avg_return, volatility = returns_volatility
                        year_data[str(year)][0]["Quarterly"].append({
                            f"Q{quarter}": {
                                "return": round(avg_return * 100, 2),
                                "volatility": round(volatility * 100, 2)
                            }
                        })

            if year_data[str(year)][0]["Quarterly"]:
                formatted_data["Years"].append(year_data)

    return formatted_data

@app.route('/api/data/<ticker>')
def get_data(ticker):
    try:
        # Try to get filings data first
        filings_data = get_filings_data(ticker) if SEC_API_KEY else None

        # Format the data (will use basic stock data if no filings data)
        formatted_data = format_data(ticker, filings_data)

        if not formatted_data["Years"]:
            return jsonify({"message": "No data found for this ticker"}), 404

        return jsonify(formatted_data), 200

    except Exception as e:
        print(f"API Error: {e}")
        return jsonify({"error": "An error occurred"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)