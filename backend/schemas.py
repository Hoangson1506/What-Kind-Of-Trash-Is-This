from pydantic import BaseModel
from typing import Optional, List, Tuple


class ImageRequest(BaseModel):
    image: str  # base64 string


class UserResponse(BaseModel):
    imageId: str
    originalImage: str  # base64 string
    isCorrect: bool
    comment: Optional[str] = None


class LabelData(BaseModel):
    trashType: str
    bbox: Tuple[float, float, float, float]  # [x1, y1, x2, y2]


class UserLabeledData(BaseModel):
    image: str  # base64 string
    labels: List[LabelData]
