import jwt, hashlib, json
from models.plan import ExecutionPlan
from services.k8s_client import KubernetesClient
from config import settings

k8s = KubernetesClient()

class ExecutorAgent:
    def _verify_token(self, token, plan, session_id):
        try:
            payload = jwt.decode(token, settings.safety_agent_secret, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise PermissionError('Safety approval token expired')
        except jwt.InvalidTokenError:
            raise PermissionError('Invalid safety token')
        if payload['session_id'] != session_id:
            raise PermissionError('Token session mismatch')
        expected = hashlib.sha256(
            json.dumps(plan.model_dump(), sort_keys=True, default=str).encode()
        ).hexdigest()
        if payload['plan_hash'] != expected:
            raise PermissionError('Plan was modified after approval')

    async def run(self, session_id, plan: ExecutionPlan, approval_token: str):
        self._verify_token(approval_token, plan, session_id)
        action = plan.intent.action
        if action == 'scale':
            replicas = plan.intent.parameters['replicas']
            return await k8s.scale_deployment(plan.intent.target_name, plan.intent.namespace, replicas)
        return {'status': 'unsupported', 'action': action}

executor_agent = ExecutorAgent()