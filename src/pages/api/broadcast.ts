import { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

// Declaración global para acceder a Socket.IO
declare global {
  var __socketIOInstance: SocketIOServer | undefined;
  var __socketIOInitialized: boolean | undefined;
}

// API endpoint con nombre diferente para evitar conflictos con Socket.IO
export default async function broadcastHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("🔥 BROADCAST HANDLER EJECUTÁNDOSE - MÉTODO:", req.method);
  console.log("🔥 URL:", req.url);
  console.log("🔥 Headers:", req.headers);

  if (req.method !== "POST") {
    console.log("❌ Método no permitido:", req.method);
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { roomName, eventName, data, authToken } = req.body;
    console.log("🔥 Body recibido:", { roomName, eventName, data, authToken });    // Verificación básica de autenticación
    const expectedToken =
      process.env.SOCKET_AUTH_TOKEN || "default-secret-token";
    console.log("🔑 Token esperado:", expectedToken, "| Tipo:", typeof expectedToken, "| Longitud:", expectedToken.length);
    console.log("🔑 Token recibido:", authToken, "| Tipo:", typeof authToken, "| Longitud:", authToken?.length);
    console.log("🔑 Tokens iguales:", authToken === expectedToken);
    console.log("🔑 Comparación manual:", JSON.stringify(authToken) === JSON.stringify(expectedToken));
    
    if (!authToken || authToken !== expectedToken) {
      console.log("❌ Token inválido");
      return res.status(401).json({ error: "Token de autenticación inválido" });
    }

    // Validar parámetros requeridos
    if (!roomName || !eventName || !data) {
      console.log("❌ Parámetros faltantes");
      return res.status(400).json({
        error: "Parámetros requeridos: roomName, eventName, data",
      });
    }

    // Verificar disponibilidad de Socket.IO usando variables globales
    console.log("🔍 Verificando estado de Socket.IO:");
    console.log("  - __socketIOInitialized:", Boolean(global.__socketIOInitialized));
    console.log("  - __socketIOInstance:", Boolean(global.__socketIOInstance));
    
    if (!global.__socketIOInitialized || !global.__socketIOInstance) {
      console.log("❌ Socket.IO no está disponible");
      return res.status(500).json({
        error: "Socket.IO no está inicializado. Accede a /api/socket primero.",
      });
    }

    // Enviar mensaje usando variables globales
    try {
      console.log("📡 Enviando broadcast...");
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
        details: broadcastError instanceof Error ? broadcastError.message : "Error desconocido",
      });
    }
  } catch (error) {
    console.error("❌ Error al procesar solicitud:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido",
    });  }
};
