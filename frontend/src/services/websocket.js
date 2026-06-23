import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const createWebSocketClient = (onMatchUpdate) => {
    const client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        onConnect: () => {
            client.subscribe('/topic/match', (message) => {
                onMatchUpdate(JSON.parse(message.body));
            });
        }
    });

    client.activate();
    return client;
};

export default createWebSocketClient;