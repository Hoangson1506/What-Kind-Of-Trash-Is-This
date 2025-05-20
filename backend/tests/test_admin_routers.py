import pytest
import json
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch
from sqlalchemy.future import select
from backend.tests.conftest import override_get_db
from db import get_db
from auth import get_hashed_password
from models.adminAccounts import AdminAccounts
from models.userContributedData import UserContributedData
from models.userResponses import UserResponses
from schemas import LabelData
from main import app

# Override DB dependency with test DB
app.dependency_overrides[get_db] = override_get_db

# Default change model path case
@patch("routers.admin_routers.update_env_variable")
@pytest.mark.asyncio
async def test_change_model_path_1(mock_update_env_variable):
    model_name = "best"
    model_format = "pt"

    # Create fake user
    async for db in override_get_db():
        admin = AdminAccounts(
            login_name="minhtuuseg", 
            hashed_password=get_hashed_password("minhtuuseg")
        )
        db.add(admin)
        await db.commit()

    # Login to get token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.post("/auth/admin/login", data={
            "username": "minhtuuseg",
            "password": "minhtuuseg"
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        token = res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        response = await ac.put(
            "/admin/change-model",
            params={"model_name": model_name, "model_format": model_format},
            headers=headers
        )

        # Assert
        assert response.status_code == 200
        assert response.json()["status"] == "success"

# model doesn't exist case
@patch("routers.admin_routers.update_env_variable")
@pytest.mark.asyncio
async def test_change_model_path_2(mock_update_env_variable):
    model_name = "minhtu"
    model_format = "use"

    # Create fake user
    async for db in override_get_db():
        admin = AdminAccounts(
            login_name="minhtuuseh", 
            hashed_password=get_hashed_password("minhtuuseh")
        )
        db.add(admin)
        await db.commit()

    # Login to get token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.post("/auth/admin/login", data={
            "username": "minhtuuseh",
            "password": "minhtuuseh"
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        token = res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        response = await ac.put(
            "/admin/change-model",
            params={"model_name": model_name, "model_format": model_format},
            headers=headers
        )

        # Assert
        assert response.status_code == 400
        assert response.json()["detail"] == "Model file does not exist"

# Default verify data case
@pytest.mark.asyncio
async def test_verify_data_1():
    # Create fake unverified data and fake admin
    async for db in override_get_db():
        labels = [
            LabelData(trashType="plastic", bbox=(10.0, 20.0, 50.0, 60.0))
        ]
        data = UserContributedData(
            data_id=1,
            image_path = "HoangSon.jpg",
            labels = json.dumps([label.model_dump() for label in labels])    
        )
        db.add(data)
        admin = AdminAccounts(
            login_name="minhtuusei", 
            hashed_password=get_hashed_password("minhtuusei")
        )
        db.add(admin)
        await db.commit()
    
    # Login to get token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.post("/auth/admin/login", data={
            "username": "minhtuusei",
            "password": "minhtuusei"
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        token = res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        response = await ac.put(
            "/admin/verify-data",
            params={"data_id": 1},
            headers=headers
        )
    
    # Assert
    assert response.status_code == 200
    assert response.json()['status'] == "success"
    assert response.json()['message'] == "Data 1 verified by minhtuusei"

    # Double check, cuz why not
    result = await db.execute(select(UserContributedData).where(UserContributedData.data_id == 1))
    verified_data = result.scalars().first()
    assert verified_data.is_verified == True
    assert verified_data.verifier.login_name == "minhtuusei"

# data not found case
@pytest.mark.asyncio
async def test_verify_data_2():
    # Create fake admin
    async for db in override_get_db():
        admin = AdminAccounts(
            login_name="minhtuusej", 
            hashed_password=get_hashed_password("minhtuusej")
        )
        db.add(admin)
        await db.commit()
    
    # Login to get token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.post("/auth/admin/login", data={
            "username": "minhtuusej",
            "password": "minhtuusej"
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        token = res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        response = await ac.put(
            "/admin/verify-data",
            params={"data_id": 0},
            headers=headers
        )
    
    # Assert
    assert response.status_code == 404
    assert response.json()['detail'] == "Data 0 not found or already verified"

