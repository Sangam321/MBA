import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://sangambasnet1800:AfHZFvQWJ8btKyYX@cluster0.dhxbnps.mongodb.net/CourZeo")
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
    ALLOWED_EXTENSIONS = {"csv"}
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")

    @staticmethod
    def init_app(app):
        if not os.path.exists(Config.UPLOAD_FOLDER):
            os.makedirs(Config.UPLOAD_FOLDER)