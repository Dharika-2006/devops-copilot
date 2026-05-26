# backend/tests/unit/test_intent_agent.py
#
# TEAMMATE 2 — All your unit tests live here.
# Run with: pytest backend/tests/unit/test_intent_agent.py -v
# (Run from the ROOT of the project, not from inside backend/)
#
# These tests make real Groq API calls — they need GROQ_API_KEY in .env
# The Phase 1 integration checkpoint requires at least 10 tests to pass.
#
import sys
import os
import pytest

# ─── Path setup ───────────────────────────────────────────────────────────────
# Makes sure Python can find the 'backend' package whether you run pytest
# from the project root OR from inside the backend/ folder.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from dotenv import load_dotenv
load_dotenv()  # Loads GROQ_API_KEY from .env before any imports

from backend.agents.intent_agent import parse_intent


# ─────────────────────────────────────────────────────────────────────────────
# SCALE TESTS
# ─────────────────────────────────────────────────────────────────────────────

def test_scale_up_basic():
    """Most basic case: 'scale backend to 5 replicas'"""
    result = parse_intent("scale my backend to 5 replicas")
    assert result.action == "scale"
    assert result.target_name == "backend"
    assert result.parameters.get("replicas") == 5
    assert result.risk_level == "low"  # scaling up is low risk


def test_scale_different_phrasing():
    """LLM should handle synonyms: 'instances' instead of 'replicas'"""
    result = parse_intent("increase the api service to 3 instances")
    assert result.action == "scale"
    assert result.parameters.get("replicas") == 3


def test_scale_to_zero_is_high_risk():
    """Scaling to 0 takes the service completely down — must be high risk"""
    result = parse_intent("scale the backend to 0 replicas")
    assert result.action == "scale"
    assert result.parameters.get("replicas") == 0
    # 0 replicas = service is down — must be high or at least medium
    assert result.risk_level in ["medium", "high"], (
        f"Expected medium or high risk for scale-to-zero, got: {result.risk_level}"
    )


def test_scale_large_number():
    """Numbers like 10, 15, 20 should all parse correctly"""
    result = parse_intent("scale the frontend deployment to 10 replicas")
    assert result.action == "scale"
    assert result.parameters.get("replicas") == 10


# ─────────────────────────────────────────────────────────────────────────────
# ROLLBACK TESTS
# ─────────────────────────────────────────────────────────────────────────────

def test_rollback_is_high_risk():
    """Rollback is always destructive — must be high risk"""
    result = parse_intent("rollback the frontend deployment")
    assert result.action == "rollback"
    assert "frontend" in result.target_name.lower()
    assert result.risk_level == "high", (
        f"Rollback must be high risk, got: {result.risk_level}"
    )


def test_rollback_without_word_deployment():
    """User might just say 'rollback the frontend' without 'deployment'"""
    result = parse_intent("rollback the frontend")
    assert result.action == "rollback"
    assert result.risk_level == "high"


# ─────────────────────────────────────────────────────────────────────────────
# DEPLOY TESTS
# ─────────────────────────────────────────────────────────────────────────────

def test_deploy_new_version():
    """Basic deploy command"""
    result = parse_intent("deploy the latest version of my api")
    assert result.action == "deploy"


def test_deploy_specific_image():
    """Deploy with a version/image number in the command"""
    result = parse_intent("deploy version 2.1.0 of the payment service")
    assert result.action == "deploy"
    assert "payment" in result.target_name.lower()


def test_deploy_is_medium_risk():
    """Deploying a new image is medium risk (could break things)"""
    result = parse_intent("deploy a new version of the auth service")
    assert result.action == "deploy"
    assert result.risk_level == "medium"


# ─────────────────────────────────────────────────────────────────────────────
# ADD SERVICE TESTS
# ─────────────────────────────────────────────────────────────────────────────

def test_add_redis():
    """Adding Redis is the canonical add_service example"""
    result = parse_intent("add Redis caching to the system")
    assert result.action == "add_service"
    assert "redis" in result.target_name.lower()
    assert result.risk_level == "low"


# ─────────────────────────────────────────────────────────────────────────────
# OTHER ACTION TESTS
# ─────────────────────────────────────────────────────────────────────────────

def test_update_config():
    """Config updates should be low risk"""
    result = parse_intent("update LOG_LEVEL to DEBUG for the auth service")
    assert result.action == "update_config"


def test_remove_service_is_high_risk():
    """Removing a service is destructive — must be high risk"""
    result = parse_intent("remove the old logging service")
    assert result.action == "remove_service"
    assert result.risk_level == "high"


# ─────────────────────────────────────────────────────────────────────────────
# SCHEMA / STRUCTURE TESTS
# ─────────────────────────────────────────────────────────────────────────────

def test_default_namespace_when_not_mentioned():
    """If user doesn't mention a namespace, it must default to 'default'"""
    result = parse_intent("scale auth to 2 replicas")
    assert result.namespace == "default"


def test_all_required_fields_are_present():
    """
    Every IntentSpec must have all required fields filled in.
    This tests that nothing is None that shouldn't be.
    """
    result = parse_intent("scale auth service to 2 replicas")
    assert result.action is not None
    assert result.target_type is not None
    assert result.target_name is not None, "target_name must not be None"
    assert result.namespace is not None
    assert result.risk_level is not None
    assert isinstance(result.parameters, dict), "parameters must be a dict"


def test_action_is_valid_literal():
    """action must be one of the allowed values (Pydantic enforces this)"""
    result = parse_intent("scale my backend to 3 replicas")
    valid_actions = ["scale", "deploy", "rollback", "add_service", "remove_service", "update_config"]
    assert result.action in valid_actions, f"Got unexpected action: {result.action}"


def test_risk_level_is_valid_literal():
    """risk_level must be one of low/medium/high"""
    result = parse_intent("deploy my backend service")
    assert result.risk_level in ["low", "medium", "high"]