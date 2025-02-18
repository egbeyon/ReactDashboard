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
        stock_data = yf.download(ticker, start=start_date, end=end_date, interval='1d')
        market_data = yf.download('^GSPC', start=start_date, end=end_date, interval='1d')
        return stock_data, market_data
    except Exception as e:
        print(f"Error fetching stock data: {e}")
        return None, None

def calculate_metrics(stock_data, market_data, announcement_date):
    try:
        # Define time periods
        pre_announcement_start = announcement_date - datetime.timedelta(days=2)
        announcement_end = announcement_date + datetime.timedelta(days=3)

        # Get relevant data slices
        pre_stock_data = stock_data[pre_announcement_start:announcement_date]
        post_stock_data = stock_data[announcement_date:announcement_end]
        post_market_data = market_data[announcement_date:announcement_end]

        if pre_stock_data.empty or post_stock_data.empty:
            return None

        # Calculate stock returns and volatility
        stock_returns = post_stock_data['Close'].pct_change().dropna()
        stock_return = ((post_stock_data['Close'].iloc[-1] - post_stock_data['Close'].iloc[0]) 
                       / post_stock_data['Close'].iloc[0] * 100)
        volatility = stock_returns.std() * 100

        # Calculate pre-announcement average return
        pre_stock_returns = pre_stock_data['Close'].pct_change().dropna()
        pre_avg_return = pre_stock_returns.mean() * 100

        # Calculate S&P 500 returns
        market_return = ((post_market_data['Close'].iloc[-1] - post_market_data['Close'].iloc[0]) 
                        / post_market_data['Close'].iloc[0] * 100)
        market_volatility = post_market_data['Close'].pct_change().dropna().std() * 100

        # Calculate net returns
        net_return = stock_return - pre_avg_return
        net_market_return = stock_return - market_return

        return {
            "return": round(stock_return, 2),
            "volatility": round(volatility, 2),
            "net_return": round(net_return, 2),
            "net_market_return": round(net_market_return, 2),
            "market_return": round(market_return, 2),
            "market_volatility": round(market_volatility, 2)
        }
    except Exception as e:
        print(f"Error calculating metrics: {e}")
        return None

def format_data(ticker, filings_data):
    formatted_data = {"Years": []}

    if filings_data is None:
        # Get basic stock data for the last 2 years
        end_date = datetime.datetime.now()
        start_date = end_date - datetime.timedelta(days=730)
        stock_data, market_data = get_stock_data(ticker, start_date, end_date)

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
                quarter_date = quarter_stock.index[0]
                metrics = calculate_metrics(stock_data, market_data, quarter_date)

                if metrics:
                    year_data[str(year)][0]["Quarterly"].append({
                        f"Q{quarter}": metrics
                    })

            if year_data[str(year)][0]["Quarterly"]:
                formatted_data["Years"].append(year_data)
    else:
        # Use filings data
        for year, year_filings in filings_data.groupby(filings_data['filedAt'].dt.year):
            year_data = {str(year): [{"Quarterly": []}]}

            for quarter, quarter_filings in year_filings.groupby(filings_data['filedAt'].dt.quarter):
                filing = quarter_filings.iloc[0]
                filing_date = filing['filedAt'].to_pydatetime()

                # Get data from 2 days before to 3 days after filing
                stock_data, market_data = get_stock_data(
                    ticker,
                    filing_date - datetime.timedelta(days=2),
                    filing_date + datetime.timedelta(days=3)
                )

                if stock_data is not None and not stock_data.empty:
                    metrics = calculate_metrics(stock_data, market_data, filing_date)
                    if metrics:
                        year_data[str(year)][0]["Quarterly"].append({
                            f"Q{quarter}": metrics
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