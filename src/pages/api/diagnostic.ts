import { NextApiRequest, NextApiResponse } from "next";
import { DefaultEventsMap, Server } from "socket.io";

// Declaración global para acceder a las variables
declare global {
    var __socketIOInstance:
        | Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
        | undefined;
    var __socketIOInitialized: boolean | undefined;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("🔍 Endpoint de diagnóstico ejecutándose");
    res.status(200).json({
        message: "Diagnóstico funcionando",
        timestamp: new Date().toISOString(),
        globals: {
            socketIOInstance: Boolean(global.__socketIOInstance),
            socketIOInitialized: Boolean(global.__socketIOInitialized),
        },
    });
}
