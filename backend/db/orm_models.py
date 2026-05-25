from sqlalchemy import Column, String, JSON, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
import datetime

from backend.db.postgres import Base

class CommandSession(Base):
    __tablename__ = "command_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    command_text = Column(Text, nullable=False)

    status = Column(String(50), default="pending")

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    session_id = Column(UUID(as_uuid=True), nullable=False)

    intent_json = Column(JSON)

    outcome = Column(String(50))

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )
