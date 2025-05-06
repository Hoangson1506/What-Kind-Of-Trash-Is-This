from fastapi import FastAPI
from routers import router
from fastapi.middleware.cors import CORSMiddleware
from trash_detection import init_model

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://your-frontend-domain.com"
]


@app.on_event("startup")
async def startup_event():
    model_path = "./v8n_73_516/best.pt"
    init_model(model_path)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(router, prefix='', tags=['files'])
