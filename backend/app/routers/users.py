"""Registration, login and the current-user endpoint.

Tokens issued here are the only credential the rest of the API accepts. The
remaining `/api/users` routes (lookup, leaderboards, profile update) land in a
later ticket and mount on this same router.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import (
    DEFAULT_ELO,
    AuthResponse,
    LoginRequest,
    MeResponse,
    RegisterRequest,
)
from app.security import create_token, get_current_user_id, hash_password, verify_password

router = APIRouter(prefix="/api/users", tags=["users"])


def _auth_response(user: User) -> AuthResponse:
    return AuthResponse(
        token=create_token(user.id, user.username),
        user_id=user.id,
        username=user.username,
        elo=user.elo,
    )


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    """Public. `username` has no unique constraint - the Java app never had one,
    so two accounts can share a name and login then resolves to whichever row
    comes back first. Preserved deliberately; it is a real gap, not an omission.
    """
    user = User(
        name=payload.name,
        username=payload.username,
        email=payload.email,
        elo=payload.elo or DEFAULT_ELO,
        encrypted_password=hash_password(payload.password),
        is_guest=payload.is_guest,
        # created_at is left NULL: nothing on the Java registration path ever
        # set it, and nothing reads it.
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _auth_response(user)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    """Public. One message for both a missing user and a wrong password, so the
    response does not disclose which usernames exist.
    """
    user = db.query(User).filter(User.username == payload.username).first()
    if user is None or not verify_password(payload.password, user.encrypted_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return _auth_response(user)


@router.get("/me", response_model=MeResponse)
def me(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> MeResponse:
    user = db.get(User, user_id)
    if user is None:
        # Only reachable with a token for a since-deleted user. Java's
        # getUserById threw, which the global handler turned into a 500; 404 is
        # the honest code and matches the plan's status mapping.
        raise HTTPException(status_code=404, detail="User not found")
    return MeResponse(
        user_id=user.id,
        username=user.username,
        elo=user.elo,
        name=user.name or "",
        email=user.email or "",
    )
