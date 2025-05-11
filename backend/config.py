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
