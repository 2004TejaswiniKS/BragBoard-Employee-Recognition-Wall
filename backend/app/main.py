from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, shoutouts, admin
from .db import engine
from .models import Base

app = FastAPI(title="BragBoard Backend")

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(shoutouts.router)
app.include_router(admin.router, prefix="/api/admin")

@app.get("/")
def root():
    return {"msg": "BragBoard backend running"}
