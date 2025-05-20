import pytest
import os
import json
import base64
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport
from pathlib import Path
from backend.tests.conftest import override_get_db
from db import get_db
from trash_detection import init_model
from config import MODEL_DIR, MODEL_NAME, MODEL_FORMAT
from main import app  # import FastAPI app

# Override DB dependency with test DB
app.dependency_overrides[get_db] = override_get_db

# init model for inference
model_path = os.path.join(MODEL_DIR, f"{MODEL_NAME}.{MODEL_FORMAT}")
if not os.path.isfile(model_path):
    raise Exception(f"Model file {model_path} does not exist")
init_model(model_path)

# Default image inference case
@pytest.mark.asyncio
async def test_inference_image_1():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        image_path = Path("backend/tests/HoangSon.jpg")
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")

        data_url = f"data:image/jpeg;base64,{encoded_string}" # format as data URL
        
        response = await ac.post("/inference/image", json={"image": data_url})

        assert response.status_code == 200
        json_data = response.json()
        assert "processedImage" in json_data
        assert "detections" in json_data
        assert isinstance(json_data["detections"], list)

# Empty image string case
@pytest.mark.asyncio
async def test_inference_image_2():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        response = await ac.post("/inference/image", json={"image": ""})

        assert response.status_code == 400
        json_data = response.json()
        assert "detail" in json_data

# Empty json case
@pytest.mark.asyncio
async def test_inference_image_3():
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        response = await ac.post("/inference/image", json={})

        assert response.status_code in (400, 422)
        json_data = response.json()
        assert "detail" in json_data 

# not base64 format case
@pytest.mark.asyncio
async def test_inference_image_4():
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        data_url = f"data:image/jpeg;base64,this_is_clearly_not_base64!!!" # format as data URL
        
        response = await ac.post("/inference/image", json={"image": data_url})

        assert response.status_code == 400
        json_data = response.json()
        assert "error" in json_data or "detail" in json_data

# Default ws case
def test_inference_video_websocket():
    client = TestClient(app)
    # Load and encode an image
    image_path = Path("backend/tests/HoangSon.jpg")
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