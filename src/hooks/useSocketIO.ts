"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

// Tipos para Socket.IO
export interface SocketIOMessage {
    type: string;
    data: any;
    user_id?: number;
    room_id?: string;
    timestamp: string;
}

interface UseSocketIOOptions {
    userId: number;
    onMessage?: (message: SocketIOMessage) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
    autoReconnect?: boolean;
    reconnectDelay?: number;
    maxReconnectAttempts?: number;
}

interface UseSocketIOReturn {
    isConnected: boolean;
    isReconnecting: boolean;
    socket: Socket | null;
    sendMessage: (eventName: string, data: any) => void;
    joinConversation: (conversationId: number) => void;
    leaveConversation: (conversationId: number) => void;
    joinPost: (postId: number) => void;
    leavePost: (postId: number) => void;
    startTyping: (conversationId: number) => void;
    stopTyping: (conversationId: number) => void;
    disconnect: () => void;
    reconnect: () => void;
    connectionError: string | null;
    isSocketIOEnabled: boolean;
    toggleSocketIO: (enabled?: boolean) => void;
}

// Configuración de Socket.IO
const SOCKET_URL = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
    : 'http://localhost:3000';

const SOCKET_PATH = '/api/socket';

// Estados globales para Socket.IO
let isSocketIOGloballyEnabled = true;

export const setSocketIOEnabled = (enabled: boolean) => {
    isSocketIOGloballyEnabled = enabled;
    if (typeof window !== 'undefined') {
        localStorage.setItem('socketio_enabled', enabled.toString());
    }
};

export const areSocketIOEnabled = (): boolean => {
    if (typeof window === 'undefined') return true;

    const stored = localStorage.getItem('socketio_enabled');
    if (stored !== null) {
        return stored === 'true';
    }
    return isSocketIOGloballyEnabled;
};

