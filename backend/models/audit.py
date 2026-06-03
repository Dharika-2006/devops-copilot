from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditLog(BaseModel):
    session_id: str
    intent_json: dict
    outcome: str
    created_at: Optional[datetime] = None
