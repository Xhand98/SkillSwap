"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WebSocketMonitor from "@/components/Debug/WebSocketMonitor";

export default function WebSocketDebugPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Recuperar ID de usuario desde localStorage o sessionStorage
    const storedUserId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico de WebSockets</h1>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          Esta página permite diagnosticar y resolver problemas con las conexiones WebSocket
          de la aplicación. Puedes activar/desactivar las conexiones y ver estadísticas en
          tiempo real.
        </p>
        
        {userId ? (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            Usuario actual: ID {userId}
          </div>
        ) : (
          <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
            No se detectó ningún usuario conectado
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <WebSocketMonitor />
      </div>
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-8">
        <h2 className="text-lg font-medium mb-4">Solución de problemas comunes</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Errores vacíos {"{}"}</h3>
            <p className="text-sm text-gray-600">
              Los errores vacíos suelen indicar problemas de CORS, conexión de red o un servidor no disponible. 
              Verifica que el servidor backend esté en ejecución y configurado correctamente.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Bucles de conexión</h3>
            <p className="text-sm text-gray-600">
              Los bucles ocurren cuando el cliente intenta reconectarse continuamente sin éxito. 
              El sistema desactiva automáticamente los WebSockets cuando detecta un bucle para evitar
              sobrecarga en el servidor.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Modo sin conexión</h3>
            <p className="text-sm text-gray-600">
              Puedes usar la aplicación con WebSockets desactivados. Las actualizaciones requerirán
              refrescar la página manualmente, pero todas las funcionalidades básicas seguirán disponibles.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Volver
        </button>
        
        <button
          onClick={() => {
            localStorage.removeItem("websocket_enabled");
            window.location.reload();
          }}
          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
        >
          Restablecer configuración
        </button>
      </div>
    </div>
  );
}
