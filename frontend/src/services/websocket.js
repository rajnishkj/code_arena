import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const createWebSocketClient = ({ onMatchUpdate, onMatchResult, userId, onError } = {}) => {
    const client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        onConnect: () => {
            if (userId) {
                client.subscribe(`/topic/match/${userId}`, (message) => {
                    onMatchUpdate?.(JSON.parse(message.body));
                });
                client.subscribe(`/topic/match-result/${userId}`, (message) => {
                    onMatchResult?.(JSON.parse(message.body));
                });
            } else {
                client.subscribe('/topic/match', (message) => {
                    onMatchUpdate?.(JSON.parse(message.body));
                });
            }
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