# data already verified case
@pytest.mark.asyncio
async def test_verify_data_3():
    # Create fake unverified data and fake admin
    async for db in override_get_db():
        labels = [
            LabelData(trashType="plastic", bbox=(10.0, 20.0, 50.0, 60.0))
        ]
        data = UserContributedData(
            data_id=2,
            image_path="HoangSon.jpg",
            labels=json.dumps([label.model_dump() for label in labels]),
            is_verified=True
        )
        db.add(data)
        admin = AdminAccounts(
            login_name="minhtuusek", 
            hashed_password=get_hashed_password("minhtuusek")
        )
        db.add(admin)
        await db.commit()
    
    # Login to get token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.post("/auth/admin/login", data={
            "username": "minhtuusek",
            "password": "minhtuusek"
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        token = res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        response = await ac.put(
            "/admin/verify-data",
            params={"data_id": 2},
            headers=headers
        )
    
    # Assert
    assert response.status_code == 404
    assert response.json()['detail'] == "Data 2 not found or already verified"

# Default verify response case
@pytest.mark.asyncio
async def test_verify_response_1():
    # Create fake unverified response and fake admin
    async for db in override_get_db():
        user_response = UserResponses(
            response_id=1,
            image_path = "HoangSon.jpg",
            model_used="minhtuuse",
            is_right=True,
            comment="qua chuan chi"   
        )
        db.add(user_response)
        admin = AdminAccounts(
            login_name="minhtuusel", 
            hashed_password=get_hashed_password("minhtuusel")
        )
        db.add(admin)
        await db.commit()
    
    # Login to get token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.post("/auth/admin/login", data={
            "username": "minhtuusel",
            "password": "minhtuusel"
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        token = res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        response = await ac.put(
            "/admin/verify-response",
            params={"response_id": 1},
            headers=headers
        )
    
    # Assert
    assert response.status_code == 200
    assert response.json()['status'] == "success"
    assert response.json()['message'] == "Response 1 verified by minhtuusel"

    # Double check, cuz why not
    result = await db.execute(select(UserResponses).where(UserResponses.response_id == 1))
    verified_response = result.scalars().first()
    assert verified_response.is_verified == True
    assert verified_response.verifier.login_name == "minhtuusel"

# response not found case
@pytest.mark.asyncio
async def test_verify_response_2():
    # Createfake admin
    async for db in override_get_db():
        admin = AdminAccounts(
            login_name="minhtuusem", 
            hashed_password=get_hashed_password("minhtuusem")
        )
        db.add(admin)
        await db.commit()
    
    # Login to get token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.post("/auth/admin/login", data={
            "username": "minhtuusem",
            "password": "minhtuusem"
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        token = res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        response = await ac.put(
            "/admin/verify-response",
            params={"response_id": 0},
            headers=headers
        )
    
    # Assert
    assert response.status_code == 404
    assert response.json()['detail'] == "Response 0 not found or already verified"

# response already verified case
@pytest.mark.asyncio
async def test_verify_response_3():
    # Create fake verified response and fake admin
    async for db in override_get_db():
        user_response = UserResponses(
            response_id=2,
            image_path = "HoangSon.jpg",
            model_used="minhtuuse",
            is_right=True,
            comment="qua chuan chi",
            is_verified=True
        )
        db.add(user_response)
        admin = AdminAccounts(
            login_name="minhtuusen", 
            hashed_password=get_hashed_password("minhtuusen")
        )
        db.add(admin)
        await db.commit()
    
    # Login to get token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.post("/auth/admin/login", data={
            "username": "minhtuusen",
            "password": "minhtuusen"
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        token = res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        response = await ac.put(
            "/admin/verify-response",
            params={"response_id": 2},
            headers=headers
        )
    
    # Assert
    assert response.status_code == 404
    assert response.json()['detail'] == "Response 2 not found or already verified"

# Default disprove response case
@pytest.mark.asyncio
async def test_disprove_response_1():
    # Create fake unverified response and fake admin
    async for db in override_get_db():
        user_response = UserResponses(
            response_id=3,
            image_path = "HoangSon.jpg",
            model_used="minhtuuse",
            is_right=True,
            comment="qua chuan chi"   
        )
        db.add(user_response)
        admin = AdminAccounts(
            login_name="minhtuuseo", 
            hashed_password=get_hashed_password("minhtuuseo")
        )
        db.add(admin)
        await db.commit()
    
    # Login to get token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.post("/auth/admin/login", data={
            "username": "minhtuuseo",
            "password": "minhtuuseo"
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        token = res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        response = await ac.put(
            "/admin/disprove-response",
            params={"response_id": 3},
            headers=headers
        )
    
    # Assert
    assert response.status_code == 200
    assert response.json()['status'] == "success"
    assert response.json()['message'] == "Response 3 disproved by minhtuuseo"

    # Double check, cuz why not
    result = await db.execute(select(UserResponses).where(UserResponses.response_id == 3))
    verified_response = result.scalars().first()
    assert verified_response.is_verified == False
    assert verified_response.verifier.login_name == "minhtuuseo"

