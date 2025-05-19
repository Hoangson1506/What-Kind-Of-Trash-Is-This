import pytest
import base64
import json
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport
from pathlib import Path
from unittest.mock import patch
import os
from PIL import Image
from models.adminAccounts import AdminAccounts
from models.userContributedData import UserContributedData
from models.userResponses import UserResponses
from models.webStatistics import WebStatistics
from sqlalchemy.ext.asyncio import AsyncSession
from backend.tests.conftest import override_get_db
from db import get_db
from trash_detection import detect_with_model, init_model
from config import MODEL_DIR, MODEL_NAME, MODEL_FORMAT
from main import app  # import FastAPI app

# Override DB dependency with test DB
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# init model for inference
model_path = os.path.join(MODEL_DIR, f"{MODEL_NAME}.{MODEL_FORMAT}")
if not os.path.isfile(model_path):
    raise Exception(f"Model file {model_path} does not exist")
init_model(model_path)

def test_inference_image_1():
    image_path = Path("frontend/src/assets/HoangSon.jpg")
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode("utf-8")

    data_url = f"data:image/jpeg;base64,{encoded_string}" # format as data URL
    
    response = client.post("/inference/image", json={"image": data_url})

    assert response.status_code == 200
    json_data = response.json()
    assert "processedImage" in json_data
    assert "detections" in json_data
    assert isinstance(json_data["detections"], list)

def test_inference_image_2():
    response = client.post("/inference/image", json={"image": ""})

    assert response.status_code == 400
    json_data = response.json()
    assert "detail" in json_data

def test_inference_image_3():
    response = client.post("/inference/image", json={})

    assert response.status_code in (400, 422)
    json_data = response.json()
    assert "detail" in json_data 

def test_inference_image_4():

    data_url = f"data:image/jpeg;base64,this_is_clearly_not_base64!!!" # format as data URL
    
    response = client.post("/inference/image", json={"image": data_url})

    assert response.status_code == 400
    json_data = response.json()
    assert "error" in json_data or "detail" in json_data

def test_inference_video_websocket():
    # Load and encode an image
    image_path = Path("frontend/src/assets/HoangSon.jpg")
    with open(image_path, "rb") as f:
        base64_image = base64.b64encode(f.read()).decode("utf-8")
    
    data_url = f"data:image/jpeg;base64,{base64_image}"
    message = json.dumps({"image": data_url})

    with client.websocket_connect("/inference/ws") as websocket:
        websocket.send_text(message)

        response = websocket.receive_json()

        assert "processedImage" in response
        assert "detections" in response
        assert isinstance(response["detections"], list)

@patch("routers.user_routers.save_base64_image", return_value="test_path.jpg")
@pytest.mark.asyncio
async def test_save_user_response_1(mock_save_image):
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        image_path = Path("frontend/src/assets/HoangSon.jpg")
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

@patch("routers.user_routers.save_base64_image", return_value="test_path.jpg")
@pytest.mark.asyncio
async def test_save_user_response_2(mock_save_image):
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        image_path = Path("frontend/src/assets/HoangSon.jpg")
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

@patch("routers.user_routers.save_base64_image", return_value="test_path.jpg")
@pytest.mark.asyncio
async def test_save_user_data_1(mock_save_image):
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        image_path = Path("frontend/src/assets/HoangSon.jpg")
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