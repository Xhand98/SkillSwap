import { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

// Declaración global para acceder a Socket.IO
declare global {
    var __socketIOInstance: SocketIOServer | undefined;
    var __socketIOInitialized: boolean | undefined;
}

// API endpoint para que el backend Go pueda enviar mensajes Socket.IO
const socketBroadcastHandler = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método no permitido" });
    }

    try {
        const { roomName, eventName, data, authToken } = req.body;

        // Verificación básica de autenticación
        const expectedToken =
            process.env.SOCKET_AUTH_TOKEN || "default-secret-token";
        if (authToken !== expectedToken) {
            return res.status(401).json({ error: "Token de autenticación inválido" });
        }

        // Validar parámetros requeridos
        if (!roomName || !eventName || !data) {
            return res.status(400).json({
                error: "Parámetros requeridos: roomName, eventName, data",
            });
        } // Verificar disponibilidad de Socket.IO usando variables globales
        console.log("🔍 Verificando estado de Socket.IO:");
        console.log(
            "  - __socketIOInitialized:",
            Boolean(global.__socketIOInitialized)
        );
        console.log("  - __socketIOInstance:", Boolean(global.__socketIOInstance));

        if (!global.__socketIOInitialized || !global.__socketIOInstance) {
            console.log(
                "❌ Socket.IO no está disponible a través de variables globales"
            );
            return res.status(500).json({
                error: "Socket.IO no está inicializado. Accede a /api/socket primero.",
                code: 0,
                message: "Transport unknown",
            });
        }

        // Enviar mensaje usando variables globales
        try {
            global.__socketIOInstance.to(roomName).emit(eventName, {
                ...data,
                timestamp: new Date().toISOString(),
            });

            console.log(`📡 Broadcast enviado a ${roomName}: ${eventName}`, data);

            res.status(200).json({
                success: true,
                message: "Mensaje enviado exitosamente",
                roomName,
                eventName,
                stats: {
                    initialized: true,
                    connectedSockets: global.__socketIOInstance.engine.clientsCount,
                },
            });
        } catch (broadcastError) {
            console.error("❌ Error en broadcast:", broadcastError);
            return res.status(500).json({
                error: "Error al enviar el mensaje",
                code: 1,
                message: "Broadcast failed",
                details:
                    broadcastError instanceof Error
                        ? broadcastError.message
                        : "Error desconocido",
            });
        }
    } catch (error) {
        console.error("❌ Error al enviar mensaje Socket.IO:", error);
        res.status(500).json({
            error: "Error interno del servidor",
            details: error instanceof Error ? error.message : "Error desconocido",
        });
    }
};

export default socketBroadcastHandler;
