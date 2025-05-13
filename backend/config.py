import os
from dotenv import load_dotenv

load_dotenv()

MODEL_NAME = os.getenv("MODEL_NAME", "v8s")
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
DATABASE_URL = "sqlite+aiosqlite:///./database/app.db"
IMG_DIR = os.path.join(BASE_DIR, "images")
SECRET_KEY = "6e7f7058833cb866137ab08ed19486bc524638e1cef89ca46da7b7008db14195"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 180
