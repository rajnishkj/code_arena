"""Pydantic request/response models, with the exact JSON keys the frontend reads."""

from pydantic import BaseModel


class VisitCountResponse(BaseModel):
    count: int


class ErrorResponse(BaseModel):
    """The single error shape every router returns: {"error": "<message>"}."""

    error: str
