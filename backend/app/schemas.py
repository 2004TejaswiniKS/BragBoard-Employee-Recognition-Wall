from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    employee = "employee"
    admin = "admin"

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    department: str
    role: RoleEnum = RoleEnum.employee

class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    department: Optional[str]
    role: RoleEnum
    joined_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ShoutoutCreate(BaseModel):
    message: str
    recipient_ids: List[int]
    department: Optional[str]

class ShoutoutOut(BaseModel):
    id: int
    message: str
    sender_name: str
    sender_department: Optional[str]
    recipients: List[str]
    department: Optional[str]
    created_at: datetime

class ReactionCreate(BaseModel):
    reaction: str

class CommentCreate(BaseModel):
    comment: str

class CommentOut(BaseModel):
    id: int
    user_name: str
    department: Optional[str]
    comment: str
    created_at: datetime

class ReportCreate(BaseModel):
    reason: str

class ShoutoutMini(BaseModel):
    content: str
    posted_by: str
    posted_by_email: str | None
    department: str | None = None

    class Config:
        orm_mode = True

class ReportOut(BaseModel):
    id: int
    shoutout_id: int
    reported_by: str
    reported_by_email: str | None
    reason: str
    created_at: datetime
    shoutout: ShoutoutMini | None

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    department: str
    role: str