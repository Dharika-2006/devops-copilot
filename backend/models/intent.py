from pydantic import BaseModel
from typing import Literal, Optional

class IntentSpec(BaseModel):
    action: Literal[
    "scale",
    "deploy",
    "rollback",
    "add_service",
    "remove_service",
    "update_config",
    "restart",
    "delete",
    "expose",
    "pause",
    "resume",
    "get_status" 
    ]
    
    target_type: Literal["deployment","service","configmap","ingress","pod"]
    target_name: str
    namespace: str = "default"
    parameters: dict
    risk_level: Literal["low","medium","high"]

class CommandRequest(BaseModel):
    command: str
    session_id: Optional[str] = None

class CommandResponse(BaseModel):
    session_id: str
    status: str
    intent: Optional[IntentSpec] = None
    error: Optional[str] = None
