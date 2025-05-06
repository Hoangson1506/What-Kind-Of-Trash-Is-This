from ultralytics import YOLO
from PIL import Image
from io import BytesIO
import base64

model = None


def init_model(model_path):
    global model
    model = YOLO(model_path)


async def detect_with_model(image):
    """Make detection on image

    Args:
        image (Image)
    """
    results = model(image)[0]
    detected_image = results.plot()

    # Encode ndarray image to base64
    image_pil = Image.fromarray(detected_image[..., ::-1])  # BGR to RGB
    buffer = BytesIO()
    image_pil.save(buffer, format='JPEG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    # Prepare detection result
    detections = []
    for box in results.boxes:
        cls = int(box.cls[0])
        conf = float(box.conf[0])
        xyxy = [round(x, 2) for x in box.xyxy[0].tolist()]
        detections.append({
            "trashType": cls,
            "confidence": round(conf, 2),
            "bbox": xyxy
        })

    content = {
        "processedImage": f"data:image/jpeg;base64,{img_base64}",
        "detections": detections
    }
    return content
