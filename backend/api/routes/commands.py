import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.postgres import get_db
from db.orm_models import CommandSession
from models.intent import CommandRequest, CommandResponse
from agents.intent_agent import parse_intent
from observability.audit_logger import write_audit_log
from observability.logging_config import get_logger

router = APIRouter()
logger = get_logger("commands_route")


@router.post("/commands", response_model=CommandResponse)
async def create_command(
    body: CommandRequest,
    db: AsyncSession = Depends(get_db),
):
    session_id = str(uuid.uuid4())

    # Save raw command immediately — tracked even if parsing fails
    session = CommandSession(
        id=uuid.UUID(session_id),
        command_text=body.command,
        status="intent_parsing",
    )
    db.add(session)
    await db.commit()

    logger.info("command_received",
                session_id=session_id, command=body.command)

    try:
        intent = parse_intent(command=body.command,
                              session_id=session_id)
    except ValueError as e:
        session.status = "intent_failed"
        await db.commit()
        await write_audit_log(
            db=db,
            session_id=uuid.UUID(session_id),
            intent_json={"error": str(e), "raw_command": body.command},
            outcome="intent_failed",
        )
        logger.error("command_intent_failed", session_id=session_id,
                     command=body.command, error=str(e))
        return CommandResponse(session_id=session_id,
                               status="intent_failed", error=str(e))

    session.status = "intent_parsed"
    await db.commit()

    await write_audit_log(
        db=db,
        session_id=uuid.UUID(session_id),
        intent_json=intent.model_dump(),
        outcome="intent_parsed",
    )

    logger.info("command_intent_success", session_id=session_id,
                action=intent.action, target_name=intent.target_name)

    return CommandResponse(session_id=session_id,
                           status="intent_parsed", intent=intent)