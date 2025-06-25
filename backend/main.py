from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from backend.database import base, engine
from backend.routers import users, feedback
from fastapi.middleware.cors import CORSMiddleware

base.metadata.create_all(bind=engine)
app = FastAPI()
app.include_router(users.router)
app.include_router(feedback.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
