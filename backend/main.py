from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from trash_detection import init_model
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func, delete, update
from models import adminAccounts, userContributedData, userResponses, webStatistics
from database import Base, engine
from config import MODEL_NAME

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://your-frontend-domain.com"
]


@app.on_event("startup")
async def startup_event():
    # create a new database if there is none
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    model_path = f"./model/{MODEL_NAME}.pt"
    init_model(model_path)

from routers import router

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(router, prefix='', tags=['files'])