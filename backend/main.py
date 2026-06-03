from fastapi import FastAPI
from api.routes import health, commands
from observability.logging_config import setup_logging
from observability.tracing import instrument_app
from api.middleware.logging import LoggingMiddleware

setup_logging()

app = FastAPI(title="DevOps Copilot", version="0.1.0")

app.add_middleware(LoggingMiddleware)
instrument_app(app)

app.include_router(health.router)
app.include_router(commands.router, prefix="/api")

@app.on_event("startup")
async def startup():
    print("DevOps Copilot backend starting up...")