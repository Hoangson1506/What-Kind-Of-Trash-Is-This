from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from models.webStatistics import WebStatistics
import base64
import io
import json
from PIL import Image
from schemas import ImageRequest
from trash_detection import detect_with_model
from db import get_db
from sqlalchemy.future import select
from config import MODEL_NAME

router = APIRouter()


@router.post('/image')
async def inference_image(requests: ImageRequest, db: AsyncSession = Depends(get_db)):
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

        # update database for model statistics
        model_statistics = await db.execute(select(WebStatistics).where(WebStatistics.model == MODEL_NAME))
        row = model_statistics.first()
        if row is None:
            new_stats = WebStatistics(
                model = MODEL_NAME,
                image_inference_count = 1,
            )
            db.add(new_stats)
        else:
            stats = row[0]
            stats.image_inference_count += 1
        await db.commit()

        return results
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=400, detail=str(e))


@router.websocket("/ws")
async def inference_video(websocket: WebSocket, db: AsyncSession = Depends(get_db)):
    await websocket.accept()
    try:
        # update database for model statistics
        model_statistics = await db.execute(select(WebStatistics).where(WebStatistics.model == MODEL_NAME))
        row = model_statistics.first()
        if row is None:
            new_stats = WebStatistics(
                model = MODEL_NAME,
                live_inference_count = 1
            )
            db.add(new_stats)
        else:
            stats = row[0]
            stats.live_inference_count += 1
        await db.commit()
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
