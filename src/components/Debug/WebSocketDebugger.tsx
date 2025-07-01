"use client";

import { useState, useEffect } from "react";
import { Cpu, WifiOff, Wifi, RefreshCw, AlertTriangle } from "lucide-react";
import { websocketHealth } from "@/utils/websocket-health";
import { WebSocketConfig, setWebSocketDebug } from "@/utils/websocket-config";

interface WebSocketDebuggerProps {
  userId?: number;
  getDiagnosticInfo?: () => any;
}

export default function WebSocketDebugger({
  userId,
  getDiagnosticInfo,
}: WebSocketDebuggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    // Verificar si el modo debug está activado
    const debug = localStorage.getItem("websocket_debug") === "true";
    setIsDebugMode(debug);

    // Actualizar datos cada segundo cuando el panel está abierto
    if (isOpen) {
      const interval = setInterval(() => {
        setHealthData(websocketHealth.getHealthData());
        if (getDiagnosticInfo) {
          setDiagnosticInfo(getDiagnosticInfo());
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, getDiagnosticInfo]);

  const toggleDebugMode = () => {
    const newState = !isDebugMode;
    setIsDebugMode(newState);
    setWebSocketDebug(newState);
  };

  const resetHealthMonitor = () => {
    websocketHealth.resetErrorState();
  };

  if (!healthData && isOpen) {
    setHealthData(websocketHealth.getHealthData());
    if (getDiagnosticInfo) {
      setDiagnosticInfo(getDiagnosticInfo());
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg w-[500px] max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Cpu className="mr-2 h-5 w-5" /> WebSocket Diagnóstico
            </h3>
            <div className="flex gap-2">
              <button
                onClick={resetHealthMonitor}
                className="p-1 hover:bg-gray-700 rounded"
                title="Reiniciar monitor"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Estado del monitor */}
            {healthData && (
              <div className="bg-gray-700 p-3 rounded">
                <h4 className="font-medium mb-2 text-gray-300">
                  Estado del monitor
                </h4>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conexiones totales:</span>
                    <span>{healthData.totalConnections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conexiones exitosas:</span>
                    <span>{healthData.successfulConnections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conexiones fallidas:</span>
                    <span
                      className={
                        healthData.failedConnections > 3 ? "text-red-400" : ""
                      }
                    >
                      {healthData.failedConnections}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Errores vacíos:</span>
                    <span
                      className={
                        healthData.emptyErrors > 0 ? "text-red-400" : ""
                      }
                    >
                      {healthData.emptyErrors}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Intentos de reconexión:
                    </span>
                    <span>{healthData.reconnectAttempts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bucle detectado:</span>
                    <span
                      className={
                        healthData.isInErrorLoop
                          ? "text-red-400 flex items-center"
                          : ""
                      }
                    >
                      {healthData.isInErrorLoop ? (
                        <>
                          <AlertTriangle className="h-3 w-3 mr-1" /> Sí
                        </>
                      ) : (
                        "No"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnóstico de la conexión actual */}
            {diagnosticInfo && (
              <div className="bg-gray-700 p-3 rounded">
                <h4 className="font-medium mb-2 text-gray-300">
                  Conexión actual
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estado:</span>
                    <span className="flex items-center">
                      {diagnosticInfo.isConnected ? (
                        <>
                          <Wifi className="h-3 w-3 mr-1 text-green-500" />{" "}
                          Conectado
                        </>
                      ) : diagnosticInfo.isReconnecting ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1 text-yellow-500 animate-spin" />{" "}
                          Reconectando
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-3 w-3 mr-1 text-red-500" />{" "}
                          Desconectado
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      WebSockets habilitados:
                    </span>
                    <span>
                      {diagnosticInfo.isWebSocketEnabled ? "Sí" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID Usuario:</span>
                    <span>{diagnosticInfo.userId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estado WebSocket:</span>
                    <span>
                      {{
                        0: "CONNECTING",
                        1: "OPEN",
                        2: "CLOSING",
                        3: "CLOSED",
                        "no-socket": "NO SOCKET",
                      }[diagnosticInfo.connectionState] ||
                        diagnosticInfo.connectionState}
                    </span>
                  </div>
                  {diagnosticInfo.connectionError && (
                    <div className="col-span-2 flex justify-between">
                      <span className="text-gray-400">Error:</span>
                      <span className="text-red-400">
                        {diagnosticInfo.connectionError}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Configuración */}
            <div className="bg-gray-700 p-3 rounded">
              <h4 className="font-medium mb-2 text-gray-300">Configuración</h4>

              <div className="flex flex-col space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">URL Base:</span>
                  <span>{WebSocketConfig.baseUrl}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Auto reconexión:</span>
                  <span>
                    {WebSocketConfig.autoReconnect ? "Activado" : "Desactivado"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Intentos máximos:</span>
                  <span>{WebSocketConfig.maxReconnectAttempts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    Desactivar si hay bucle:
                  </span>
                  <span>
                    {WebSocketConfig.autoDisableOnLoop
                      ? "Activado"
                      : "Desactivado"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Modo debug:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isDebugMode}
                      onChange={toggleDebugMode}
                    />
                    <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700"
          title="WebSocket Diagnóstico"
        >
          <Cpu className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
