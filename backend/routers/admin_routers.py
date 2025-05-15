from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models.adminAccounts import AdminAccounts
from models.userContributedData import UserContributedData
from models.userResponses import UserResponses
import os
import json
import traceback
from enum import Enum
from utils import update_env_variable
from config import MODEL_DIR, IMG_DIR
from typing import Annotated
from auth import get_current_user

router = APIRouter()


class Status(Enum):
    UNVERIFIED = "unverified"
    VERIFIED = "verified"
    DISPROVED = "disproved"


status_map = {
    Status.UNVERIFIED: None,
    Status.VERIFIED: True,
    Status.DISPROVED: False
}


@router.put("/change-model")
async def change_model_path(model_name: str, model_format: str, admin: Annotated[AdminAccounts, Depends(get_current_user)]):
    try:
        # Check if the model file exists
        model_path = os.path.join(MODEL_DIR, f"{model_name}.{model_format}")
        if not os.path.isfile(model_path):
            raise HTTPException(
                status_code=400, detail="Model file does not exist")

        # Copy to current_model.pt
        update_env_variable("MODEL_NAME", model_name)
        update_env_variable("MODEL_FORMAT", model_format)

        return {"status": "success", "message": f"Model changed successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/verify-data")
async def verify_data(data_id: int, admin: Annotated[AdminAccounts, Depends(get_current_user)], db: AsyncSession = Depends(get_db)):
    admin_login = admin.login_name

    try:
        result = await db.execute(select(UserContributedData).where(
            UserContributedData.data_id == data_id,
            UserContributedData.is_verified.is_(None)
        ))
        data = result.scalars().first()

        if not data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data {data_id} not found or already verified"
            )

        data.is_verified = True
        data.verified_by = admin_login
        await db.commit()

        return {
            "status": "success",
            "message": f"Data {data_id} verified by {admin_login}"
        }
    except HTTPException as he:
        await db.rollback()
        raise he
    except Exception as e:
        await db.rollback()
        print(f"Error in verify_data: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/verify-response")
async def verify_response(response_id: int, admin: Annotated[AdminAccounts, Depends(get_current_user)], db: AsyncSession = Depends(get_db)):
    admin_login = admin.login_name

    try:
        result = await db.execute(select(UserResponses).where(
            UserResponses.response_id == response_id,
            UserResponses.is_verified.is_(None)
        ))
        data = result.scalars().first()

        if not data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Response {response_id} not found or already verified"
            )

        data.is_verified = True
        data.verified_by = admin_login
        await db.commit()

        return {
            "status": "success",
            "message": f"Response {response_id} verified by {admin_login}"
        }
    except HTTPException as he:
        await db.rollback()
        raise he
    except Exception as e:
        await db.rollback()
        print(f"Error in verify_response: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/disprove-data")
async def disprove_data(data_id: int, admin: Annotated[AdminAccounts, Depends(get_current_user)], db: AsyncSession = Depends(get_db)):
    admin_login = admin.login_name

    try:
        result = await db.execute(select(UserContributedData).where(
            UserContributedData.data_id == data_id,
            UserContributedData.is_verified.is_(None)
        ))
        data = result.scalars().first()

        if not data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data {data_id} not found or already verified"
            )

        data.is_verified = False
        data.verified_by = admin_login
        await db.commit()

        return {
            "status": "success",
            "message": f"Data {data_id} disproved by {admin_login}"
        }
    except HTTPException as he:
        await db.rollback()
        raise he
    except Exception as e:
        await db.rollback()
        print(f"Error in disprove_data: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/disprove-response")
async def disprove_response(response_id: int, admin: Annotated[AdminAccounts, Depends(get_current_user)], db: AsyncSession = Depends(get_db)):
    admin_login = admin.login_name

    try:
        result = await db.execute(select(UserResponses).where(
            UserResponses.response_id == response_id,
            UserResponses.is_verified.is_(None)
        ))
        data = result.scalars().first()

        if not data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Response {response_id} not found or already verified"
            )

        data.is_verified = False
        data.verified_by = admin_login
        await db.commit()
        return {
            "status": "success",
            "message": f"Response {response_id} disproved by {admin_login}"
        }
    except HTTPException as he:
        await db.rollback()
        raise he
    except Exception as e:
        await db.rollback()
        print(f"Error in disprove_response: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/get-data/{status}")
async def get_data(admin: Annotated[AdminAccounts, Depends(get_current_user)], status: Status,  db: AsyncSession = Depends(get_db)):
    try:
        results = await db.execute(select(UserContributedData).where(UserContributedData.is_verified.is_(status_map[status])))
        datas = results.scalars().all()
        data_list = [
            {
                "data_id": data.data_id,
                "image": data.image_path,
                "labels": json.loads(data.labels),
                "added_at": data.added_at
            }
            for data in datas
        ]
        return data_list
    except Exception as e:
        return {"error": str(e)}


@router.get("/admin/get-response/{status}")
async def get_response(admin: Annotated[AdminAccounts, Depends(get_current_user)], status: Status,  db: AsyncSession = Depends(get_db)):
    try:
        results = await db.execute(select(UserResponses).where(UserResponses.is_verified.is_(status_map[status])))
        datas = results.scalars().all()
        data_list = [
            {
                "response_id": data.response_id,
                "image": data.image_path,
                "is_right": data.is_right,
                "comment": data.comment,
                "model_used": data.model_used,
                "added_at": data.added_at
            }
            for data in datas
        ]
        return data_list
    except Exception as e:
        return {"error": str(e)}


@router.delete("/delete-disproved-data")
async def delete_disproved_data(admin: Annotated[AdminAccounts, Depends(get_current_user)], db: AsyncSession = Depends(get_db)):
    try:
        results = await db.execute(select(UserContributedData).where(UserContributedData.is_verified == False))
        datas = results.scalars().all()
        for data in datas:
            os.remove(os.path.join(IMG_DIR, data.image_path))
            await db.delete(data)
        await db.commit()
        return {"status": "success", "message": "All disproved data deleted"}
    except Exception as e:
        return {"error": str(e)}


@router.delete("/delete-disproved-response")
async def delete_disproved_response(admin: Annotated[AdminAccounts, Depends(get_current_user)], db: AsyncSession = Depends(get_db)):
    try:
        results = await db.execute(select(UserResponses).where(UserResponses.is_verified == False))
        datas = results.scalars().all()
        for data in datas:
            os.remove(os.path.join(IMG_DIR, data.image_path))
            await db.delete(data)
        await db.commit()
        return {"status": "success", "message": "All disproved responses deleted"}
    except Exception as e:
        return {"error": str(e)}
