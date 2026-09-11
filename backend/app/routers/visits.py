"""Public visit counter - the one unauthenticated route that writes to Postgres."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import VisitCountResponse

router = APIRouter(prefix="/api/visits", tags=["visits"])

# VisitService reads findById(1) and falls back to a fresh Visit(0), which on an
# empty table is inserted with the generated id 1. The singleton therefore lives
# at id 1 either way.
VISIT_ID = 1

# One statement does the whole job: it inserts the singleton when it is absent
# and otherwise takes a row lock on it and increments in place. A
# SELECT ... FOR UPDATE cannot be used on its own here, because on an empty
# table it locks nothing and two concurrent callers would each insert a row and
# lose an increment.
_INCREMENT = text(
    """
    INSERT INTO visit (id, count) VALUES (:id, 1)
    ON CONFLICT (id) DO UPDATE SET count = visit.count + 1
    RETURNING count
    """
)


@router.post("", response_model=VisitCountResponse)
def record_visit(db: Session = Depends(get_db)) -> VisitCountResponse:
    count = db.execute(_INCREMENT, {"id": VISIT_ID}).scalar_one()
    db.commit()
    return VisitCountResponse(count=count)
