/**
 * Servicio Mock para WebSocket/Socket.IO en modo preview
 * Simula la funcionalidad de WebSocket sin conexión real al servidor
 */

import { PREVIEW_MODE, debugLog } from '../config/app-config';
import { PreviewCache } from './preview-data';

export interface MockSocketEvent {
    event: string;
    data: any;
    timestamp: string;
}

export class PreviewWebSocketService {
    private static instance: PreviewWebSocketService;
    private cache: PreviewCache;
    private eventHandlers: Map<string, Function[]> = new Map();
    private isConnected: boolean = false;
    private connectionDelay: number = 1000;
    private heartbeatInterval: NodeJS.Timeout | null = null;

    private constructor() {
        this.cache = PreviewCache.getInstance();
    }

    static getInstance(): PreviewWebSocketService {
        if (!PreviewWebSocketService.instance) {
            PreviewWebSocketService.instance = new PreviewWebSocketService();
        }
        return PreviewWebSocketService.instance;
    }

    // Simular conexión
    async connect(): Promise<boolean> {
        if (!PREVIEW_MODE) {
            debugLog('Not in preview mode, skipping mock WebSocket connection');
            return false;
        }

        debugLog('Mock WebSocket: Connecting...');

        // Simular delay de conexión
        await new Promise(resolve => setTimeout(resolve, this.connectionDelay));

        this.isConnected = true;
        debugLog('Mock WebSocket: Connected');

        // Emitir evento de conexión
        this.emit('connect', {
            message: 'Connected to mock WebSocket',
            timestamp: new Date().toISOString()
        });

        // Iniciar heartbeat simulado
        this.startHeartbeat();

        // Simular algunos eventos iniciales
        this.simulateInitialEvents();

        return true;
    }

    // Simular desconexión
    disconnect(): void {
        if (!this.isConnected) return;

        debugLog('Mock WebSocket: Disconnecting...');

        this.isConnected = false;

        // Detener heartbeat
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }

        // Emitir evento de desconexión
        this.emit('disconnect', {
            message: 'Disconnected from mock WebSocket',
            timestamp: new Date().toISOString()
        });

