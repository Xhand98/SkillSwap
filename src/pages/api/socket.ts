import { Server as ServerType } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { Socket as ServerSocket } from 'socket.io';
import { socketSingleton } from '../../lib/socket-instance';

// Tipos para los mensajes de Socket.IO
interface SocketMessage {
    type: string;
    data: any;
    user_id?: number;
    room_id?: string;
    time: string;
}

// Configuración de Socket.IO
const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
    // Solo inicializar Socket.IO una vez
    const socketRes = res as any;
    if (!socketRes.socket.server.io) {
        console.log('🚀 Inicializando servidor Socket.IO...');
        const io = new SocketIOServer(socketRes.socket.server, {
            path: '/api/socket',
            addTrailingSlash: false,
            cors: {
                origin: process.env.NODE_ENV === 'production'
                    ? process.env.NEXT_PUBLIC_FRONTEND_URL
                    : ["http://localhost:3000", "http://127.0.0.1:3000"],
                methods: ["GET", "POST"],
                credentials: true,
            },
            transports: ['websocket', 'polling'],
            pingTimeout: 60000,
            pingInterval: 25000,
        });

        // Middleware de autenticación
        io.use((socket: ServerSocket, next) => {
            const userId = socket.handshake.auth.userId || socket.handshake.query.user_id;

            if (!userId) {
                return next(new Error('No se proporcionó user_id'));
            }

            // Agregar userId al socket para uso posterior
            (socket as any).userId = parseInt(userId as string);
            console.log(`✅ Usuario ${userId} autenticado en Socket.IO`);
            next();
        });

        // Manejo de conexiones
        io.on('connection', (socket: ServerSocket) => {
            const userId = (socket as any).userId;
            console.log(`👤 Usuario ${userId} conectado via Socket.IO (${socket.id})`);

            // Eventos de conversaciones
            socket.on('join_conversation', (data: { conversation_id: string }) => {
                const roomName = `conversation_${data.conversation_id}`;
                socket.join(roomName);
                console.log(`🏠 Usuario ${userId} se unió a la conversación ${data.conversation_id}`);

                // Notificar a otros usuarios en la conversación que alguien se unió
                socket.to(roomName).emit('user_joined_conversation', {
                    user_id: userId,
                    conversation_id: data.conversation_id,
                    timestamp: new Date().toISOString(),
                });
            });

            socket.on('leave_conversation', (data: { conversation_id: string }) => {
                const roomName = `conversation_${data.conversation_id}`;
                socket.leave(roomName);
                console.log(`🚪 Usuario ${userId} salió de la conversación ${data.conversation_id}`);

                // Notificar a otros usuarios que alguien salió
                socket.to(roomName).emit('user_left_conversation', {
                    user_id: userId,
                    conversation_id: data.conversation_id,
                    timestamp: new Date().toISOString(),
                });
            });

            // Eventos de escritura
            socket.on('typing_start', (data: { conversation_id: string }) => {
                const roomName = `conversation_${data.conversation_id}`;
                socket.to(roomName).emit('user_typing_start', {
                    user_id: userId,
                    conversation_id: data.conversation_id,
                    timestamp: new Date().toISOString(),
                });
                console.log(`⌨️ Usuario ${userId} comenzó a escribir en conversación ${data.conversation_id}`);
            });

            socket.on('typing_stop', (data: { conversation_id: string }) => {
                const roomName = `conversation_${data.conversation_id}`;
                socket.to(roomName).emit('user_typing_stop', {
                    user_id: userId,
                    conversation_id: data.conversation_id,
                    timestamp: new Date().toISOString(),
                });
                console.log(`⌨️ Usuario ${userId} dejó de escribir en conversación ${data.conversation_id}`);
            });

            // Evento para mensajes en tiempo real (esto será manejado desde el backend Go)
            socket.on('new_message', (data: any) => {
                const roomName = `conversation_${data.conversation_id}`;
                // Retransmitir el mensaje a todos los usuarios en la conversación excepto el remitente
                socket.to(roomName).emit('new_message', {
                    ...data,
                    timestamp: new Date().toISOString(),
                });
                console.log(`💬 Nuevo mensaje en conversación ${data.conversation_id} de usuario ${userId}`);
            });

            // Eventos de comentarios (para posts)
            socket.on('join_post', (data: { post_id: string }) => {
                const roomName = `post_${data.post_id}`;
                socket.join(roomName);
                console.log(`📄 Usuario ${userId} se unió al post ${data.post_id}`);
            });

            socket.on('leave_post', (data: { post_id: string }) => {
                const roomName = `post_${data.post_id}`;
                socket.leave(roomName);
                console.log(`📄 Usuario ${userId} salió del post ${data.post_id}`);
            });

            socket.on('new_comment', (data: any) => {
                const roomName = `post_${data.post_id}`;
                socket.to(roomName).emit('new_comment', {
                    ...data,
                    timestamp: new Date().toISOString(),
                });
                console.log(`💭 Nuevo comentario en post ${data.post_id} de usuario ${userId}`);
            });

            // Manejo de ping/pong para mantener la conexión
            socket.on('ping', () => {
                socket.emit('pong', { timestamp: new Date().toISOString() });
            });

            // Evento de desconexión
            socket.on('disconnect', (reason) => {
                console.log(`👋 Usuario ${userId} desconectado: ${reason}`);
            });

            // Manejo de errores
            socket.on('error', (error) => {
                console.error(`❌ Error en socket para usuario ${userId}:`, error);
            });
        });

        // Método para enviar mensajes desde el servidor Go
        (io as any).broadcastMessage = (roomName: string, eventName: string, data: any) => {
            io.to(roomName).emit(eventName, data);
            console.log(`📡 Mensaje broadcast enviado a ${roomName}: ${eventName}`);
        };    // Método para obtener usuarios conectados en una sala
        (io as any).getRoomUsers = async (roomName: string) => {
            const sockets = await io.in(roomName).fetchSockets();
            return sockets.map(socket => (socket as any).userId);
        }; socketRes.socket.server.io = io;
        socketSingleton.setIO(io);  // Usar el singleton para guardar la instancia
        console.log('✅ Servidor Socket.IO configurado exitosamente');
    } else {
        console.log('♻️ Servidor Socket.IO ya está en funcionamiento');
        // Asegurar que el singleton tenga la instancia actual
        if (!socketSingleton.isReady()) {
            socketSingleton.setIO(socketRes.socket.server.io);
        }
    }

    res.end();
};

export default SocketHandler;
