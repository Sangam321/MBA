# Market Basket Analysis Backend

This Flask backend implements Market Basket Analysis using the FP-Growth algorithm.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /analyze
Upload a CSV file for market basket analysis.

**Request:**
- Form data with 'file' containing CSV data
- CSV format: items separated by commas, transactions on separate lines

**Response:**
```json
{
  "total_transactions": 1000,
  "item_frequency": {
    "whole milk": 255,
    "other vegetables": 193
  },
  "frequent_itemsets": [
    {
      "itemset": ["whole milk"],
      "support": 0.255
    }
  ],
  "association_rules": [
    {
      "antecedents": ["butter"],
      "consequents": ["whole milk"],
      "support": 0.027,
      "confidence": 0.497,
      "lift": 1.946
    }
  ]
}
```

### GET /health
Health check endpoint.

## CSV Format

Your CSV should contain transaction data where each row represents a transaction and items are separated by commas:

```csv
citrus fruit,semi-finished bread,margarine,ready soups
tropical fruit,yogurt,coffee
whole milk
pip fruit,yogurt,cream cheese,meat spreads
other vegetables,whole milk,condensed milk,long life bakery product
```

## Algorithm Details

- **FP-Growth**: Efficiently finds frequent itemsets without candidate generation
- **Support**: Frequency of itemset appearance in transactions
- **Confidence**: Likelihood of consequent given antecedent
- **Lift**: Ratio of observed support to expected support if items were independent

## Features

- Automatic parameter tuning for optimal results
- Handles various CSV formats
- CORS enabled for frontend integration
- Error handling and validation
- Efficient processing for large datasets