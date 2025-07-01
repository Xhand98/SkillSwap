import { Server as SocketIOServer } from 'socket.io';
import { Socket as ServerSocket } from 'socket.io';

// Variable global para mantener la instancia de Socket.IO
let globalSocketIO: SocketIOServer | null = null;

export const setGlobalSocketIO = (io: SocketIOServer) => {
    globalSocketIO = io;
    console.log('📡 Socket.IO guardado globalmente');
};

export const getGlobalSocketIO = (): SocketIOServer | null => {
    return globalSocketIO;
};

export const broadcastToRoom = (roomName: string, eventName: string, data: any): boolean => {
    if (!globalSocketIO) {
        console.error('❌ Socket.IO no está disponible para broadcast');
        return false;
    }

    try {
        globalSocketIO.to(roomName).emit(eventName, {
            ...data,
            timestamp: new Date().toISOString(),
        });

        console.log(`📡 Broadcast enviado a ${roomName}: ${eventName}`, data);
        return true;
    } catch (error) {
        console.error('❌ Error en broadcast:', error);
        return false;
    }
};

export const getRoomUsers = async (roomName: string): Promise<number[]> => {
    if (!globalSocketIO) {
        return [];
    }

    try {
        const sockets = await globalSocketIO.in(roomName).fetchSockets();
        return sockets.map(socket => (socket as any).userId).filter(Boolean);
    } catch (error) {
        console.error('❌ Error al obtener usuarios de la sala:', error);
        return [];
    }
};

export const isSocketIOReady = (): boolean => {
    return globalSocketIO !== null;
};
