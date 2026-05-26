# backend/api/routes/commands.py
#
# TEAMMATE 2 — Replace the stub completely with this file.
# This is the main API endpoint. It:
#   1. Receives a natural language command
#   2. Stores the session in the DB (so it's tracked even if it fails)
#   3. Runs the Intent Agent to parse the command
#   4. Writes an audit log (via Teammate 3's audit_logger)
#   5. Returns the structured intent to the caller (frontend / tests)
#
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.db.postgres import get_db
from backend.db.orm_models import CommandSession
from backend.models.intent import CommandRequest, CommandResponse
from backend.agents.intent_agent import parse_intent
from backend.observability.audit_logger import write_audit_log
from backend.observability.logging_config import get_logger

router = APIRouter()
logger = get_logger("commands_route")


@router.post("/commands", response_model=CommandResponse)
async def create_command(
    body: CommandRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    POST /api/commands

    Accepts a natural language infrastructure command.
    Returns the structured intent parsed by the Intent Agent.

    Request body:
        { "command": "scale my backend to 5 replicas" }

    Success response:
        {
          "session_id": "abc-123",
          "status": "intent_parsed",
          "intent": { "action": "scale", "target_name": "backend", ... }
        }

    Failure response:
        {
          "session_id": "abc-123",
          "status": "intent_failed",
          "error": "Reason why it failed"
        }
    """
    # Generate a unique session ID for this entire command lifecycle.
    # This ID will be used to correlate logs, traces, and DB records.
    session_id = str(uuid.uuid4())

    # ── Step 1: Save the raw command to DB immediately ─────────────────────
    # We save BEFORE parsing so the command is tracked even if parsing fails.
    session = CommandSession(
        id=uuid.UUID(session_id),
        command_text=body.command,
        status="intent_parsing",
    )
    db.add(session)
    await db.commit()

    logger.info(
        "command_received",
        session_id=session_id,
        command=body.command,
    )

    # ── Step 2: Run the Intent Agent ───────────────────────────────────────
    try:
        intent = parse_intent(command=body.command, session_id=session_id)

    except ValueError as e:
        # Parsing failed (bad JSON from LLM, or schema mismatch).
        # Update DB status and write an audit log of the failure.
        session.status = "intent_failed"
        await db.commit()

        await write_audit_log(
            db=db,
            session_id=uuid.UUID(session_id),
            intent_json={"error": str(e), "raw_command": body.command},
            outcome="intent_failed",
        )

        logger.error(
            "command_intent_failed",
            session_id=session_id,
            command=body.command,
            error=str(e),
        )

        return CommandResponse(
            session_id=session_id,
            status="intent_failed",
            error=str(e),
        )

    # ── Step 3: Update session status to intent_parsed ────────────────────
    session.status = "intent_parsed"
    await db.commit()

    # ── Step 4: Write success audit log ───────────────────────────────────
    # This calls Teammate 3's audit_logger, which saves to the audit_logs table.
    await write_audit_log(
        db=db,
        session_id=uuid.UUID(session_id),
        intent_json=intent.model_dump(),
        outcome="intent_parsed",
    )

    logger.info(
        "command_intent_success",
        session_id=session_id,
        action=intent.action,
        target_name=intent.target_name,
        risk_level=intent.risk_level,
    )

    # ── Step 5: Return the structured intent ──────────────────────────────
    return CommandResponse(
        session_id=session_id,
        status="intent_parsed",
        intent=intent,
    )