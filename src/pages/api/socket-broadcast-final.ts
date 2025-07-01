import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🚀 Endpoint de broadcast final ejecutándose");
  
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

    // Acceder a Socket.IO a través del servidor HTTP (la manera que funciona)
    const socketRes = res as any;
    const io = socketRes.socket.server.io;
    
    console.log("🔍 Verificando Socket.IO en servidor HTTP:");
    console.log("  - io disponible:", Boolean(io));
    
    if (!io) {
      console.log("❌ Socket.IO no está disponible en el servidor HTTP");
      return res.status(500).json({
        error: "Socket.IO no está inicializado. Accede a /api/socket primero.",
        code: 0,
        message: "Transport unknown",
      });
    }

    // Enviar mensaje
    console.log(`📡 Enviando broadcast a ${roomName}: ${eventName}`);
    io.to(roomName).emit(eventName, {
      ...data,
      timestamp: new Date().toISOString(),
    });

    console.log("✅ Broadcast enviado exitosamente");

    res.status(200).json({
      success: true,
      message: "Mensaje enviado exitosamente",
      roomName,
      eventName,
      connectedClients: io.engine.clientsCount,
    });

  } catch (error) {
    console.error("❌ Error en broadcast:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}