        debugLog('Mock WebSocket: Disconnected');
    }

    // Registrar event handler
    on(event: string, handler: Function): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event)!.push(handler);
        debugLog(`Mock WebSocket: Handler registered for event '${event}'`);
    }

    // Desregistrar event handler
    off(event: string, handler?: Function): void {
        if (!this.eventHandlers.has(event)) return;

        if (handler) {
            const handlers = this.eventHandlers.get(event)!;
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        } else {
            this.eventHandlers.delete(event);
        }

        debugLog(`Mock WebSocket: Handler removed for event '${event}'`);
    }

    // Emitir evento (interno)
    private emit(event: string, data: any): void {
        if (!this.eventHandlers.has(event)) return;

        const handlers = this.eventHandlers.get(event)!;
        debugLog(`Mock WebSocket: Emitting event '${event}' to ${handlers.length} handlers`, data);

        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in WebSocket event handler for '${event}':`, error);
            }
        });
    }

    // Enviar mensaje (simular envío al servidor)
    send(event: string, data: any): void {
        if (!this.isConnected) {
            debugLog('Mock WebSocket: Cannot send - not connected');
            return;
        }

        debugLog(`Mock WebSocket: Sending event '${event}'`, data);

        // Simular procesamiento del servidor y respuesta
        setTimeout(() => {
            this.handleServerEvent(event, data);
        }, 100 + Math.random() * 300);
    }

    // Simular respuesta del servidor
    private handleServerEvent(event: string, data: any): void {
        const currentUser = this.cache.getCurrentUser();
        if (!currentUser) return;

        switch (event) {
            case 'join_room':
                this.emit('room_joined', {
                    room: data.room,
                    userId: currentUser.id,
                    timestamp: new Date().toISOString()
                });
                break;

            case 'leave_room':
                this.emit('room_left', {
                    room: data.room,
                    userId: currentUser.id,
                    timestamp: new Date().toISOString()
                });
                break;

            case 'send_message':
                // Simular mensaje enviado
                const newMessage = {
                    id: Date.now(),
                    contenido: data.message,
                    emisor_id: currentUser.id,
                    receptor_id: data.recipientId,
                    fecha_envio: new Date().toISOString(),
                    leido: false,
                    match_id: data.matchId
                };

                this.cache.addMessage(newMessage);

                // Emitir a remitente
                this.emit('message_sent', newMessage);

                // Simular recepción del destinatario (si está online)
                setTimeout(() => {
                    this.emit('new_message', newMessage);
                }, 500);
                break;

            case 'typing_start':
                this.emit('user_typing', {
                    userId: currentUser.id,
                    typing: true,
                    timestamp: new Date().toISOString()
                });
                break;

            case 'typing_stop':
                this.emit('user_typing', {
                    userId: currentUser.id,
                    typing: false,
                    timestamp: new Date().toISOString()
                });
                break;

            case 'match_request':
                // Simular solicitud de match
                this.emit('match_request_sent', {
                    fromUserId: currentUser.id,
                    toUserId: data.toUserId,
                    postId: data.postId,
                    timestamp: new Date().toISOString()
                });
                break;

            case 'match_response':
                // Simular respuesta a match
                this.emit('match_response_sent', {
                    matchId: data.matchId,
                    response: data.response,
                    timestamp: new Date().toISOString()
                });
                break;

            default:
                debugLog(`Mock WebSocket: Unknown event '${event}'`);
        }
    }

    // Iniciar heartbeat simulado
    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                this.emit('heartbeat', {
                    timestamp: new Date().toISOString()
                });
            }
        }, 30000); // Cada 30 segundos
    }

    // Simular eventos iniciales después de la conexión
    private simulateInitialEvents(): void {
        const currentUser = this.cache.getCurrentUser();
        if (!currentUser) return;

        // Simular notificaciones pendientes
        setTimeout(() => {
            const notifications = this.cache.getNotificationsByUserId(currentUser.id)
                .filter(n => !n.leido);

            if (notifications.length > 0) {
                this.emit('pending_notifications', {
                    count: notifications.length,
                    notifications: notifications.slice(0, 3), // Solo las 3 más recientes
                    timestamp: new Date().toISOString()
                });
            }
        }, 2000);

        // Simular actividad de otros usuarios
        setTimeout(() => {
            this.simulateUserActivity();
        }, 5000);
    }

    // Simular actividad de otros usuarios
    private simulateUserActivity(): void {
        const events = [
            {
                type: 'user_online',
                data: { userId: 2, status: 'online' }
            },
            {
                type: 'new_post',
                data: {
                    postId: Date.now(),
                    title: 'Nueva publicación disponible',
                    category: 'Desarrollo Web'
                }
            },
            {
                type: 'match_notification',
                data: {
                    message: 'Tienes una nueva solicitud de intercambio',
                    type: 'match_request'
                }
            }
        ];

        events.forEach((event, index) => {
            setTimeout(() => {
                this.emit(event.type, {
                    ...event.data,
                    timestamp: new Date().toISOString()
                });
            }, (index + 1) * 10000); // Espaciar eventos cada 10 segundos
        });
    }

    // Métodos de utilidad
    isWebSocketConnected(): boolean {
        return this.isConnected;
    }

    getConnectionStatus(): string {
        return this.isConnected ? 'connected' : 'disconnected';
    }

    // Simular eventos específicos para testing
    simulateEvent(event: string, data: any): void {
        if (PREVIEW_MODE) {
            debugLog(`Mock WebSocket: Simulating event '${event}'`, data);
            this.emit(event, {
                ...data,
                timestamp: new Date().toISOString(),
                simulated: true
            });
        }
    }

    // Simular mensajes de chat en tiempo real
    simulateIncomingMessage(fromUserId: number, content: string, matchId?: number): void {
        if (!PREVIEW_MODE) return;

        const mockMessage = {
            id: Date.now(),
            contenido: content,
            emisor_id: fromUserId,
            receptor_id: this.cache.getCurrentUser()?.id || 1,
            fecha_envio: new Date().toISOString(),
            leido: false,
            match_id: matchId
        };

        this.cache.addMessage(mockMessage);

        this.emit('new_message', mockMessage);
        debugLog('Mock WebSocket: Simulated incoming message', mockMessage);
    }

    // Simular notificación en tiempo real
    simulateNotification(title: string, message: string, type: string = 'info'): void {
        if (!PREVIEW_MODE) return;

        const currentUser = this.cache.getCurrentUser();
        if (!currentUser) return;

        const mockNotification = {
            id: Date.now(),
            usuario_id: currentUser.id,
            titulo: title,
            mensaje: message,
            tipo: type,
            fecha_creacion: new Date().toISOString(),
            leido: false
        };

        this.cache.addNotification(mockNotification);

        this.emit('new_notification', mockNotification);
        debugLog('Mock WebSocket: Simulated notification', mockNotification);
    }

    // Limpiar todos los handlers
    clearAllHandlers(): void {
        this.eventHandlers.clear();
        debugLog('Mock WebSocket: All event handlers cleared');
    }
}

// Exportar instancia singleton
export const previewWebSocket = PreviewWebSocketService.getInstance();

// Función helper para usar WebSocket condicionalmente
export const useWebSocket = () => {
    if (PREVIEW_MODE) {
        return previewWebSocket;
    }

    // En modo real, devolver el cliente WebSocket real
    // Este será implementado por el código existente
    return null;
};