# response not found case
@pytest.mark.asyncio
async def test_disprove_response_2():
    # Createfake admin
    async for db in override_get_db():
        admin = AdminAccounts(
            login_name="minhtuuseq", 
            hashed_password=get_hashed_password("minhtuuseq")
        )
        db.add(admin)
        await db.commit()
    
    # Login to get token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.post("/auth/admin/login", data={
            "username": "minhtuuseq",
            "password": "minhtuuseq"
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        token = res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        response = await ac.put(
            "/admin/disprove-response",
            params={"response_id": 0},
            headers=headers
        )
    
    # Assert
    assert response.status_code == 404
    assert response.json()['detail'] == "Response 0 not found or already verified"

# response already verified case
@pytest.mark.asyncio
async def test_disprove_response_3():
    # Create fake verified response and fake admin
    async for db in override_get_db():
        user_response = UserResponses(
            response_id=4,
            image_path = "HoangSon.jpg",
            model_used="minhtuuse",
            is_right=True,
            comment="qua chuan chi",
            is_verified=False
        )
        db.add(user_response)
        admin = AdminAccounts(
            login_name="minhtuuser", 
            hashed_password=get_hashed_password("minhtuuser")
        )
        db.add(admin)
        await db.commit()
    
    # Login to get token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.post("/auth/admin/login", data={
            "username": "minhtuuser",
            "password": "minhtuuser"
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        token = res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        response = await ac.put(
            "/admin/disprove-response",
            params={"response_id": 4},
            headers=headers
        )
    
    # Assert
    assert response.status_code == 404
    assert response.json()['detail'] == "Response 4 not found or already verified"

# Default disprove data case
@pytest.mark.asyncio
async def test_disprove_data_1():
    # Create fake unverified data and fake admin
    async for db in override_get_db():
        labels = [
            LabelData(trashType="plastic", bbox=(10.0, 20.0, 50.0, 60.0))
        ]
        data = UserContributedData(
            data_id=3,
            image_path = "HoangSon.jpg",
            labels = json.dumps([label.model_dump() for label in labels])    
        )
        db.add(data)
        admin = AdminAccounts(
            login_name="minhtuuses", 
            hashed_password=get_hashed_password("minhtuuses")
        )
        db.add(admin)
        await db.commit()
    
    # Login to get token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.post("/auth/admin/login", data={
            "username": "minhtuuses",
            "password": "minhtuuses"
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        token = res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        response = await ac.put(
            "/admin/disprove-data",
            params={"data_id": 3},
            headers=headers
        )
    
    # Assert
    assert response.status_code == 200
    assert response.json()['status'] == "success"
    assert response.json()['message'] == "Data 3 disproved by minhtuuses"

    # Double check, cuz why not
    result = await db.execute(select(UserContributedData).where(UserContributedData.data_id == 3))
    verified_data = result.scalars().first()
    assert verified_data.is_verified == False
    assert verified_data.verifier.login_name == "minhtuuses"

# data not found case
@pytest.mark.asyncio
async def test_disprove_data_2():
    # Create fake admin
    async for db in override_get_db():
        admin = AdminAccounts(
            login_name="minhtuuset", 
            hashed_password=get_hashed_password("minhtuuset")
        )
        db.add(admin)
        await db.commit()
    
    # Login to get token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.post("/auth/admin/login", data={
            "username": "minhtuuset",
            "password": "minhtuuset"
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        token = res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        response = await ac.put(
            "/admin/disprove-data",
            params={"data_id": 0},
            headers=headers
        )
    
    # Assert
    assert response.status_code == 404
    assert response.json()['detail'] == "Data 0 not found or already verified"

# data already verified case
@pytest.mark.asyncio
async def test_disprove_data_3():
    # Create fake unverified data and fake admin
    async for db in override_get_db():
        labels = [
            LabelData(trashType="plastic", bbox=(10.0, 20.0, 50.0, 60.0))
        ]
        data = UserContributedData(
            data_id=4,
            image_path="HoangSon.jpg",
            labels=json.dumps([label.model_dump() for label in labels]),
            is_verified=True
        )
        db.add(data)
        admin = AdminAccounts(
            login_name="minhtuuseu", 
            hashed_password=get_hashed_password("minhtuuseu")
        )
        db.add(admin)
        await db.commit()
    
    # Login to get token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.post("/auth/admin/login", data={
            "username": "minhtuuseu",
            "password": "minhtuuseu"
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        token = res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        response = await ac.put(
            "/admin/disprove-data",
            params={"data_id": 4},
            headers=headers
        )
    
    # Assert
    assert response.status_code == 404
    assert response.json()['detail'] == "Data 4 not found or already verified"