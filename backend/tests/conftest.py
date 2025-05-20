import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from db import Base, get_db  # to override

# Use SQLite in-memory for tests, the databse will be stored in RAM
DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(DATABASE_URL)
TestingSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# Create tables before tests run


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Provide session override


async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session
