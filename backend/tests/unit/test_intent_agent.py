import sys, os, pytest
sys.path.insert(0, os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../..")))
from dotenv import load_dotenv
load_dotenv()
from backend.agents.intent_agent import parse_intent

def test_scale_up():
    r = parse_intent("scale my backend to 5 replicas")
    assert r.action == "scale"
    assert r.target_name == "backend"
    assert r.parameters.get("replicas") == 5
    assert r.risk_level == "low"

def test_scale_phrasing():
    r = parse_intent("increase api service to 3 instances")
    assert r.action == "scale"
    assert r.parameters.get("replicas") == 3

def test_rollback_high_risk():
    r = parse_intent("rollback the frontend deployment")
    assert r.action == "rollback"
    assert r.risk_level == "high"

def test_rollback_short():
    r = parse_intent("rollback the frontend")
    assert r.action == "rollback"
    assert r.risk_level == "high"

def test_deploy():
    r = parse_intent("deploy the latest version of my api")
    assert r.action == "deploy"

def test_deploy_with_image():
    r = parse_intent("deploy version 2.1.0 of the payment service")
    assert r.action == "deploy"
    assert "payment" in r.target_name.lower()

def test_deploy_medium_risk():
    r = parse_intent("deploy a new version of the auth service")
    assert r.risk_level == "medium"

def test_add_redis():
    r = parse_intent("add Redis caching to the system")
    assert r.action == "add_service"
    assert "redis" in r.target_name.lower()
    assert r.risk_level == "low"

def test_scale_to_zero_risky():
    r = parse_intent("scale the backend to 0 replicas")
    assert r.parameters.get("replicas") == 0
    assert r.risk_level in ["medium", "high"]

def test_update_config():
    r = parse_intent("update LOG_LEVEL to DEBUG for auth service")
    assert r.action == "update_config"

def test_remove_service_high_risk():
    r = parse_intent("remove the old logging service")
    assert r.action == "remove_service"
    assert r.risk_level == "high"

def test_default_namespace():
    r = parse_intent("scale auth to 2 replicas")
    assert r.namespace == "default"

def test_all_fields_present():
    r = parse_intent("scale auth service to 2 replicas")
    assert all([r.action, r.target_type, r.target_name,
                r.namespace, r.risk_level])
    assert isinstance(r.parameters, dict)

def test_valid_action_literal():
    r = parse_intent("scale my backend to 3 replicas")
    valid = [
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
    assert r.action in valid

def test_valid_risk_literal():
    r = parse_intent("deploy my backend service")
    assert r.risk_level in ["low", "medium", "high"]

def test_restart():
    r = parse_intent("restart backend")
    assert r.action == "restart"

def test_delete():
    r = parse_intent("delete frontend deployment")
    assert r.action == "delete"

def test_expose():
    r = parse_intent("expose backend on port 8080")
    assert r.action == "expose"

def test_pause():
    r = parse_intent("pause backend")
    assert r.action == "pause"

def test_resume():
    r = parse_intent("resume backend")
    assert r.action == "resume"

def test_status():
    r = parse_intent("show backend status")
    assert r.action == "get_status"