from fastapi import FastAPI

from backend.api.routes import health, commands

from backend.observability.logging_config import (
    setup_logging,
)

from backend.observability.tracing import (
    instrument_app,
)

from backend.api.middleware.logging import (
    LoggingMiddleware,
)


setup_logging()


app = FastAPI(
    title="DevOps Copilot",
    version="0.1.0"
)


app.add_middleware(LoggingMiddleware)


instrument_app(app)


app.include_router(health.router)

app.include_router(
    commands.router,
    prefix="/api"
)


@app.on_event("startup")
async def startup():
    print("DevOps Copilot backend starting up...")