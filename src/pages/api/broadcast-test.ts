import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { roomName, eventName, data } = req.body;

    // Verificar que Socket.IO esté disponible
    if (!global.__socketIOInitialized || !global.__socketIOInstance) {
      return res.status(500).json({
        error: "Socket.IO no está inicializado",
      });
    }

    // Enviar mensaje sin validación de token para prueba
    global.__socketIOInstance.to(roomName).emit(eventName, {
      ...data,
      timestamp: new Date().toISOString(),
    });

    console.log(`📡 Broadcast test enviado a ${roomName}: ${eventName}`, data);

    res.status(200).json({
      success: true,
      message: "Broadcast test enviado exitosamente",
      roomName,
      eventName,
    });
  } catch (error) {
    console.error("❌ Error en broadcast test:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}
