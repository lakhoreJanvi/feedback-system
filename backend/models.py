from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy import func
from datetime import datetime
from backend.database import base 
import enum 

class Role(str, enum.Enum):
    manager = "manager"
    employee = "employee"

class Sentiment(str, enum.Enum):
    positive = "positive"
    neutral = "neutral"
    negative = "negative"

class User(base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    hashed_password = Column(String)
    role = Column(Enum(Role))
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    team = relationship("User", backref="manager", remote_side=[id])
    feedbacks_received = relationship("Feedback",foreign_keys="Feedback.employee_id",back_populates="employee")
    feedbacks_given = relationship("Feedback", back_populates="manager", foreign_keys='Feedback.manager_id')

class Feedback(base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True)
    manager_id = Column(Integer, ForeignKey("users.id"))
    employee_id = Column(Integer, ForeignKey("users.id"))
    strengths = Column(Text)
    improvements = Column(Text)
    sentiment = Column(Enum(Sentiment))
    created_at = Column(DateTime, default=datetime.utcnow)
    acknowledged = Column(Boolean, default=False)
    comments = relationship("FeedbackComment", back_populates="feedback", cascade="all, delete-orphan")
    manager = relationship("User", foreign_keys=[manager_id], back_populates="feedbacks_given")
    employee = relationship("User", foreign_keys=[employee_id], back_populates="feedbacks_received")

class FeedbackRequest(base):
    __tablename__ = "feedback_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    manager_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")
    timestamp = Column(DateTime, default=datetime.utcnow)
    employee = relationship("User", foreign_keys=[employee_id])
    manager = relationship("User", foreign_keys=[manager_id])

class FeedbackComment(base):
    __tablename__ = "feedback_comments"
    id = Column(Integer, primary_key=True)
    feedback_id = Column(Integer, ForeignKey("feedback.id"))
    commenter_id = Column(Integer, ForeignKey("users.id"))
    comments = Column(Text, nullable=True)
    feedback = relationship("Feedback", back_populates="comments")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
