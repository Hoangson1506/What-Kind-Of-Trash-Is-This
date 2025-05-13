from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
import base64
import io
import json
from PIL import Image
from schemas import ImageRequest
from trash_detection import detect_with_model

router = APIRouter()


@router.post('/inference-image')
async def inference_image(requests: ImageRequest):
    """Get the uploaded image and preprocess to prepare for inference step

    Args:
        requests: the content of the post request
    """

    try:
        if requests.image.startswith('data:image'):
            header, base64_data = requests.image.split(',', 1)
        else:
            base64_data = requests.image

        image_bytes = base64.b64decode(base64_data)
        image = Image.open(io.BytesIO(image_bytes))
        results = await detect_with_model(image)

        return results
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=400, detail=str(e))


@router.websocket("/ws")
async def inference_video(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            data = message.get("image")

            if data.startswith('data:image'):
                _, base64_data = data.split(",", 1)
            else:
                base64_data = data

            image_bytes = base64.b64decode(base64_data)
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

            results = await detect_with_model(image)
            await websocket.send_json(results)

    except WebSocketDisconnect:
        print("Client disconnected")
