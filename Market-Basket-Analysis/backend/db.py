from pymongo import MongoClient
import os
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://sangambasnet1800:AfHZFvQWJ8btKyYX@cluster0.dhxbnps.mongodb.net/CourZeo")
DB_NAME = os.getenv("MONGO_DB_NAME", "market_basket_db")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
analysis_collection = db["analyses"]
