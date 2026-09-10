"""Pydantic request/response models, with the exact JSON keys the frontend reads.

Response fields are named in snake_case and carry a `serialization_alias` where
the wire key differs; FastAPI serialises by alias, so the JSON keys stay exactly
what the Java controllers emitted.
"""

from pydantic import BaseModel, ConfigDict, Field

# UserService.createUser: `if (user.getElo() == 0) user.setElo(800)`.
DEFAULT_ELO = 800


class VisitCountResponse(BaseModel):
    count: int


class ErrorResponse(BaseModel):
    """The single error shape every router returns: {"error": "<message>"}."""

    error: str


class RegisterRequest(BaseModel):
    """Java bound the whole `User` entity here, hence the odd shape: the *raw*
    password arrives under the `encrypted_password` key and is hashed on the way
    in. `guest` rather than `is_guest` is Lombok's doing - `isGuest()` makes
    Jackson call the property `guest` - and both spellings are accepted.

    `username` and `encrypted_password` are required. Java left them optional and
    answered a body without a password with an NPE-driven 500; a 400 naming the
    missing field is the same rejection, better spelled.
    """

    model_config = ConfigDict(populate_by_name=True)

    username: str
    encrypted_password: str
    name: str | None = None
    email: str | None = None
    # 0 carries "unset" through to the 800 default, as it did in Java.
    elo: int = 0
    is_guest: bool = Field(default=False, alias="guest")


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    """Both /register and /login return this identical shape."""

    token: str
    user_id: int = Field(serialization_alias="userId")
    username: str | None
    elo: int


class MeResponse(BaseModel):
    user_id: int = Field(serialization_alias="userId")
    username: str | None
    elo: int
    # Java coalesced these two to "" rather than emitting null.
    name: str = ""
    email: str = ""
