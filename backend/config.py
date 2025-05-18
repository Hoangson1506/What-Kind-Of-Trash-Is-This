import os
from dotenv import load_dotenv
import re

load_dotenv()

MODEL_FORMAT = os.getenv("MODEL_FORMAT", "pt")

MODEL_NAME = os.getenv("MODEL_NAME", "best")
class_map = {
    0: 'food',
    1: 'glass',
    2: 'metal',
    3: 'paper',
    4: 'plastic',
    5: 'other'
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # đường dẫn đến backend/
MODEL_DIR = os.path.join(BASE_DIR, "AI_models")
DATABASE_URL = os.getenv(
    "DATABASE_URL", "sqlite+aiosqlite:///./database/app.db")
IMG_DIR = os.path.join(BASE_DIR, "images")
SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 180