// Hook personalizado para Socket.IO
export const useSocketIO = ({
    userId,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
    reconnectDelay = 2000,
    maxReconnectAttempts = 5,
}: UseSocketIOOptions): UseSocketIOReturn => {

    const [isConnected, setIsConnected] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [isSocketIOEnabled, setIsSocketIOEnabledState] = useState(areSocketIOEnabled);

    const socketRef = useRef<Socket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const shouldReconnectRef = useRef(true);

    // Función de debug
    const debugLog = useCallback((message: string, ...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[SocketIO-${userId}] ${message}`, ...args);
        }
    }, [userId]);

    // Función para conectar Socket.IO
    const connect = useCallback(() => {
        if (!isSocketIOEnabled || !userId) {
            debugLog('Socket.IO deshabilitado o userId no válido');
            return;
        }

        if (socketRef.current?.connected) {
            debugLog('Socket.IO ya está conectado');
            return;
        }

        debugLog('Iniciando conexión Socket.IO...');
        setConnectionError(null);

        try {
            const socket = io(SOCKET_URL, {
                path: SOCKET_PATH,
                auth: {
                    userId: userId
                },
                query: {
                    user_id: userId
                },
                transports: ['websocket', 'polling'],
                autoConnect: true,
                reconnection: autoReconnect,
                reconnectionDelay: reconnectDelay,
                reconnectionAttempts: maxReconnectAttempts,
                timeout: 20000,
            });

            socketRef.current = socket;

            // Eventos de conexión
            socket.on('connect', () => {
                debugLog('✅ Conectado a Socket.IO');
                setIsConnected(true);
                setIsReconnecting(false);
                setConnectionError(null);
                reconnectAttemptsRef.current = 0;
                onConnect?.();
            });

            socket.on('disconnect', (reason) => {
                debugLog('❌ Desconectado de Socket.IO:', reason);
                setIsConnected(false);

                if (reason === 'io server disconnect') {
                    // El servidor forzó la desconexión, reconectar manualmente
                    socket.connect();
                }

                onDisconnect?.();
            });

            socket.on('reconnect', (attemptNumber) => {
                debugLog(`🔄 Reconectado después de ${attemptNumber} intentos`);
                setIsReconnecting(false);
                setConnectionError(null);
            });

            socket.on('reconnect_attempt', (attemptNumber) => {
                debugLog(`🔄 Intento de reconexión #${attemptNumber}`);
                setIsReconnecting(true);
            });

            socket.on('reconnect_error', (error) => {
                debugLog('❌ Error de reconexión:', error);
                setConnectionError('Error de reconexión: ' + error.message);
            });

            socket.on('connect_error', (error) => {
                debugLog('❌ Error de conexión:', error);
                setConnectionError('Error de conexión: ' + error.message);
                setIsConnected(false);

                if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
                    reconnectAttemptsRef.current++;
                    setIsReconnecting(true);
                } else {
                    setIsReconnecting(false);
                    onError?.(error);
                }
            });

            // Eventos de mensajes personalizados
            socket.on('new_message', (data) => {
                debugLog('💬 Nuevo mensaje recibido:', data);
                onMessage?.({
                    type: 'new_message',
                    data,
                    timestamp: data.timestamp || new Date().toISOString(),
                });
            });

            socket.on('user_typing_start', (data) => {
                debugLog('⌨️ Usuario comenzó a escribir:', data);
                onMessage?.({
                    type: 'user_typing_start',
                    data,
                    timestamp: data.timestamp || new Date().toISOString(),
                });
            });

            socket.on('user_typing_stop', (data) => {
                debugLog('⌨️ Usuario dejó de escribir:', data);
                onMessage?.({
                    type: 'user_typing_stop',
                    data,
                    timestamp: data.timestamp || new Date().toISOString(),
                });
            });

            socket.on('new_comment', (data) => {
                debugLog('💭 Nuevo comentario recibido:', data);
                onMessage?.({
                    type: 'new_comment',
                    data,
                    timestamp: data.timestamp || new Date().toISOString(),
                });
            });

            socket.on('user_joined_conversation', (data) => {
                debugLog('👤 Usuario se unió a conversación:', data);
                onMessage?.({
                    type: 'user_joined_conversation',
                    data,
                    timestamp: data.timestamp || new Date().toISOString(),
                });
            });

            socket.on('user_left_conversation', (data) => {
                debugLog('👋 Usuario salió de conversación:', data);
                onMessage?.({
                    type: 'user_left_conversation',
                    data,
                    timestamp: data.timestamp || new Date().toISOString(),
                });
            });

            socket.on('pong', (data) => {
                debugLog('🏓 Pong recibido:', data);
            });

            socket.on('error', (error) => {
                debugLog('❌ Error de Socket.IO:', error);
                onError?.(new Error(error));
            });

        } catch (error) {
            debugLog('❌ Error al crear Socket.IO:', error);
            setConnectionError('Error al crear conexión: ' + (error as Error).message);
            onError?.(error as Error);
        }
    }, [userId, isSocketIOEnabled, onConnect, onDisconnect, onMessage, onError, autoReconnect, reconnectDelay, maxReconnectAttempts, debugLog]);

    // Función para desconectar
    const disconnect = useCallback(() => {
        shouldReconnectRef.current = false;

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (socketRef.current) {
            debugLog('🔌 Desconectando Socket.IO...');
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        setIsConnected(false);
        setIsReconnecting(false);
        setConnectionError(null);
    }, [debugLog]);

    // Función para reconectar
    const reconnect = useCallback(() => {
        shouldReconnectRef.current = true;
        reconnectAttemptsRef.current = 0;
        setConnectionError(null);

        disconnect();
        setTimeout(connect, 100);
    }, [connect, disconnect]);

    // Función para enviar mensajes
    const sendMessage = useCallback((eventName: string, data: any) => {
        if (!isSocketIOEnabled) {
            console.warn('Socket.IO está deshabilitado. Mensaje no enviado:', eventName, data);
            return;
        }

        if (socketRef.current?.connected) {
            debugLog(`📤 Enviando evento: ${eventName}`, data);
            socketRef.current.emit(eventName, data);
        } else {
            console.warn(`Socket.IO no conectado. Evento ${eventName} no enviado:`, data);
        }
    }, [isSocketIOEnabled, debugLog]);

    // Funciones de conveniencia para conversaciones
    const joinConversation = useCallback((conversationId: number) => {
        sendMessage('join_conversation', { conversation_id: conversationId.toString() });
    }, [sendMessage]);

    const leaveConversation = useCallback((conversationId: number) => {
        sendMessage('leave_conversation', { conversation_id: conversationId.toString() });
    }, [sendMessage]);

    // Funciones para posts
    const joinPost = useCallback((postId: number) => {
        sendMessage('join_post', { post_id: postId.toString() });
    }, [sendMessage]);

    const leavePost = useCallback((postId: number) => {
        sendMessage('leave_post', { post_id: postId.toString() });
    }, [sendMessage]);

    // Funciones para typing indicators
    const startTyping = useCallback((conversationId: number) => {
        sendMessage('typing_start', { conversation_id: conversationId.toString() });
    }, [sendMessage]);

    const stopTyping = useCallback((conversationId: number) => {
        sendMessage('typing_stop', { conversation_id: conversationId.toString() });
    }, [sendMessage]);

    // Función para toggle Socket.IO
    const toggleSocketIO = useCallback((enabled?: boolean) => {
        const newState = enabled !== undefined ? enabled : !isSocketIOEnabled;
        setSocketIOEnabled(newState);
        setIsSocketIOEnabledState(newState);

        if (newState) {
            connect();
        } else {
            disconnect();
        }
    }, [isSocketIOEnabled, connect, disconnect]);

    // Efectos
    useEffect(() => {
        setIsSocketIOEnabledState(areSocketIOEnabled());
    }, []);

    useEffect(() => {
        if (isSocketIOEnabled && userId && shouldReconnectRef.current) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [userId, isSocketIOEnabled, connect, disconnect]);

    // Cleanup al desmontar
    useEffect(() => {
        return () => {
            shouldReconnectRef.current = false;
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        isReconnecting,
        socket: socketRef.current,
        sendMessage,
        joinConversation,
        leaveConversation,
        joinPost,
        leavePost,
        startTyping,
        stopTyping,
        disconnect,
        reconnect,
        connectionError,
        isSocketIOEnabled,
        toggleSocketIO,
    };
};

export default useSocketIO;
