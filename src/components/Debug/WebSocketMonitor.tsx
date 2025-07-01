"use client";

import { useState, useEffect } from "react";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Bug, 
  Shield,
  Info,
  AlertTriangle, 
  Check 
} from "lucide-react";
import { 
  areWebSocketsEnabled, 
  setWebSocketsEnabled, 
  setWebSocketDebug 
} from "@/utils/websocket-config";
import { websocketHealth } from "@/utils/websocket-health";

/**
 * Panel de monitoreo y diagnóstico para WebSockets
 * - Muestra estadísticas de conexiones
 * - Permite habilitar/deshabilitar WebSockets
 * - Ofrece herramientas de depuración
 */
export default function WebSocketMonitor() {
  const [enabled, setEnabled] = useState(false);
  const [debug, setDebug] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Cargar configuración inicial
  useEffect(() => {
    setEnabled(areWebSocketsEnabled());
    setDebug(localStorage.getItem("websocket_debug") === "true");
    updateHealthData();

    // Actualizar datos periódicamente
    const interval = setInterval(updateHealthData, 5000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  // Actualizar datos de salud
  const updateHealthData = () => {
    const data = websocketHealth.getHealthData();
    setHealthData(data);
  };

  // Cambiar estado de WebSockets
  const toggleWebSockets = () => {
    const newState = !enabled;
    setEnabled(newState);
    setWebSocketsEnabled(newState);
    updateHealthData();
  };

  // Cambiar modo debug
  const toggleDebug = () => {
    const newState = !debug;
    setDebug(newState);
    setWebSocketDebug(newState);
    localStorage.setItem("websocket_debug", String(newState));
  };

  // Resetear estadísticas
  const resetStats = () => {
    websocketHealth.resetErrorState();
    updateHealthData();
    setRefreshKey(prev => prev + 1);
  };

  // Determinar el estado general de la conexión
  const getConnectionStatus = () => {
    if (!enabled) return "disabled";
    if (healthData?.isInErrorLoop) return "error-loop";
    if (healthData?.emptyErrors > 2) return "empty-errors";
    if (healthData?.failedConnections > healthData?.successfulConnections) return "failing";
    if (healthData?.successfulConnections > 0) return "connected";
    return "unknown";
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {connectionStatus === "disabled" && <WifiOff className="h-5 w-5 text-gray-500" />}
          {connectionStatus === "connected" && <Wifi className="h-5 w-5 text-green-500" />}
          {connectionStatus === "error-loop" && <AlertTriangle className="h-5 w-5 text-red-500" />}
          {connectionStatus === "empty-errors" && <Bug className="h-5 w-5 text-orange-500" />}
          {connectionStatus === "failing" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
          {connectionStatus === "unknown" && <Info className="h-5 w-5 text-blue-500" />}
          
          <h2 className="text-lg font-medium">
            Monitor WebSocket
          </h2>
          
          <span className={`text-sm px-2 py-1 rounded-full ${
            connectionStatus === "disabled" ? "bg-gray-200 text-gray-700" :
            connectionStatus === "connected" ? "bg-green-100 text-green-800" :
            connectionStatus === "error-loop" ? "bg-red-100 text-red-800" :
            connectionStatus === "empty-errors" ? "bg-orange-100 text-orange-800" :
            connectionStatus === "failing" ? "bg-amber-100 text-amber-800" :
            "bg-blue-100 text-blue-800"
          }`}>
            {connectionStatus === "disabled" && "Desactivado"}
            {connectionStatus === "connected" && "Conectado"}
            {connectionStatus === "error-loop" && "Bucle de errores"}
            {connectionStatus === "empty-errors" && "Errores de conexión"}
            {connectionStatus === "failing" && "Conexión inestable"}
            {connectionStatus === "unknown" && "Estado desconocido"}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
            title={expanded ? "Colapsar panel" : "Expandir panel"}
          >
            {expanded ? "-" : "+"}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="font-medium text-sm text-gray-700 mb-2">Estado</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Conexiones totales</div>
                <div className="text-right font-medium">{healthData?.totalConnections || 0}</div>
                <div>Conexiones exitosas</div>
                <div className="text-right font-medium">{healthData?.successfulConnections || 0}</div>
                <div>Conexiones fallidas</div>
                <div className="text-right font-medium">{healthData?.failedConnections || 0}</div>
                <div>Errores vacíos {"{}"}</div>
                <div className="text-right font-medium">{healthData?.emptyErrors || 0}</div>
                <div>Reconexiones</div>
                <div className="text-right font-medium">{healthData?.reconnectAttempts || 0}</div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="font-medium text-sm text-gray-700 mb-2">Depuración</div>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="enabled-toggle" 
                    className="mr-2" 
                    checked={enabled} 
                    onChange={toggleWebSockets}
                  />
                  <label htmlFor="enabled-toggle" className="text-sm cursor-pointer">
                    WebSockets {enabled ? "activados" : "desactivados"}
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="debug-toggle" 
                    className="mr-2" 
                    checked={debug} 
                    onChange={toggleDebug}
                  />
                  <label htmlFor="debug-toggle" className="text-sm cursor-pointer">
                    Modo debug {debug ? "activado" : "desactivado"}
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <button 
              onClick={updateHealthData}
              className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Actualizar
            </button>
            
            <button 
              onClick={resetStats}
              className="text-sm px-3 py-1.5 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 flex items-center"
            >
              <Shield className="h-3 w-3 mr-1" /> Resetear estadísticas
            </button>
          </div>
          
          {healthData?.isInErrorLoop && (
            <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">
              <div className="font-medium">⚠️ Bucle de errores detectado</div>
              <p className="mt-1">
                Se ha detectado un patrón repetitivo de errores. Los WebSockets han sido
                desactivados temporalmente para evitar sobrecarga en el servidor.
              </p>
            </div>
          )}
          
          {healthData?.emptyErrors > 2 && (
            <div className="mt-4 p-3 bg-orange-50 text-orange-800 rounded-md text-sm">
              <div className="font-medium">⚠️ Múltiples errores de conexión vacíos</div>
              <p className="mt-1">
                Se han detectado errores vacíos repetitivos ({}), lo que suele indicar
                problemas de CORS, conectividad o configuración del servidor.
              </p>
            </div>
          )}
          
          {debug && healthData?.lastError && (
            <div className="mt-4 p-3 bg-gray-50 text-gray-800 rounded-md text-xs font-mono overflow-auto max-h-32">
              <div className="font-medium mb-1">Último error:</div>
              <pre>{JSON.stringify(healthData?.lastError, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
