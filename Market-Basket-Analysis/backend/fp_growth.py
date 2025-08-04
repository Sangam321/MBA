import pyfpgrowth
import pandas as pd
from collections import defaultdict

class FPGrowthAnalyzer:
    def __init__(self, min_support=0.1, min_confidence=0.5):
        self.min_support = min_support
        self.min_confidence = min_confidence
    
    def preprocess_data(self, file_path):
        """Read CSV file and prepare transactions"""
        try:
            df = pd.read_csv(file_path, header=None)
            transactions = []
            
            for _, row in df.iterrows():
                transaction = [item.strip() for item in row.dropna().tolist()]
                if transaction:
                    transactions.append(transaction)
            
            return transactions
        except Exception as e:
            raise Exception(f"Error processing file: {str(e)}")
    
    def find_frequent_patterns(self, transactions):
        "Find frequent itemsets using FP-Growth"
        try:
            min_support_count = int(self.min_support * len(transactions))
            patterns = pyfpgrowth.find_frequent_patterns(transactions, min_support_count)
            return patterns
        except Exception as e:
            raise Exception(f"Error finding frequent patterns: {str(e)}")
    
    def generate_rules(self, patterns, transactions):
        """Generate association rules from frequent itemsets"""
        try:
            rules = pyfpgrowth.generate_association_rules(patterns, self.min_confidence)
           
            formatted_rules = []
            for antecedent, (consequent, confidence) in rules.items():
                formatted_rules.append({
                    "antecedent": list(antecedent),
                    "consequent": list(consequent),
                    "confidence": confidence,
                    "support": patterns[antecedent] / len(transactions)
                })
            
            return formatted_rules
        except Exception as e:
            raise Exception(f"Error generating rules: {str(e)}")
    
    def analyze(self, file_path):
        """Complete analysis pipeline"""
        transactions = self.preprocess_data(file_path)
        if not transactions:
            raise Exception("No valid transactions found in the file")
        
        patterns = self.find_frequent_patterns(transactions)
        rules = self.generate_rules(patterns, transactions)
  
        item_frequencies = defaultdict(int)
        for transaction in transactions:
            for item in transaction:
                item_frequencies[item] += 1
       
        sorted_items = sorted(item_frequencies.items(), key=lambda x: x[1], reverse=True)
        frequency_data = [{"item": item, "frequency": count} for item, count in sorted_items]
        
        return {
            "transactions_count": len(transactions),
            "unique_items": len(item_frequencies),
            "frequent_patterns": patterns,
            "association_rules": rules,
            "item_frequencies": frequency_data
        }