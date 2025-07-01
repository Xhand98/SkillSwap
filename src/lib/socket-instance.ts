import { Server as SocketIOServer } from 'socket.io';

// Declaración global para persistir a través de hot reloads
declare global {
  var __socketIOInstance: SocketIOServer | undefined;
  var __socketIOInitialized: boolean | undefined;
}

/**
 * Singleton mejorado para manejar la instancia de Socket.IO
 * Utiliza variables globales para persistir a través de hot reloads de Next.js
 */
class SocketIOSingleton {
  private static instance: SocketIOSingleton;

  private constructor() {}

  public static getInstance(): SocketIOSingleton {
    if (!SocketIOSingleton.instance) {
      SocketIOSingleton.instance = new SocketIOSingleton();
    }
    return SocketIOSingleton.instance;
  }

  public setIO(io: SocketIOServer): void {
    global.__socketIOInstance = io;
    global.__socketIOInitialized = true;
    console.log('✅ Socket.IO singleton actualizado con persistencia global');
  }

  public getIO(): SocketIOServer | null {
    return global.__socketIOInstance || null;
  }

  public isReady(): boolean {
    return Boolean(global.__socketIOInitialized && global.__socketIOInstance);
  }

  public broadcastToRoom(roomName: string, eventName: string, data: any): boolean {
    const io = this.getIO();
    if (!io) {
      console.error('❌ Socket.IO no está disponible para broadcast');
      return false;
    }

    try {
      io.to(roomName).emit(eventName, {
        ...data,
        timestamp: new Date().toISOString(),
      });
      console.log(`📡 Broadcast enviado a ${roomName}: ${eventName}`);
      return true;
    } catch (error) {
      console.error('❌ Error en broadcast:', error);
      return false;
    }
  }

  public async getRoomUsers(roomName: string): Promise<number[]> {
    const io = this.getIO();
    if (!io) {
      console.error('❌ Socket.IO no está disponible para obtener usuarios');
      return [];
    }

    try {
      const sockets = await io.in(roomName).fetchSockets();
      return sockets.map(socket => (socket as any).userId).filter(Boolean);
    } catch (error) {
      console.error('❌ Error al obtener usuarios de la sala:', error);
      return [];
    }
  }

  public getStats(): { initialized: boolean; connectedSockets: number; globalPresent: boolean } {
    const io = this.getIO();
    return {
      initialized: this.isReady(),
      connectedSockets: io ? io.engine.clientsCount : 0,
      globalPresent: Boolean(global.__socketIOInstance),
    };
  }
}

// Exportar la instancia singleton
export const socketSingleton = SocketIOSingleton.getInstance();

// También exportar como default para mayor compatibilidad
export default socketSingleton;
