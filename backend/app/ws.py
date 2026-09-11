"""Server-push realtime transport: the socket registry and its push helpers.

Replaces the STOMP broker the Java app ran on `/ws`. The client only ever
subscribes - nothing it sends is read - so there is no inbound routing here,
only a registry of live sockets per user and a way to push to them.

Service code that pushes is synchronous and runs off the event loop (in a
FastAPI threadpool worker, or under `asyncio.to_thread`), so `push_match` and
`push_match_result` are callable from any thread. They hop onto the loop
captured during startup and do not wait for delivery: a slow or half-open
socket must not stall a database transaction.
"""

import asyncio
import logging
import threading
from concurrent.futures import Future
from typing import Any

from fastapi import WebSocket

from app.models import Match

logger = logging.getLogger("arena")

# The two message types the frontend dispatches on.
MATCH = "match"
MATCH_RESULT = "match-result"


def match_payload(match: Match) -> dict[str, Any]:
    """The match dict a frame carries, keyed as Jackson serialised the Java
    `Match` entity - `Match.jsx` reads `p1`, `p1EloChange` and `winner` off it,
    and `Lobby.jsx` reads `id` and `problemId`.
    """
    return {
        "id": match.id,
        "p1": match.p1,
        "p2": match.p2,
        "problemId": match.problem_id,
        "winner": match.winner,
        "p1EloChange": match.p1_elo_change,
        "p2EloChange": match.p2_elo_change,
    }


class ConnectionManager:
    """`user_id -> set[WebSocket]`. A user may hold several sockets at once (two
    tabs, or a reconnect racing the old socket's teardown) and every one of them
    receives each push.
    """

    def __init__(self) -> None:
        self._sockets: dict[int, set[WebSocket]] = {}
        # Guards _sockets: pushes arrive from worker threads while the event
        # loop is registering and dropping sockets.
        self._lock = threading.Lock()
        self._loop: asyncio.AbstractEventLoop | None = None

    def bind_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        """Called once from the lifespan handler; without it pushes are dropped."""
        self._loop = loop

    async def connect(self, user_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        with self._lock:
            self._sockets.setdefault(user_id, set()).add(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket) -> None:
        with self._lock:
            sockets = self._sockets.get(user_id)
            if sockets is None:
                return
            sockets.discard(websocket)
            if not sockets:
                del self._sockets[user_id]

    def sockets_for(self, user_id: int) -> set[WebSocket]:
        """A snapshot, so a send can iterate without holding the lock."""
        with self._lock:
            return set(self._sockets.get(user_id, ()))

    async def send(self, user_id: int, message_type: str, payload: Any) -> None:
        frame = {"type": message_type, "payload": payload}
        for websocket in self.sockets_for(user_id):
            try:
                await websocket.send_json(frame)
            except Exception:
                # The peer vanished without a close frame. Drop the socket here
                # rather than pushing to it again on the next match event.
                logger.warning("Dropping dead socket for user %s", user_id)
                self.disconnect(user_id, websocket)

    def push(self, user_id: int, message_type: str, payload: Any) -> None:
        """Threadsafe fire-and-forget push. Safe from the event loop thread too,
        since nothing here blocks on the result.
        """
        loop = self._loop
        if loop is None:
            logger.warning(
                "Dropping %s push to user %s: no event loop bound", message_type, user_id
            )
            return
        future = asyncio.run_coroutine_threadsafe(
            self.send(user_id, message_type, payload), loop
        )
        future.add_done_callback(_log_push_failure)


def _log_push_failure(future: Future) -> None:
    """Nothing awaits a push, so a failure would otherwise be silent."""
    try:
        future.result()
    except Exception:
        logger.exception("WebSocket push failed")


manager = ConnectionManager()


def push_match(user_id: int, match: Match) -> None:
    """Tell a user a match has started."""
    # The payload is built here, in the caller's thread, while `match` is still
    # attached to a live session - a lazy load from the loop thread later would
    # blow up.
    manager.push(user_id, MATCH, match_payload(match))


def push_match_result(user_id: int, match: Match) -> None:
    """Tell a user their match has ended."""
    manager.push(user_id, MATCH_RESULT, match_payload(match))
