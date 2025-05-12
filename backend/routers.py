from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.adminAccounts import AdminAccounts
from models.userContributedData import UserContributedData
from models.userResponses import UserResponses
from models.webStatistics import WebStatistics
from database import get_db
import base64
import numpy as np
import cv2
import io
import json
import os
import shutil
from PIL import Image
from schemas import ImageRequest
from trash_detection import detect_with_model, init_model
from config import MODEL_NAME

router = APIRouter()


@router.post('/inference-image')
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
async def real_time_inference(websocket: WebSocket, db: AsyncSession = Depends(get_db)):
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

@router.put("/admin/change-model") # Can Hoang Son sua
async def change_model_path(model_path: str):
    try:
        # Check if the model file exists
        if not os.path.isfile(model_path):
            raise HTTPException(status_code=400, detail="Model file does not exist")

        # Copy to current_model.pt
        dest_path = "./models/current_model.pt"
        shutil.copyfile(model_path, dest_path)

        return {"status": "success", "message": f"Model changed successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/admin/login")
async def login(login_name: str, password: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(AdminAccounts).where(AdminAccounts.login_name == login_name, AdminAccounts.password == password))
        admin = result.first()
        if admin is not None:
            return {"status": "success"}
        else:
            return {"status": "fail", "message": "Invalid username or password"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/save-user-response")
async def save_user_user_response(image: str, is_right: bool, comment: str, db: AsyncSession = Depends(get_db)):
    try:
        new_response = UserResponses(
            image_str = image,
            model_used = MODEL_NAME,
            is_right = is_right,
            comment = comment
        )
        db.add(new_response)
        await db.commit()
        return {"status": "success", "message": "Saved the response successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/save-user-data")
async def save_user_user_data(image: str, trash_types: str, bboxes: str, db: AsyncSession = Depends(get_db)):
    try:
        new_data = UserContributedData(
            image_str = image,
            trash_types = trash_types,
            bboxes = bboxes
        )
        db.add(new_data)
        await db.commit()
        return {"status": "success", "message": "Saved the data successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/{admin_id}/verify-data")
async def verify_data(admin_id: int, data_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(UserContributedData).where(UserContributedData.data_id == data_id, UserContributedData.is_verified == False))
        data = result.first()[0]
        data.is_verified=True
        data.verified_by = admin_id
        db.commit()
    except Exception as e:
        return {"error": str(e)}

@router.put("/{admin_id}/verify-response")
async def verify_response(admin_id: int, response_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(UserResponses).where(UserResponses.response_id == response_id, UserResponses.is_verified == False))
        data = result.first()[0]
        data.is_verified=True
        data.verified_by = admin_id
        db.commit()
    except Exception as e:
         return {"error": str(e)}
    
@router.get("/admin/get-unverified-data")
async def get_unverified_data(db: AsyncSession = Depends(get_db)):
    try:
        results = await db.execute(select(UserContributedData).where(UserContributedData.is_verified == False))
        unverified_data = results.scalars().all()
        data_list = [
            {
                "data_id": data.data_id,
                "image": data.image_str,
                "trash_types": data.trash_types,
                "bboxes": data.bboxes,
                "added_at": data.added_at
            }
            for data in unverified_data
        ]
        return data_list
    except Exception as e:
        return {"error": str(e)}
    
@router.get("/admin/get-unverified-responses")
async def get_unverified_responses(db: AsyncSession = Depends(get_db)):
    try:
        results = await db.execute(select(UserResponses).where(UserResponses.is_verified == False))
        unverified_responses = results.scalars().all()
        response_list = [
            {
                "response_id": response.response_id,
                "image": response.image_str,
                "model_used": response.model_used,
                "is_right": response.is_right,
                "comment": response.bboxes,
                "added_at": response.added_at
            }
            for response in unverified_responses
        ]
        return response_list
    except Exception as e:
        return {"error": str(e)}