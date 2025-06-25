from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class Role(str, Enum):
    manager = "manager"
    employee = "employee"

class Sentiment(str, Enum):
    positive = "positive"
    neutral = "neutral"
    negative = "negative"

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str
    role: Role
    manager_id: Optional[int]

class UserOut(UserBase):
    id: int
    name: str
    email: str
    role: Role
    class Config:
        orm_mode = True

class ManagerOut(BaseModel):
    id: int
    name: Optional[str] = None
    email: str

    class Config:
        orm_mode = True

class FeedbackBase(BaseModel):
    strengths: str
    improvements: str
    sentiment: Sentiment
    anonymous: bool = False

class FeedbackCreate(FeedbackBase):
    employee_id: int

class FeedbackCommentOut(BaseModel):
    id: int
    commenter_id: int
    comments: str
    created_at: datetime

    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat() + "Z" if v.tzinfo is None else v.isoformat()
        }

class FeedbackOut(FeedbackBase):
    id: int
    strengths: str
    improvements: str
    sentiment: str
    acknowledged: bool
    employee: UserOut
    manager: UserOut
    manager_id: int
    employee_id: int
    created_at: datetime
    comments: list[FeedbackCommentOut] = []
    class Config:
        orm_mode = True

class FeedbackUpdate(BaseModel):
    strengths: Optional[str]
    improvements: Optional[str]
    sentiment: Optional[str]

class FeedbackRequestCreate(BaseModel):
    manager_id: int

class FeedbackRequestOut(BaseModel):
    id: int
    employee_id: int
    manager_id: int
    status: str

    class Config:
        orm_mode = True

class CommentBody(BaseModel):
    comments: str
