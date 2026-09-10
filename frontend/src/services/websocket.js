// Native WebSocket client, replacing the STOMP/SockJS one. The server pushes
// `{type, payload}` frames on a per-user socket; this file only listens.
// Lobby.jsx and Match.jsx use nothing but the callbacks below and deactivate().

const WS_URL = 'ws://localhost:8080/ws';

const createWebSocketClient = ({ onMatchUpdate, onMatchResult, userId, onError } = {}) => {
    const socket = new WebSocket(`${WS_URL}?userId=${encodeURIComponent(userId)}`);

    // Set by deactivate() so a teardown on unmount is not reported as a
    // dropped connection — the pages render a "connection lost" banner on it.
    let closedByClient = false;

    socket.onmessage = (event) => {
        let frame;
        try {
            frame = JSON.parse(event.data);
        } catch (err) {
            console.warn('WebSocket: unparseable frame', event.data);
            return;
        }
        if (frame.type === 'match') {
            onMatchUpdate?.(frame.payload);
        } else if (frame.type === 'match-result') {
            onMatchResult?.(frame.payload);
        }
    };

    socket.onerror = () => {
        if (closedByClient) return;
        console.error('WebSocket error');
        onError?.('WebSocket connection failed');
    };

    socket.onclose = () => {
        if (closedByClient) return;
        console.warn('WebSocket closed');
        onError?.('WebSocket connection lost');
    };

    return {
        deactivate: () => {
            closedByClient = true;
            // close() is legal while still CONNECTING; it aborts the handshake.
            socket.close();
        }
    };
};

export default createWebSocketClient;
