from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from db.postgres import get_db
from db.redis_client import get_redis

router = APIRouter()

@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):

    db_ok = "unknown"
    redis_ok = "unknown"

    try:
        await db.execute(text("SELECT 1"))
        db_ok = "connected"

    except Exception as e:
        db_ok = f"error: {e}"

    try:
        r = await get_redis()
        await r.ping()
        redis_ok = "connected"

    except Exception as e:
        redis_ok = f"error: {e}"

    return {
        "status": "ok",
        "db": db_ok,
        "redis": redis_ok
    }
