import pytest
import base64
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch
from pathlib import Path
from backend.tests.conftest import override_get_db
from db import get_db
from main import app  # import FastAPI app

# Override DB dependency with test DB
app.dependency_overrides[get_db] = override_get_db

# Default save response case
@patch("routers.user_routers.save_base64_image", return_value="test_path.jpg") # This is to avoid saving the test image
@pytest.mark.asyncio
async def test_save_user_response_1(mock_save_image):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        image_path = Path("backend/tests/HoangSon.jpg")
        with open(image_path, "rb") as f:
            image_b64 = base64.b64encode(f.read()).decode("utf-8")
        
        payload = {
            "originalImage": f"data:image/jpeg;base64,{image_b64}",
            "imageId": "test_image_123",
            "isCorrect": True,
            "comment": "Dep trai day"
        }
        
        response = await ac.post("/user/save-user-response", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

# Wrong type isCorrect (not Boolean) case
@patch("routers.user_routers.save_base64_image", return_value="test_path.jpg")
@pytest.mark.asyncio
async def test_save_user_response_2(mock_save_image):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        image_path = Path("backend/tests/HoangSon.jpg")
        with open(image_path, "rb") as f:
            image_b64 = base64.b64encode(f.read()).decode("utf-8")
        
        payload = {
            "originalImage": f"data:image/jpeg;base64,{image_b64}",
            "imageId": "test_image_1",
            "isCorrect": "abc",
            "comment": "Dep trai day"
        }
        
        response = await ac.post("/user/save-user-response", json=payload)
        assert response.status_code == 422

# Default save user data case
@patch("routers.user_routers.save_base64_image", return_value="test_path.jpg")
@pytest.mark.asyncio
async def test_save_user_data_1(mock_save_image):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        image_path = Path("backend/tests/HoangSon.jpg")
        with open(image_path, "rb") as f:
            image_b64 = base64.b64encode(f.read()).decode("utf-8")
        
        payload = {
            "image": f"data:image/jpeg;base64,{image_b64}",
            "labels": [
                {
                "trashType": "plastic",
                "bbox": [10.0, 20.0, 50.0, 60.0]
                }
            ]
        }
        
        response = await ac.post("/user/save-user-data", json=payload)
        assert response.status_code == 200
        assert response.json()["status"] == "success"

# No image case
@patch("routers.user_routers.save_base64_image", return_value="test_path.jpg")
@pytest.mark.asyncio
async def test_save_user_data_2(mock_save_image):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        payload = {
            "image": None,
            "labels": [
                {
                "trashType": "plastic",
                "bbox": [10.0, 20.0, 50.0, 60.0]
                }
            ]
        }
        
        response = await ac.post("/user/save-user-data", json=payload)
        assert response.status_code == 422