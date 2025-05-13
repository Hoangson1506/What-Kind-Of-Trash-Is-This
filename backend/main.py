from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func, delete, update
from models import adminAccounts, userContributedData, userResponses, webStatistics
from database import Base, engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import inference_routers, admin_routers
from trash_detection import init_model
from database import Base, engine
from config import MODEL_NAME, MODEL_DIR
import os

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
    model_path = os.path.join(MODEL_DIR, f"{MODEL_NAME}.pt")
    if not os.path.isfile(model_path):
        raise Exception(f"Model file {model_path} does not exist")
    init_model(model_path)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(inference_routers.router, prefix='', tags=['files'])
app.include_router(admin_routers.router, prefix='/admin', tags=['admin'])
app.mount("/images", StaticFiles(directory="images"), name="static")
