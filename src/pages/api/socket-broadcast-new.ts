import { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

// Declaración global
declare global {
  var __socketIOInstance: SocketIOServer | undefined;
  var __socketIOInitialized: boolean | undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🚀 Endpoint de broadcast nuevo ejecutándose");
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { roomName, eventName, data, authToken } = req.body;

    // Verificación básica de autenticación
    const expectedToken = process.env.SOCKET_AUTH_TOKEN || "default-secret-token";
    if (authToken !== expectedToken) {
      return res.status(401).json({ error: "Token de autenticación inválido" });
    }

    // Validar parámetros requeridos
    if (!roomName || !eventName || !data) {
      return res.status(400).json({
        error: "Parámetros requeridos: roomName, eventName, data",
      });
    }

    // Verificar disponibilidad de Socket.IO
    console.log("🔍 Verificando variables globales:");
    console.log("  - __socketIOInitialized:", Boolean(global.__socketIOInitialized));
    console.log("  - __socketIOInstance:", Boolean(global.__socketIOInstance));
    
    if (!global.__socketIOInitialized || !global.__socketIOInstance) {
      console.log("❌ Socket.IO no está disponible");
      return res.status(500).json({
        error: "Socket.IO no está inicializado. Accede a /api/socket primero.",
        code: 0,
        message: "Transport unknown",
      });
    }

    // Enviar mensaje
    console.log(`📡 Enviando broadcast a ${roomName}: ${eventName}`);
    global.__socketIOInstance.to(roomName).emit(eventName, {
      ...data,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Mensaje enviado exitosamente",
      roomName,
      eventName,
    });

  } catch (error) {
    console.error("❌ Error en broadcast:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}
