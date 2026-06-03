from backend.models.intent import IntentSpec
from backend.models.plan import (
    ExecutionPlan,
    ManifestDiff,
)


class PlannerAgent:

    async def run(
        self,
        session_id: str,
        intent: IntentSpec
    ) -> ExecutionPlan:

        action = intent.action

        if action == "scale":
            return self._plan_scale(session_id, intent)

        elif action == "deploy":
            return self._plan_deploy(session_id, intent)

        elif action in ["add_service", "expose"]:
            return self._plan_service(session_id, intent)

        elif action == "update_config":
            return self._plan_config(session_id, intent)

        elif action in [
            "rollback",
            "remove_service",
            "restart",
            "delete",
            "pause",
            "resume",
            "get_status"
        ]:
            return self._plan_lifecycle(session_id, intent)

        raise ValueError(f"Unsupported action: {action}")

    def _plan_scale(
        self,
        session_id: str,
        intent: IntentSpec
    ) -> ExecutionPlan:

        replicas = intent.parameters.get("replicas", 1)

        manifest = f"""
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {intent.target_name}
  namespace: {intent.namespace}
spec:
  replicas: {replicas}
""".strip()

        diffs = [
            ManifestDiff(
                field="spec.replicas",
                before="current",
                after=str(replicas)
            )
        ]

        return ExecutionPlan(
            session_id=session_id,
            intent=intent,
            manifest_yaml=manifest,
            diffs=diffs,
            estimated_duration_seconds=15,
            dry_run=False
        )

    def _plan_deploy(
        self,
        session_id: str,
        intent: IntentSpec
    ) -> ExecutionPlan:

        image = intent.parameters.get(
            "image",
            "nginx:latest"
        )

        manifest = f"""
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {intent.target_name}
  namespace: {intent.namespace}
spec:
  template:
    spec:
      containers:
      - name: {intent.target_name}
        image: {image}
""".strip()

        diffs = [
            ManifestDiff(
                field="container.image",
                before="current",
                after=image
            )
        ]

        return ExecutionPlan(
            session_id=session_id,
            intent=intent,
            manifest_yaml=manifest,
            diffs=diffs,
            estimated_duration_seconds=60,
            dry_run=False
        )

    def _plan_service(
        self,
        session_id: str,
        intent: IntentSpec
    ) -> ExecutionPlan:

        port = intent.parameters.get("port", 80)

        manifest = f"""
apiVersion: v1
kind: Service
metadata:
  name: {intent.target_name}
  namespace: {intent.namespace}
spec:
  selector:
    app: {intent.target_name}
  ports:
    - port: {port}
      targetPort: {port}
""".strip()

        diffs = [
            ManifestDiff(
                field="service.port",
                before="none",
                after=str(port)
            )
        ]

        return ExecutionPlan(
            session_id=session_id,
            intent=intent,
            manifest_yaml=manifest,
            diffs=diffs,
            estimated_duration_seconds=20,
            dry_run=False
        )

    def _plan_config(
        self,
        session_id: str,
        intent: IntentSpec
    ) -> ExecutionPlan:

        manifest = f"""
apiVersion: v1
kind: ConfigMap
metadata:
  name: {intent.target_name}
  namespace: {intent.namespace}
data:
""".rstrip()

        diffs = []

        for key, value in intent.parameters.items():
            manifest += f"\n  {key}: \"{value}\""

            diffs.append(
                ManifestDiff(
                    field=f"config.{key}",
                    before="current",
                    after=str(value)
                )
            )

        return ExecutionPlan(
            session_id=session_id,
            intent=intent,
            manifest_yaml=manifest,
            diffs=diffs,
            estimated_duration_seconds=10,
            dry_run=False
        )

    def _plan_lifecycle(
        self,
        session_id: str,
        intent: IntentSpec
    ) -> ExecutionPlan:

        manifest = f"""
action: {intent.action}
resource: {intent.target_name}
namespace: {intent.namespace}
""".strip()

        diffs = [
            ManifestDiff(
                field="operation",
                before="current",
                after=intent.action
            )
        ]

        return ExecutionPlan(
            session_id=session_id,
            intent=intent,
            manifest_yaml=manifest,
            diffs=diffs,
            estimated_duration_seconds=30,
            dry_run=False
        )


planner_agent = PlannerAgent()