import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const createWebSocketClient = (onMatchUpdate, userId) => {
    const client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        onConnect: () => {
            const topic = userId ? `/topic/match/${userId}` : '/topic/match';
            client.subscribe(topic, (message) => {
                onMatchUpdate(JSON.parse(message.body));
            });
        }
    });

    client.activate();
    return client;
};

export default createWebSocketClient;