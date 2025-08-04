from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from fp_growth import FPGrowthAnalyzer
from utils import save_uploaded_file
import json
import os
from config import Config

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)
Config.init_app(app)


client = MongoClient(Config.MONGO_URI)
db = client.get_database()

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

app.json_encoder = JSONEncoder

@app.route("/api/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    try:

        file_path = save_uploaded_file(file)
        if not file_path:
            return jsonify({"error": "Invalid file type"}), 400
        

        min_support = float(request.form.get("min_support", 0.1))
        min_confidence = float(request.form.get("min_confidence", 0.5))
        
     
        analyzer = FPGrowthAnalyzer(min_support=min_support, min_confidence=min_confidence)
        result = analyzer.analyze(file_path)
        
  
        analysis_data = {
            "filename": file.filename,
            "upload_date": datetime.utcnow(),
            "parameters": {
                "min_support": min_support,
                "min_confidence": min_confidence
            },
            "results": result
        }
        
        analysis_id = db.analyses.insert_one(analysis_data).inserted_id
        
        return jsonify({
            "message": "File uploaded and analyzed successfully",
            "analysis_id": str(analysis_id),
            "results": result
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/analyses", methods=["GET"])
def get_analyses():
    try:
        analyses = list(db.analyses.find().sort("upload_date", -1))
        return jsonify(analyses)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/analyses/<analysis_id>", methods=["GET"])
def get_analysis(analysis_id):
    try:
        analysis = db.analyses.find_one({"_id": ObjectId(analysis_id)})
        if not analysis:
            return jsonify({"error": "Analysis not found"}), 404
        return jsonify(analysis)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/analyses/<analysis_id>", methods=["DELETE"])
def delete_analysis(analysis_id):
    try:
        result = db.analyses.delete_one({"_id": ObjectId(analysis_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Analysis not found"}), 404
        return jsonify({"message": "Analysis deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)