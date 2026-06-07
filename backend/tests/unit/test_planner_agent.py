import asyncio

from agents.planner_agent import planner_agent
from models.intent import IntentSpec


def test_scale_plan():

    intent = IntentSpec(
        action="scale",
        target_type="deployment",
        target_name="backend",
        namespace="default",
        parameters={"replicas": 3},
        risk_level="low"
    )

    plan = asyncio.run(
        planner_agent.run(
            "test-session",
            intent
        )
    )

    assert "replicas: 3" in plan.manifest_yaml
    assert len(plan.diffs) > 0


def test_deploy_plan():

    intent = IntentSpec(
        action="deploy",
        target_type="deployment",
        target_name="api",
        namespace="default",
        parameters={"image": "api:v2"},
        risk_level="medium"
    )

    plan = asyncio.run(
        planner_agent.run(
            "test-session",
            intent
        )
    )

    assert "api:v2" in plan.manifest_yaml


def test_service_plan():

    intent = IntentSpec(
        action="add_service",
        target_type="service",
        target_name="redis",
        namespace="default",
        parameters={"port": 6379},
        risk_level="low"
    )

    plan = asyncio.run(
        planner_agent.run(
            "test-session",
            intent
        )
    )

    assert "6379" in plan.manifest_yaml


def test_restart_plan():

    intent = IntentSpec(
        action="restart",
        target_type="deployment",
        target_name="backend",
        namespace="default",
        parameters={},
        risk_level="medium"
    )

    plan = asyncio.run(
        planner_agent.run(
            "test-session",
            intent
        )
    )

    assert plan.intent.action == "restart"