import pytest
from httpx import AsyncClient, ASGITransport
from backend.tests.conftest import override_get_db
from db import get_db
from models.adminAccounts import AdminAccounts
from auth import get_hashed_password
from main import app

# Override DB dependency with test DB
app.dependency_overrides[get_db] = override_get_db

# Default signup case
@pytest.mark.asyncio
async def test_admin_signup_1():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        payload = {
            "username": "minhtuuse",
            "password": "minhtuuse"
        }
        response = await ac.post("/auth/signup", json=payload)
        assert response.status_code == 200
        assert response.json()['message'] == "User created successfully"

# duplicate username case
@pytest.mark.asyncio
async def test_admin_signup_2():
    # create faker user in db
    async for db in override_get_db():
        existing_account = AdminAccounts(
            login_name = 'minhtuusea',
            hashed_password = get_hashed_password("minhtuusea")
        )
        db.add(existing_account)
        await db.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        payload = {
            "username": "minhtuusea",
            "password": "minhtuusea"
        }
        response = await ac.post("/auth/signup", json=payload)
        assert response.status_code == 400
        assert response.json()["detail"] == "Username already exists"

# No password case
@pytest.mark.asyncio
async def test_admin_signup_3():
    transport = ASGITransport(app=app) 
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        payload = {
            "username": "minhtuuse",
            "password": None
        }
        response = await ac.post("/auth/signup", json=payload)
        assert response.status_code == 422

# No username case
@pytest.mark.asyncio
async def test_admin_signup_4():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        payload = {
            "username": None,
            "password": "minhtuuse"
        }
        response = await ac.post("/auth/signup", json=payload)
        assert response.status_code == 422

# Default login case
@pytest.mark.asyncio
async def test_admin_login_1():
    # Create faker user in db
    async for db in override_get_db():
        existing_account = AdminAccounts(
            login_name = 'minhtuuseb',
            hashed_password = get_hashed_password("minhtuuseb")
        )
        db.add(existing_account)
        await db.commit()
        
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        response = await ac.post(
            "/auth/admin/login",
            data={"username": "minhtuuseb", "password": "minhtuuseb"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 200

# Wrong password case
@pytest.mark.asyncio
async def test_admin_login_2():
    # Create faker user in db
    async for db in override_get_db():
        existing_account = AdminAccounts(
            login_name = 'minhtuusec',
            hashed_password = get_hashed_password("minhtuusec")
        )
        db.add(existing_account)
        await db.commit()
        
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        response = await ac.post(
            "/auth/admin/login",
            data={"username": "minhtuusec", "password": "minhtuused"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 401
        assert response.json()['detail'] == "Incorrect password! Please try again!"

# username doesn't exist case
@pytest.mark.asyncio
async def test_admin_login_3():
    # Create faker user in db
    async for db in override_get_db():
        existing_account = AdminAccounts(
            login_name = 'minhtuused',
            hashed_password = get_hashed_password("minhtuused")
        )
        db.add(existing_account)
        await db.commit()
        
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        response = await ac.post(
            "/auth/admin/login",
            data={"username": "not_minhtuuse", "password": "minhtuused"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 401
        assert response.json()['detail'] == "Can't find user! Please sign up!"

# Default get current user case
@pytest.mark.asyncio
async def test_get_current_user_1():
    # Create fake user in test DB
    async for db in override_get_db():
        existing_account = AdminAccounts(
            login_name = 'minhtuusee',
            hashed_password = get_hashed_password("minhtuusee")
        )
        db.add(existing_account)
        await db.commit()

    # Login to get token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        response = await ac.post(
            "/auth/admin/login",
            data={"username": "minhtuusee", "password": "minhtuusee"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 200
        token = response.json()["access_token"]

        # Use token to access protected route
        auth_headers = {"Authorization": f"Bearer {token}"}
        response = await ac.get("/auth/users/me", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["username"] == "minhtuusee"

# Wrong token case
@pytest.mark.asyncio
async def test_get_current_user_2():
    # Create fake user in test DB
    async for db in override_get_db():
        existing_account = AdminAccounts(
            login_name = 'minhtuusef',
            hashed_password = get_hashed_password("minhtuusef")
        )
        db.add(existing_account)
        await db.commit()

    # Login to get token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        response = await ac.post(
            "/auth/admin/login",
            data={"username": "minhtuusef", "password": "minhtuusef"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 200
        token = response.json()["access_token"]

        # Use token to access protected route
        auth_headers = {"Authorization": f"Bearer clearly_not_the_token"}
        response = await ac.get("/auth/users/me", headers=auth_headers)
        assert response.status_code == 401