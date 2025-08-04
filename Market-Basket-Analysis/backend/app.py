from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from mlxtend.frequent_patterns import fpgrowth, association_rules
from mlxtend.preprocessing import TransactionEncoder
import io
import csv
from collections import Counter
import datetime
from db import analysis_collection  

app = Flask(__name__)
CORS(app)
def preprocess_data(file_content):
    """
    Preprocess the CSV file content to extract transactions
    """
    csv_reader = csv.reader(io.StringIO(file_content))
    transactions = []
    for row in csv_reader:
        transaction = [item.strip() for item in row if item.strip()]
        if transaction:
            transactions.append(transaction)
    return transactions

def create_basket_matrix(transactions):
    """
    Create a binary matrix representation of transactions
    """
    te = TransactionEncoder()
    te_ary = te.fit(transactions).transform(transactions)
    df = pd.DataFrame(te_ary, columns=te.columns_)
    return df
def perform_market_basket_analysis(df, min_support=0.01, min_confidence=0.1):
    """
    Perform market basket analysis using FP-Growth algorithm
    """
    try:
        frequent_itemsets = fpgrowth(df, min_support=min_support, use_colnames=True)

        if frequent_itemsets.empty:
            frequent_itemsets = fpgrowth(df, min_support=0.005, use_colnames=True)

        if not frequent_itemsets.empty and len(frequent_itemsets) > 1:
            rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)
            if rules.empty:
                rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=min_confidence)
        else:
            rules = pd.DataFrame()

        return frequent_itemsets, rules

    except Exception as e:
        print(f"Error in analysis: {e}")
        return pd.DataFrame(), pd.DataFrame()


@app.route('/analyze', methods=['POST'])
def analyze_basket():
    """
    Main endpoint for market basket analysis
    """
    try:

        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

  
        file_content = file.read().decode('utf-8')

        transactions = preprocess_data(file_content)
        if not transactions:
            return jsonify({'error': 'No valid transactions found in file'}), 400

   
        basket_df = create_basket_matrix(transactions)

        frequent_itemsets, rules = perform_market_basket_analysis(basket_df)

        all_items = []
        for transaction in transactions:
            all_items.extend(transaction)
        item_frequency = dict(Counter(all_items))

        response_data = {
            'total_transactions': len(transactions),
            'item_frequency': item_frequency,
            'frequent_itemsets': [],
            'association_rules': []
        }
        if not frequent_itemsets.empty:
            for _, itemset in frequent_itemsets.iterrows():
                response_data['frequent_itemsets'].append({
                    'itemset': list(itemset['itemsets']),
                    'support': float(itemset['support'])
                })

        if not rules.empty:
            for _, rule in rules.iterrows():
                response_data['association_rules'].append({
                    'antecedents': list(rule['antecedents']),
                    'consequents': list(rule['consequents']),
                    'support': float(rule['support']),
                    'confidence': float(rule['confidence']),
                    'lift': float(rule['lift'])
                })

        try:
            analysis_collection.insert_one({
                "timestamp": datetime.datetime.utcnow(),
                "csv_filename": file.filename,
                "csv_data": file_content, 
                "total_transactions": len(transactions),
                "item_frequency": item_frequency,
                "frequent_itemsets": response_data['frequent_itemsets'],
                "association_rules": response_data['association_rules']
            })
            print(f"Analysis stored in MongoDB for file: {file.filename}")
        except Exception as db_err:
            print(f"Error saving to MongoDB: {db_err}")

        return jsonify(response_data)

    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({'status': 'healthy', 'message': 'Market Basket Analysis API is running'})


if __name__ == '__main__':
    print("Starting Market Basket Analysis API...")
    print("Make sure you have installed: flask flask-cors pandas mlxtend numpy pymongo")
    app.run(debug=True, host='0.0.0.0', port=5000)
