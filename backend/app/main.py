"""FastAPI application factory: config, CORS, lifespan, routers."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.errors import register_exception_handlers
from app.redis_client import ping_redis
from app.routers import visits

# Importing the models registers all six tables on Base.metadata, which is what
# create_all below has to work from.
from app import models  # noqa: F401

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("arena")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # The database is empty after the PC reset, so this genuinely creates the
    # six tables rather than being the no-op the migration plan first assumed.
    Base.metadata.create_all(bind=engine)
    logger.info("Postgres connected; schema ensured for %d tables", len(Base.metadata.tables))

    ping_redis()
    logger.info("Redis connected at %s:%s", settings.redis_host, settings.redis_port)

    yield


app = FastAPI(title="Arena API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(visits.router)
