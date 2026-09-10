"""The error contract: every failure leaves as {"error": "<message>"}.

Ported from the Java GlobalExceptionHandler, which returned
``Map.of("error", ...)`` for validation failures, missing query parameters and
unhandled exceptions alike. The frontend logs the user out on any 403, so the
status codes matter as much as the body.
"""

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.schemas import ErrorResponse

logger = logging.getLogger("arena")


def error_response(status_code: int, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code, content=ErrorResponse(error=message).model_dump()
    )


def _first_validation_message(exc: RequestValidationError) -> str:
    """Only the first error is reported, as the Java handler did."""
    for err in exc.errors():
        loc = tuple(err.get("loc") or ())
        named = [str(part) for part in loc if part != "body"]
        field = named[-1] if named else "request"
        # Mirrors MissingServletRequestParameterException: the Java app
        # answered a missing query param with this exact wording.
        if err.get("type") == "missing" and loc[:1] == ("query",):
            return f"Missing parameter: {field}"
        return f"{field}: {err.get('msg', 'Validation failed')}"
    return "Validation failed"


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        detail = exc.detail
        message = detail if isinstance(detail, str) else str(detail)
        return error_response(exc.status_code, message)

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return error_response(400, _first_validation_message(exc))

    @app.exception_handler(Exception)
    async def handle_unexpected(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("[500] Unhandled exception on %s", request.url.path)
        return error_response(500, "Internal server error")
