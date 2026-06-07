import redis.asyncio as redis
import sys, os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings

_client = None

async def get_redis():
    global _client

    if _client is None:
        _client = redis.from_url(
            settings.redis_url,
            decode_responses=True
        )

    return _client
