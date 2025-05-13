from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.adminAccounts import AdminAccounts
from models.userContributedData import UserContributedData
from models.userResponses import UserResponses
from models.webStatistics import WebStatistics
from schemas import UserResponse, UserLabeledData
import os
import json
import traceback
import logging
from database import get_db
from utils import update_env_variable, save_base64_image
from config import MODEL_NAME, MODEL_DIR

router = APIRouter()
logger = logging.getLogger(__name__)


@router.put("/admin/change-model")  # Can Hoang Son sua
async def change_model_path(model_name: str):
    try:
        # Check if the model file exists
        model_path = os.path.join(MODEL_DIR, f"{model_name}.pt")
        if not os.path.isfile(model_path):
            raise HTTPException(
                status_code=400, detail="Model file does not exist")

        # Copy to current_model.pt
        update_env_variable("MODEL_NAME", model_name)

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
async def save_user_user_response(request: UserResponse, db: AsyncSession = Depends(get_db)):
    try:
        image_path = await save_base64_image(
            request.originalImage, request.imageId)
        new_response = UserResponses(
            image_path=image_path,
            model_used=MODEL_NAME,
            is_right=request.isCorrect,
            comment=request.comment
        )
        db.add(new_response)
        await db.commit()
        return {"status": "success", "message": "Saved the response successfully"}
    except Exception as e:
        tb = traceback.format_exc()
        logger.error(
            f"Exception occurred while saving user response: {str(e)}\n{tb}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save-user-data")
async def save_user_user_data(request: UserLabeledData, db: AsyncSession = Depends(get_db)):
    try:
        image_path = await save_base64_image(request.image)
        labels_json = json.dumps([label.model_dump()
                                 for label in request.labels])
        new_data = UserContributedData(
            image_path=image_path,
            labels=labels_json
        )
        db.add(new_data)
        await db.commit()
        return {"status": "success", "message": "Saved the data successfully"}
    except Exception as e:
        tb = traceback.format_exc()
        logger.error(
            f"Exception occurred while saving user labeled image: {str(e)}\n{tb}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{admin_id}/verify-data")
async def verify_data(admin_id: int, data_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(UserContributedData).where(UserContributedData.data_id == data_id, UserContributedData.is_verified == False))
        data = result.first()[0]
        data.is_verified = True
        data.verified_by = admin_id
        db.commit()
    except Exception as e:
        return {"error": str(e)}


@router.put("/{admin_id}/verify-response")
async def verify_response(admin_id: int, response_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(UserResponses).where(UserResponses.response_id == response_id, UserResponses.is_verified == False))
        data = result.first()[0]
        data.is_verified = True
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
                "image": data.image_path,
                "labels": json.loads(data.labels),
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
                "image": response.image_path,
                "model_used": response.model_used,
                "is_right": response.is_right,
                "comment": response.comment,
                "added_at": response.added_at
            }
            for response in unverified_responses
        ]
        return response_list
    except Exception as e:
        return {"error": str(e)}
