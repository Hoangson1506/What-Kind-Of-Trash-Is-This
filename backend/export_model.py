from ultralytics import YOLO
from config import MODEL_DIR
import os

model = YOLO(os.path.join(MODEL_DIR, "yolo_11n_version_1.pt"))
model.export(format="onnx", nms=True, device="cpu")
