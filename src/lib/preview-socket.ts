/**
 * Servicio mock para WebSocket/Socket.IO en modo preview
 * Simula todas las funcionalidades de tiempo real sin conexión real
 */

import { debugLog, PREVIEW_MODE } from '../config/app-config';
import { PreviewCache } from './preview-data';

export interface MockSocketEvent {
    type: string;
    data: any;
    timestamp: string;
}

export interface MockSocketListener {
    event: string;
    callback: (data: any) => void;
}

export class PreviewSocketService {
    private static instance: PreviewSocketService;
    private cache: PreviewCache;
    private listeners: Map<string, MockSocketListener[]> = new Map();
    private isConnected: boolean = false;
    private connectionId: string = '';

    private constructor() {
        this.cache = PreviewCache.getInstance();
    }

    static getInstance(): PreviewSocketService {
        if (!PreviewSocketService.instance) {
            PreviewSocketService.instance = new PreviewSocketService();
        }
        return PreviewSocketService.instance;
    }

    // Simular conexión
    connect(): Promise<void> {
        return new Promise((resolve) => {
            debugLog('Mock Socket: Connecting...');

            setTimeout(() => {
                this.isConnected = true;
                this.connectionId = `mock_connection_${Date.now()}`;
                debugLog('Mock Socket: Connected with ID:', this.connectionId);

                // Emitir evento de conexión
                this.emit('connect', { connectionId: this.connectionId });

                // Iniciar simulación de eventos periódicos
                this.startPeriodicEvents();

                resolve();
            }, 500 + Math.random() * 1000);
        });
    }

    // Simular desconexión
    disconnect(): void {
        debugLog('Mock Socket: Disconnecting...');
        this.isConnected = false;
        this.emit('disconnect', { reason: 'client_disconnect' });
        this.listeners.clear();
    }

    // Verificar estado de conexión
    isConnectedToServer(): boolean {
        return this.isConnected;
    }

    // Registrar listener para eventos
    on(event: string, callback: (data: any) => void): void {
        debugLog(`Mock Socket: Registering listener for event: ${event}`);

        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        this.listeners.get(event)?.push({ event, callback });
    }

