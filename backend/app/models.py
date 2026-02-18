from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .db import Base
import enum

class RoleEnum(enum.Enum):
    employee = "employee"
    admin = "admin"

class ReactionType(enum.Enum):
    like = "like"
    clap = "clap"
    love = "love"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    department = Column(String(100))
    role = Column(Enum(RoleEnum), default=RoleEnum.employee)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    sent_shoutouts = relationship("Shoutout", back_populates="sender")

class Shoutout(Base):
    __tablename__ = "shoutouts"

    id = Column(Integer, primary_key=True)
    message = Column(Text, nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"))
    department = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("User", back_populates="sent_shoutouts")
    recipients = relationship("ShoutoutRecipient", back_populates="shoutout")
   

class ShoutoutRecipient(Base):
    __tablename__ = "shoutout_recipients"

    id = Column(Integer, primary_key=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    shoutout = relationship("Shoutout", back_populates="recipients")
    user = relationship("User")

class ShoutoutReaction(Base):
    __tablename__ = "shoutout_reactions"

    id = Column(Integer, primary_key=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    reaction = Column(Enum(ReactionType), nullable=False)

    user = relationship("User")

class ShoutoutComment(Base):
    __tablename__ = "shoutout_comments"

    id = Column(Integer, primary_key=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
class ShoutoutReport(Base):
    __tablename__ = "shoutout_reports"

    id = Column(Integer, primary_key=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id", ondelete="CASCADE"))
    reported_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    shoutout = relationship("Shoutout")
    reporter = relationship("User")