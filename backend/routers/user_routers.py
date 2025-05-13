from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.userContributedData import UserContributedData
from models.userResponses import UserResponses
from schemas import UserResponse, UserLabeledData
import json
import traceback
import logging
from utils import save_base64_image
from config import MODEL_NAME

router = APIRouter()
logger = logging.getLogger(__name__)


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
