import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
    }

    connect(boardId, onMessageReceived) {
        this.stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

            onConnect: (frame) => {
                console.log('Connected to WebSocket:', frame);
                this.connected = true;

                // Subscribe to board updates
                this.stompClient.subscribe(`/topic/board/${boardId}`, (message) => {
                    const updatedTask = JSON.parse(message.body);
                    onMessageReceived(updatedTask);
                });
            },

            onStompError: (error) => {
                console.error('WebSocket STOMP error:', error);
                this.connected = false;
            },

            onWebSocketError: (error) => {
                console.error('WebSocket connection error:', error);
                this.connected = false;
            },

            // Disable debug logging
            debug: () => {
                // console.log(str);
            }
        });

        this.stompClient.activate();
    }

    sendTaskMove(boardId, taskMoveRequest) {
        if (this.stompClient && this.connected) {
            this.stompClient.publish({
                destination: `/app/task/move/${boardId}`,
                body: JSON.stringify(taskMoveRequest)
            });
        }
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.deactivate();
            this.connected = false;
        }
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;