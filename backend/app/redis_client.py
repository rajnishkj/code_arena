import redis

from app.config import settings

redis_client = redis.Redis(
    host=settings.redis_host,
    port=settings.redis_port,
    decode_responses=True,
)


def ping_redis() -> bool:
    """Raise redis.RedisError if the server is unreachable."""
    return redis_client.ping()
