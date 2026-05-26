# backend/agents/intent_agent.py
#
# TEAMMATE 2 — Core file.
# This is the brain of the entire system.
# It takes a plain-English command and returns a validated IntentSpec.
#
import json
import time
from groq import Groq
from backend.models.intent import IntentSpec
from backend.observability.tracing import get_tracer
from backend.observability.logging_config import get_logger
from backend.config import settings

# These two lines wire into Teammate 3's observability layer automatically.
tracer = get_tracer("intent_agent")
logger = get_logger("intent_agent")

# ─────────────────────────────────────────────────────────────────────────────
# SYSTEM PROMPT — This is the "brain instructions" for the LLM.
# It tells the model exactly what job it has and what JSON schema to output.
# IMPORTANT: Never change the field names here without also changing IntentSpec.
# ─────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are an infrastructure intent parser for a DevOps Copilot system.

Your ONLY job: convert a natural language infrastructure command into a structured JSON object.

You must ALWAYS respond with valid JSON and NOTHING else.
No explanation. No markdown. No code blocks. Just raw JSON.

The JSON must match this EXACT schema:
{
  "action": one of ["scale", "deploy", "rollback", "add_service", "remove_service", "update_config"],
  "target_type": one of ["deployment", "service", "configmap", "ingress"],
  "target_name": "name of the Kubernetes resource (infer from context, lowercase-hyphenated)",
  "namespace": "kubernetes namespace (default to 'default' if not mentioned)",
  "parameters": {
    "replicas": N           (integer, for scale action)
    "image": "image:tag"    (string, for deploy action)
    "port": N               (integer, for add_service action)
    "key": "value"          (for update_config action)
  },
  "risk_level": one of ["low", "medium", "high"]
}

Risk level rules (follow these strictly):
- low:    scaling UP replicas, adding a new service, updating config
- medium: deploying a new image (could break things if image is wrong)
- high:   scaling DOWN to 0, rollback, removing a service, any destructive action

Common patterns:
- "scale X to N replicas"         → action=scale, parameters.replicas=N
- "deploy X" / "new version of X" → action=deploy, risk_level=medium
- "rollback X"                    → action=rollback, risk_level=high
- "add redis" / "add X caching"   → action=add_service, target_name=redis
- "remove X" / "delete X"         → action=remove_service, risk_level=high
- "update config" / "set X to Y"  → action=update_config

Examples:
Input: "scale my backend to 5 replicas"
Output: {"action":"scale","target_type":"deployment","target_name":"backend","namespace":"default","parameters":{"replicas":5},"risk_level":"low"}

Input: "rollback the frontend"
Output: {"action":"rollback","target_type":"deployment","target_name":"frontend","namespace":"default","parameters":{},"risk_level":"high"}

Input: "add Redis caching"
Output: {"action":"add_service","target_type":"deployment","target_name":"redis","namespace":"default","parameters":{"port":6379,"image":"redis:7-alpine"},"risk_level":"low"}

Input: "deploy version 2.0 of the payment service"
Output: {"action":"deploy","target_type":"deployment","target_name":"payment","namespace":"default","parameters":{"image":"payment:2.0"},"risk_level":"medium"}

Input: "scale backend to 0 replicas"
Output: {"action":"scale","target_type":"deployment","target_name":"backend","namespace":"default","parameters":{"replicas":0},"risk_level":"high"}
"""


def parse_intent(command: str, session_id: str = "unknown") -> IntentSpec:
    """
    Convert a natural language infrastructure command into a structured IntentSpec.

    Args:
        command:    The raw natural language command from the user.
        session_id: For log/trace correlation with the rest of the pipeline.

    Returns:
        IntentSpec: A fully validated Pydantic model with the parsed intent.

    Raises:
        ValueError: If Groq returns invalid JSON or it doesn't match IntentSpec schema.
    """
    # start_as_current_span() hooks into Teammate 3's OpenTelemetry tracer.
    # Everything inside this block gets traced automatically.
    with tracer.start_as_current_span("intent_agent.parse") as span:
        span.set_attribute("session_id", session_id)
        span.set_attribute("command", command)

        start_time = time.time()

        logger.info(
            "intent_agent_started",
            session_id=session_id,
            command=command,
        )

        # ── Step 1: Call Groq API ──────────────────────────────────────────
        client = Groq(api_key=settings.groq_api_key)

        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Parse this command: {command}"},
                ],
                # response_format=json_object is CRITICAL.
                # Without it the model wraps JSON in markdown ```json blocks
                # and json.loads() will crash.
                response_format={"type": "json_object"},
                temperature=0.1,   # Low temperature = deterministic, not creative
                max_tokens=300,
            )
        except Exception as e:
            logger.error(
                "intent_agent_groq_error",
                session_id=session_id,
                error=str(e),
            )
            raise ValueError(f"Groq API call failed: {e}") from e

        raw_json = response.choices[0].message.content
        span.set_attribute("raw_json", raw_json)

        # ── Step 2: Parse JSON ─────────────────────────────────────────────
        try:
            data = json.loads(raw_json)
        except json.JSONDecodeError as e:
            logger.error(
                "intent_agent_json_parse_error",
                session_id=session_id,
                raw_json=raw_json,
                error=str(e),
            )
            raise ValueError(f"LLM returned invalid JSON: {raw_json}") from e
        
        # ── Step 2.5: Clean target_name ────────────────────────────────────
        STOP_WORDS = {"my", "the", "our", "a", "an"} #might have to add more possesive words in the future

        if "target_name" in data and isinstance(data["target_name"], str):
            words = data["target_name"].split("-")

            filtered_words = [
                word for word in words
                if word.lower() not in STOP_WORDS
            ]

        data["target_name"] = "-".join(filtered_words)

        # ── Step 3: Validate against IntentSpec schema ─────────────────────
        # This is where Pydantic catches things like wrong action values,
        # missing required fields, or wrong types.
        try:
            intent = IntentSpec(**data)
        except Exception as e:
            logger.error(
                "intent_agent_schema_validation_error",
                session_id=session_id,
                data=data,
                error=str(e),
            )
            raise ValueError(
                f"JSON doesn't match IntentSpec schema. Got: {data}. Error: {e}"
            ) from e

        # ── Step 4: Log success and return ────────────────────────────────
        latency_ms = round((time.time() - start_time) * 1000, 2)
        span.set_attribute("action", intent.action)
        span.set_attribute("risk_level", intent.risk_level)
        span.set_attribute("target_name", intent.target_name)

        logger.info(
            "intent_agent_completed",
            session_id=session_id,
            action=intent.action,
            target_type=intent.target_type,
            target_name=intent.target_name,
            namespace=intent.namespace,
            risk_level=intent.risk_level,
            latency_ms=latency_ms,
        )

        return intent