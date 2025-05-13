from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models.adminAccounts import AdminAccounts
from models.userContributedData import UserContributedData
from models.userResponses import UserResponses
import os
import json
from utils import update_env_variable
from config import MODEL_DIR
from typing import Annotated
from auth import get_current_user

router = APIRouter()


@router.put("/change-model")
async def change_model_path(model_name: str, admin: Annotated[AdminAccounts, Depends(get_current_user)]):
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


@router.put("/verify-data")
async def verify_data(admin: Annotated[AdminAccounts, Depends(get_current_user)], data_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(UserContributedData).where(UserContributedData.data_id == data_id, UserContributedData.is_verified == False))
        data = result.first()
        if data:
            data = data[0]
            data.is_verified = True
            data.verified_by = admin.login_name
            await db.commit()
    except Exception as e:
        return {"error": str(e)}


@router.put("/verify-response")
async def verify_response(admin: Annotated[AdminAccounts, Depends(get_current_user)], response_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(UserResponses).where(UserResponses.response_id == response_id, UserResponses.is_verified == False))
        data = result.first()
        if data:
            data = data[0]
            data.is_verified = True
            data.verified_by = admin.login_name
            await db.commit()
    except Exception as e:
        return {"error": str(e)}


@router.get("/admin/get-unverified-data")
async def get_unverified_data(admin: Annotated[AdminAccounts, Depends(get_current_user)], db: AsyncSession = Depends(get_db)):
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
async def get_unverified_responses(admin: Annotated[AdminAccounts, Depends(get_current_user)], db: AsyncSession = Depends(get_db)):
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
