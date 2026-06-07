from sqlalchemy.ext.asyncio import AsyncSession

from db.orm_models import AuditLog


async def write_audit_log(
    db: AsyncSession,
    session_id,
    intent_json,
    outcome,
):

    audit = AuditLog(
        session_id=session_id,
        intent_json=intent_json,
        outcome=outcome,
    )

    db.add(audit)

    await db.commit()

    await db.refresh(audit)

    return audit