    // Remover listener
    off(event: string, callback?: (data: any) => void): void {
        debugLog(`Mock Socket: Removing listener for event: ${event}`);

        if (!callback) {
            // Remover todos los listeners del evento
            this.listeners.delete(event);
            return;
        }

        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            const index = eventListeners.findIndex(l => l.callback === callback);
            if (index !== -1) {
                eventListeners.splice(index, 1);
            }
        }
    }

    // Emitir evento a los listeners
    private emit(event: string, data: any): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(listener => {
                try {
                    listener.callback(data);
                } catch (error) {
                    debugLog(`Error in mock socket listener for ${event}:`, error);
                }
            });
        }
    }

    // Enviar mensaje al servidor (simulado)
    send(event: string, data: any): void {
        debugLog(`Mock Socket: Sending event ${event}:`, data);

        if (!this.isConnected) {
            debugLog('Mock Socket: Not connected, cannot send message');
            return;
        }

        // Simular respuesta del servidor
        setTimeout(() => {
            this.handleServerResponse(event, data);
        }, 100 + Math.random() * 500);
    }

    // Simular respuestas del servidor
    private handleServerResponse(event: string, originalData: any): void {
        switch (event) {
            case 'join_room':
                this.emit('room_joined', {
                    room: originalData.room,
                    users: ['demo_user', 'other_user'],
                    timestamp: new Date().toISOString()
                });
                break;

            case 'leave_room':
                this.emit('room_left', {
                    room: originalData.room,
                    timestamp: new Date().toISOString()
                });
                break;

            case 'send_message':
                // Simular mensaje enviado exitosamente
                this.emit('message_sent', {
                    id: Date.now(),
                    ...originalData,
                    timestamp: new Date().toISOString(),
                    status: 'sent'
                });

                // Simular respuesta del otro usuario después de un delay
                setTimeout(() => {
                    this.simulateIncomingMessage(originalData);
                }, 2000 + Math.random() * 5000);
                break;

            case 'typing_start':
                this.emit('user_typing', {
                    userId: originalData.userId,
                    room: originalData.room,
                    timestamp: new Date().toISOString()
                });
                break;

            case 'typing_stop':
                this.emit('user_stopped_typing', {
                    userId: originalData.userId,
                    room: originalData.room,
                    timestamp: new Date().toISOString()
                });
                break;

            case 'request_match':
                this.emit('match_requested', {
                    ...originalData,
                    status: 'pending',
                    timestamp: new Date().toISOString()
                });
                break;

            case 'accept_match':
                this.emit('match_accepted', {
                    ...originalData,
                    status: 'accepted',
                    timestamp: new Date().toISOString()
                });
                break;

            case 'reject_match':
                this.emit('match_rejected', {
                    ...originalData,
                    status: 'rejected',
                    timestamp: new Date().toISOString()
                });
                break;

            default:
                debugLog(`Mock Socket: No handler for event: ${event}`);
        }
    }

    // Simular mensaje entrante
    private simulateIncomingMessage(originalMessage: any): void {
        const responses = [
            "¡Interesante propuesta!",
            "Me gustaría saber más detalles",
            "¿Cuándo podríamos empezar?",
            "Perfecto, ¿hablamos por videollamada?",
            "Tengo experiencia en eso, te puedo ayudar"
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        this.emit('new_message', {
            id: Date.now(),
            content: randomResponse,
            senderId: 2, // Usuario diferente al remitente original
            receiverId: originalMessage.receiverId,
            room: originalMessage.room,
            timestamp: new Date().toISOString(),
            type: 'text'
        });
    }

    // Iniciar eventos periódicos para simular actividad
    private startPeriodicEvents(): void {
        if (!PREVIEW_MODE) return;

        // Simular notificaciones periódicas
        setInterval(() => {
            if (this.isConnected && Math.random() < 0.1) { // 10% de probabilidad cada minuto
                this.simulateNotification();
            }
        }, 60000); // Cada minuto

        // Simular usuarios conectándose/desconectándose
        setInterval(() => {
            if (this.isConnected && Math.random() < 0.2) { // 20% de probabilidad
                this.simulateUserStatusChange();
            }
        }, 30000); // Cada 30 segundos

        // Simular actualizaciones de estado
        setInterval(() => {
            if (this.isConnected) {
                this.emit('server_status', {
                    connected_users: Math.floor(Math.random() * 50) + 10,
                    active_matches: Math.floor(Math.random() * 20) + 5,
                    timestamp: new Date().toISOString()
                });
            }
        }, 120000); // Cada 2 minutos
    }

    // Simular notificación
    private simulateNotification(): void {
        const notifications = [
            {
                type: 'match',
                title: 'Nuevo match disponible',
                message: 'Alguien está interesado en tu habilidad de JavaScript',
                icon: '🎯'
            },
            {
                type: 'message',
                title: 'Nuevo mensaje',
                message: 'Tienes un mensaje sin leer',
                icon: '💬'
            },
            {
                type: 'session',
                title: 'Sesión próxima',
                message: 'Tu sesión de intercambio es en 1 hora',
                icon: '⏰'
            }
        ];

        const notification = notifications[Math.floor(Math.random() * notifications.length)];

        this.emit('notification', {
            ...notification,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false
        });
    }

    // Simular cambio de estado de usuarios
    private simulateUserStatusChange(): void {
        const users = this.cache.getUsers();
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const statuses = ['online', 'offline', 'busy', 'away'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        this.emit('user_status_change', {
            userId: randomUser.id,
            username: randomUser.nombre_usuario,
            status: randomStatus,
            timestamp: new Date().toISOString()
        });
    }

    // Métodos específicos para diferentes funcionalidades

    // Chat en tiempo real
    joinChatRoom(roomId: string): void {
        this.send('join_room', { room: roomId });
    }

    leaveChatRoom(roomId: string): void {
        this.send('leave_room', { room: roomId });
    }

    sendChatMessage(roomId: string, message: string, receiverId: number): void {
        this.send('send_message', {
            room: roomId,
            content: message,
            receiverId,
            type: 'text'
        });
    }

    startTyping(roomId: string, userId: number): void {
        this.send('typing_start', { room: roomId, userId });
    }

    stopTyping(roomId: string, userId: number): void {
        this.send('typing_stop', { room: roomId, userId });
    }

    // Sistema de matches
    requestMatch(targetUserId: number, postId?: number): void {
        this.send('request_match', { targetUserId, postId });
    }

    acceptMatch(matchId: number): void {
        this.send('accept_match', { matchId });
    }

    rejectMatch(matchId: number): void {
        this.send('reject_match', { matchId });
    }

    // Notificaciones en tiempo real
    subscribeToNotifications(userId: number): void {
        this.send('subscribe_notifications', { userId });
    }

    unsubscribeFromNotifications(userId: number): void {
        this.send('unsubscribe_notifications', { userId });
    }

    // Estado de la aplicación
    updateUserStatus(status: 'online' | 'offline' | 'busy' | 'away'): void {
        this.send('update_status', { status });
    }

    // Utilidades para desarrollo
    simulateServerEvent(eventName: string, data: any): void {
        debugLog(`Mock Socket: Simulating server event: ${eventName}`, data);
        setTimeout(() => {
            this.emit(eventName, data);
        }, 100);
    }

    getConnectionInfo(): any {
        return {
            connected: this.isConnected,
            connectionId: this.connectionId,
            activeListeners: Array.from(this.listeners.keys()),
            mode: 'preview'
        };
    }
}

// Exportar instancia singleton
export const previewSocket = PreviewSocketService.getInstance();

// Función helper para usar condicionalmente
export const getSocketService = () => {
    if (PREVIEW_MODE) {
        return previewSocket;
    }
    // En modo real, retornar el servicio real de Socket.IO
    // return realSocketService;
    return previewSocket; // Por ahora siempre retornar el mock
};

export default previewSocket;
