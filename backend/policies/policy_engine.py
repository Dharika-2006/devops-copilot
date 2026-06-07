from models.plan import ExecutionPlan
from policies.rules.base_rules import ALL_RULES

class PolicyEngine:
    def evaluate(self, plan: ExecutionPlan) -> list:
        violations = []
        for rule in ALL_RULES:
            result = rule(plan)
            if result:
                violations.append(result)
        return violations