import jwt, hashlib, json, time
from models.plan import ExecutionPlan, SafetyDecision
from policies.policy_engine import PolicyEngine
from config import settings

policy_engine = PolicyEngine()

class SafetyAgent:
    async def run(self, session_id: str, plan: ExecutionPlan) -> SafetyDecision:
        violations = policy_engine.evaluate(plan)
        if violations:
            return SafetyDecision(approved=False, violations=violations, token=None)
        token = self._sign_approval(session_id, plan)
        return SafetyDecision(approved=True, violations=[], token=token)

    def _sign_approval(self, session_id: str, plan: ExecutionPlan) -> str:
        plan_hash = hashlib.sha256(
            json.dumps(plan.model_dump(), sort_keys=True, default=str).encode()
        ).hexdigest()
        payload = {
            'session_id': session_id,
            'plan_hash': plan_hash,
            'approved_at': time.time(),
            'exp': time.time() + 60,
            'iss': 'safety_agent'
        }
        return jwt.encode(payload, settings.safety_agent_secret, algorithm='HS256')

safety_agent = SafetyAgent()