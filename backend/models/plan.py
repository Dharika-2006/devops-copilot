from pydantic import BaseModel
from typing import Optional, List
from models.intent import IntentSpec

class ManifestDiff(BaseModel):
    field: str
    before: str
    after: str

class ExecutionPlan(BaseModel):
    session_id: str
    intent: IntentSpec
    manifest_yaml: str
    diffs: List[ManifestDiff]
    estimated_duration_seconds: int = 30
    dry_run: bool = False

class SafetyDecision(BaseModel):
    approved: bool
    violations: List[str]
    token: Optional[str] = None

class PipelineState(BaseModel):
    session_id: str
    command: str
    intent: Optional[IntentSpec] = None
    plan: Optional[ExecutionPlan] = None
    safety: Optional[SafetyDecision] = None
    approval_token: Optional[str] = None
    outcome: Optional[str] = None
    error: Optional[str] = None