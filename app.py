from flask import Flask, jsonify
from flask_cors import CORS
import yfinance as yf
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

@app.route('/api/data/<ticker>', methods=['GET'])
def get_stock_data(ticker):
    try:
        # Get stock data for the last 2 years
        end_date = datetime.now()
        start_date = end_date - timedelta(days=730)  # 2 years
        
        # Download stock data
        stock = yf.Ticker(ticker)
        hist = stock.history(start=start_date, end=end_date)
        
        # Process data into yearly and quarterly format
        years_data = []
        
        # Group by year
        yearly_groups = hist.groupby(hist.index.year)
        for year in sorted(yearly_groups.groups.keys(), reverse=True):
            year_data = hist[hist.index.year == year]
            
            # Group by quarter
            quarters = []
            for quarter in range(4, 0, -1):
                quarter_data = year_data[year_data.index.quarter == quarter]
                if not quarter_data.empty:
                    # Calculate quarterly return and volatility
                    returns = ((quarter_data['Close'] - quarter_data['Open']) / quarter_data['Open'] * 100).mean()
                    volatility = quarter_data['Close'].std() / quarter_data['Close'].mean() * 100
                    
                    quarters.append({
                        f"Q{quarter}": {
                            "return": round(returns, 2),
                            "volatility": round(volatility, 2)
                        }
                    })
            
            if quarters:
                years_data.append({
                    str(year): [{
                        "Quarterly": quarters
                    }]
                })
        
        return jsonify({"Years": years_data})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
