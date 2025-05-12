from pydantic import BaseModel


class ImageRequest(BaseModel):
    image: str # base64 string