import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware

from backend.observability.logging_config import get_logger


logger = get_logger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request, call_next):

        request_id = str(uuid.uuid4())

        start_time = time.time()

        response = await call_next(request)

        process_time = round(
            (time.time() - start_time) * 1000,
            2
        )

        logger.info(
            "request_completed",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            latency_ms=process_time,
        )

        response.headers["X-Request-ID"] = request_id

        return response