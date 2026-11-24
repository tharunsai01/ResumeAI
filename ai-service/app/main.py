import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api.routes import public, router
from app.core.config import get_settings
from app.embeddings.encoder import warm_up

logging.basicConfig(level=logging.INFO, format='{"level":"%(levelname)s","logger":"%(name)s","msg":"%(message)s"}')

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    warm_up()  # load MiniLM in the background so health checks stay fast
    yield


app = FastAPI(
    lifespan=lifespan,
    title=settings.app_name,
    version=settings.model_version,
    docs_url=None if settings.environment == "production" else "/docs",
    redoc_url=None,
)


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError):
    errors = [{"loc": ".".join(str(p) for p in e["loc"]), "msg": e["msg"]} for e in exc.errors()[:20]]
    return JSONResponse(status_code=422, content={"detail": "Invalid request", "errors": errors})


@app.exception_handler(Exception)
async def unhandled(_: Request, exc: Exception):
    logging.getLogger("app").exception("Unhandled error: %s", exc.__class__.__name__)
    return JSONResponse(status_code=500, content={"detail": "Internal AI service error"})


app.include_router(public)
app.include_router(router)
