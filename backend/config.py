import os
from dotenv import load_dotenv

load_dotenv()

MODEL_NAME = "best" #CAN SUA

class_map = {
    0: 'food',
    1: 'glass',
    2: 'metal',
    3: 'paper',
    4: 'plastic',
    5: 'other'
}