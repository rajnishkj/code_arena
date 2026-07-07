import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const createWebSocketClient = (onMatchUpdate, userId, onError) => {
    const client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        onConnect: () => {
            const topic = userId ? `/topic/match/${userId}` : '/topic/match';
            client.subscribe(topic, (message) => {
                onMatchUpdate(JSON.parse(message.body));
            });
        },
        onStompError: (frame) => {
            console.error('STOMP error:', frame);
            onError?.('STOMP connection failed');
        },
        onWebSocketClose: () => {
            console.warn('WebSocket closed');
            onError?.('WebSocket connection lost');
        }
    });

    client.activate();
    return client;
};

export default createWebSocketClient;