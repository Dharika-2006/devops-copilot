import json, time
from groq import Groq
from backend.models.intent import IntentSpec
from backend.observability.tracing import get_tracer
from backend.observability.logging_config import get_logger
from backend.config import settings
import asyncio

tracer = get_tracer("intent_agent")   # Teammate 3's tracer
logger = get_logger("intent_agent")   # Teammate 3's logger

SYSTEM_PROMPT = """You are an infrastructure intent parser.
Your ONLY job: convert a natural language command into JSON.
Respond with raw JSON only — no markdown, no explanation.

Schema:
{
  "action": one of [
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
        ],
  "target_type": one of ["deployment","service","configmap","ingress"],
  "target_name": "resource name (infer, use lowercase-hyphenated)",
  "namespace": "k8s namespace (default: 'default')",
  "parameters": {
    "replicas": N,         // scale
    "image": "img:tag",    // deploy
    "port": N,             // add_service
    "key": "value"         // update_config
  },
  "risk_level": "low|medium|high"
}

Risk rules:
low:
- scale up
- add service
- update config
- get status

medium:
- deploy
- restart
- expose
- pause
- resume

high:
- rollback
- delete
- remove service
- scale to zero

Examples:
"scale backend to 5 replicas"
→ {"action":"scale","target_type":"deployment","target_name":"backend",
   "namespace":"default","parameters":{"replicas":5},"risk_level":"low"}

"rollback the frontend"
→ {"action":"rollback","target_type":"deployment","target_name":"frontend",
   "namespace":"default","parameters":{},"risk_level":"high"}

"add Redis caching"
→ {"action":"add_service","target_type":"deployment","target_name":"redis",
   "namespace":"default","parameters":{"port":6379,"image":"redis:7-alpine"},
   "risk_level":"low"}

"restart backend"

{
  "action":"restart",
  "target_type":"deployment",
  "target_name":"backend",
  "namespace":"default",
  "parameters":{},
  "risk_level":"medium"
}

"delete frontend"

{
  "action":"delete",
  "target_type":"deployment",
  "target_name":"frontend",
  "namespace":"default",
  "parameters":{},
  "risk_level":"high"
}

"show backend status"

{
  "action":"get_status",
  "target_type":"deployment",
  "target_name":"backend",
  "namespace":"default",
  "parameters":{},
  "risk_level":"low"
}

"pause backend"

{
  "action":"pause",
  "target_type":"deployment",
  "target_name":"backend",
  "namespace":"default",
  "parameters":{},
  "risk_level":"medium"
}

"resume backend"

{
  "action":"resume",
  "target_type":"deployment",
  "target_name":"backend",
  "namespace":"default",
  "parameters":{},
  "risk_level":"medium"
}

"expose backend on port 8080"

{
  "action":"expose",
  "target_type":"service",
  "target_name":"backend",
  "namespace":"default",
  "parameters":{"port":8080},
  "risk_level":"medium"
}
"""

def parse_intent(command: str, session_id: str = "unknown") -> IntentSpec:
    with tracer.start_as_current_span("intent_agent.parse") as span:
        span.set_attribute("session_id", session_id)
        span.set_attribute("command", command)
        start = time.time()

        logger.info("intent_agent_started",
                    session_id=session_id, command=command)

        client = Groq(api_key=settings.groq_api_key)
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user",
                     "content": f"Parse this command: {command}"},
                ],
                response_format={"type": "json_object"},  # CRITICAL
                temperature=0.1,
                max_tokens=300,
            )
        except Exception as e:
            logger.error("intent_agent_groq_error",
                         session_id=session_id, error=str(e))
            raise ValueError(f"Groq API call failed: {e}") from e

        raw = response.choices[0].message.content
        span.set_attribute("raw_json", raw)

        try:
            data = json.loads(raw)
        except json.JSONDecodeError as e:
            logger.error("intent_json_parse_error",
                         session_id=session_id, raw=raw, error=str(e))
            raise ValueError(f"LLM returned invalid JSON: {raw}") from e

        STOP_WORDS = {"my", "the", "our", "a", "an"} #MIGHT HAVE TO ADD MORE IN THE FUTURE
        if "target_name" in data and isinstance(data["target_name"], str):
            words = data["target_name"].split("-")

            filtered_words = [
                word for word in words
                if word.lower() not in STOP_WORDS
            ]
            data["target_name"] = "-".join(filtered_words)


        try:
            intent = IntentSpec(**data)
        except Exception as e:
            logger.error("intent_schema_error",
                         session_id=session_id, data=data, error=str(e))
            raise ValueError(
                f"JSON doesn't match IntentSpec: {data}. Error: {e}"
            ) from e

        ms = round((time.time() - start) * 1000, 2)
        span.set_attribute("action", intent.action)
        span.set_attribute("risk_level", intent.risk_level)

        logger.info("intent_agent_completed",
                    session_id=session_id, action=intent.action,
                    target_name=intent.target_name,
                    risk_level=intent.risk_level, latency_ms=ms)
        return intent


class IntentAgent:
    """
    Async wrapper used by the LangGraph orchestrator.

    The actual parsing logic remains in parse_intent(),
    which continues to use the Groq API.
    """

    async def run(
        self,
        command: str,
        session_id: str
    ) -> IntentSpec:

        return await asyncio.to_thread(
            parse_intent,
            command,
            session_id
        )


intent_agent = IntentAgent()