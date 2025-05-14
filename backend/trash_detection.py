from ultralytics import YOLO
from PIL import Image
from io import BytesIO
import base64
from config import class_map

model = None


def init_model(model_path):
    global model
    model = YOLO(model_path, task="detect")


async def detect_with_model(image):
    """Make detection on image

    Args:
        image (Image)
    """
    original_width, original_height = image.size
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
        xyxy = [x for x in box.xyxyn[0].tolist()]
        # Rescale bounding box to original image size
        xyxy[0] = int(xyxy[0] * original_width)
        xyxy[1] = int(xyxy[1] * original_height)
        xyxy[2] = int(xyxy[2] * original_width)
        xyxy[3] = int(xyxy[3] * original_height)

        detections.append({
            "trashType": class_map[cls],
            "confidence": round(conf, 2),
            "bbox": xyxy,
            "shape": detected_image.shape
        })

    content = {
        "processedImage": f"data:image/jpeg;base64,{img_base64}",
        "detections": detections
    }
    return content
