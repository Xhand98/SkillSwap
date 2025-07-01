"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  WebSocketConfig,
  areWebSocketsEnabled,
  setWebSocketsEnabled,
  getWebSocketUrl,
} from "@/utils/websocket-config";
import { websocketHealth } from "@/utils/websocket-health";

/**
 * useWebSocketV2 - Hook mejorado para manejar conexiones WebSocket con mejor gestión de errores
 * y prevención de bucles de reconexión
 */

export interface WebSocketMessage {
  type: string;
  data: any;
  user_id?: number;
  room_id?: string;
  time: string;
}

interface UseWebSocketOptions {
  userId: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  disableIfFailing?: boolean;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  isReconnecting: boolean;
  sendMessage: (message: Omit<WebSocketMessage, "time" | "user_id">) => void;
  joinConversation: (conversationId: number) => void;
  leaveConversation: (conversationId: number) => void;
  startTyping: (conversationId: number) => void;
  stopTyping: (conversationId: number) => void;
  disconnect: () => void;
  reconnect: () => void;
  connectionError: string | null;
  isWebSocketEnabled: boolean;
  toggleWebSocket: (enabled?: boolean) => void;
  getDiagnosticInfo: () => any;
}

// Función de ayuda para identificar el componente que llama al hook
const getComponentName = () => {
  try {
    const err = new Error();
    const stack = err.stack || "";
    const callerLine = stack.split("\n")[3] || "";
    const match = callerLine.match(/at\s+(.*)\s+\(/);
    return match ? match[1] : "Unknown Component";
  } catch (e) {
    return "Unknown Component";
  }
};

export const useWebSocketV2 = ({
  userId,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  autoReconnect = WebSocketConfig.autoReconnect,
  reconnectDelay = WebSocketConfig.reconnectDelay,
  maxReconnectAttempts = WebSocketConfig.maxReconnectAttempts,
}: UseWebSocketOptions): UseWebSocketReturn => {
  const componentName = useRef(getComponentName());
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnect = useRef(true);
  const [isWebSocketEnabled, setIsWebSocketEnabled] = useState<boolean>(areWebSocketsEnabled());

  // Variables para detección de bucles y errores
  const connectingRef = useRef(false);
  const connectionsInLastMinute = useRef(0);
  const lastConnectionTimes = useRef<number[]>([]);
  const lastErrorRef = useRef<{time: number, error: any} | null>(null);
  const errorCountRef = useRef(0);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para logging
  const debugLog = useCallback(
    (message: string, data?: any) => {
      const isDebugMode =
        typeof window !== "undefined" &&
        localStorage.getItem("websocket_debug") === "true";
      if (isDebugMode || WebSocketConfig.debug) {
        console.log(
          `[WebSocketV2][${componentName.current}:${userId}] ${message}`,
          data || ""
        );
      }
    },
    [userId]
  );

  // Detectar bucles de conexión
  const detectConnectionLoop = useCallback(() => {
    const now = Date.now();
    lastConnectionTimes.current.push(now);
    
    // Solo mantener tiempos de conexión de los últimos 60 segundos
    lastConnectionTimes.current = lastConnectionTimes.current.filter(
      (time) => now - time < 60000
    );
    
    connectionsInLastMinute.current = lastConnectionTimes.current.length;
    
    if (connectionsInLastMinute.current > WebSocketConfig.maxConnectionsPerMinute) {
      debugLog(
        `¡ALERTA! Bucle de conexión detectado: ${connectionsInLastMinute.current} intentos/min`
      );
      console.warn(
        `[WebSocketV2][${componentName.current}] Bucle de conexión detectado ` +
        `(${connectionsInLastMinute.current} intentos en el último minuto). ` +
        "Los WebSockets serán desactivados temporalmente."
      );
      return true;
    }
    return false;
  }, [debugLog, componentName]);

  // Establecer conexión WebSocket
  const connect = useCallback(() => {
    // No intentar conectar si los WebSockets están desactivados
    if (!isWebSocketEnabled) {
      debugLog("WebSockets desactivados, no se intentará conectar");
      return;
    }

    // Detección de bucles
    if (detectConnectionLoop()) {
      setWebSocketsEnabled(false);
      setIsWebSocketEnabled(false);
      setConnectionError(
        "Bucle de conexión detectado - WebSockets desactivados temporalmente"
      );
      return;
    }

    // Verificar estado actual de la conexión
    if (ws.current?.readyState === WebSocket.OPEN) {
      debugLog("WebSocket ya está conectado");
      return;
    }

    if (ws.current?.readyState === WebSocket.CONNECTING) {
      debugLog("WebSocket ya está en proceso de conexión");
      return;
    }

    try {
      // Cerrar conexión anterior si existe
      if (ws.current) {
        debugLog("Cerrando conexión WebSocket existente");
        try {
          ws.current.close();
        } catch (err) {
          debugLog("Error al cerrar WebSocket previo:", err);
        }
      }

      // Limpiar timeout previo
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }

      // Crear nueva conexión
      debugLog(`Iniciando conexión WebSocket para usuario ${userId}`);
      const wsUrl = getWebSocketUrl("/ws", { user_id: userId });
      ws.current = new WebSocket(wsUrl);

      // Configurar timeout para la conexión
      connectionTimeoutRef.current = setTimeout(() => {
        if (ws.current && ws.current.readyState !== WebSocket.OPEN) {
          debugLog("Timeout de conexión alcanzado");
          setConnectionError("Timeout de conexión - El servidor no respondió a tiempo");
          
          try {
            ws.current.close();
            ws.current = null;
          } catch (err) {
            debugLog("Error al cerrar WebSocket después de timeout:", err);
          }
          
          // Incrementar contador de errores
          errorCountRef.current++;
          
          // Desactivar WebSockets tras varios errores
          if (errorCountRef.current >= 3) {
            debugLog("Demasiados errores consecutivos, desactivando WebSockets");
            setIsWebSocketEnabled(false);
            setWebSocketsEnabled(false);
          }
        }
      }, WebSocketConfig.connectionTimeout);

      // Registrar intento de conexión
      websocketHealth.recordConnectionAttempt();

      // Configurar handlers de eventos
      ws.current.onopen = () => {
        // Limpiar timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        
        debugLog("WebSocket conectado exitosamente");
        setIsConnected(true);
        setIsReconnecting(false);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        errorCountRef.current = 0;

        // Registrar conexión exitosa
        websocketHealth.recordSuccessfulConnection();

        // Configurar ping periódico para mantener la conexión activa
        if (WebSocketConfig.keepAliveInterval > 0) {
          const keepAliveIntervalId = setInterval(() => {
            if (ws.current?.readyState === WebSocket.OPEN) {
              try {
                ws.current.send(
                  JSON.stringify({
                    type: "ping",
                    time: new Date().toISOString(),
                  })
                );
                debugLog("Enviado ping de keepalive");
              } catch (err) {
                debugLog("Error enviando ping de keepalive", err);
                clearInterval(keepAliveIntervalId);
              }
            } else {
              clearInterval(keepAliveIntervalId);
            }
          }, WebSocketConfig.keepAliveInterval);
        }

        onConnect?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          debugLog("Mensaje WebSocket recibido:", message);
          
          // Si recibimos un mensaje, la conexión está activa
          errorCountRef.current = 0;
          
          // No propagar mensajes de sistema
          if (message.type === "pong" || message.type === "system") {
            debugLog(`Mensaje de sistema "${message.type}" recibido`);
            return;
          }
          
          onMessage?.(message);
        } catch (error) {
          debugLog("Error al parsear mensaje WebSocket:", error);
          console.error("Error al parsear mensaje WebSocket:", error);
        }
      };

      ws.current.onclose = (event) => {
        // Limpiar timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        
        console.log(
          `[WebSocketV2][${componentName.current}] Conexión cerrada: Código ${event.code}${
            event.reason ? ", Razón: " + event.reason : ""
          }`
        );
        
        setIsConnected(false);
        
        // Establecer mensaje de error según código
        let errorMessage = "Conexión cerrada";
        if (event.code === 1000) {
          errorMessage = "Cierre normal";
        } else if (event.code === 1001) {
          errorMessage = "Endpoint se está desconectando";
        } else if (event.code === 1006) {
          errorMessage = "Conexión cerrada anormalmente";
          errorCountRef.current++;
        } else if (event.code === 1011) {
          errorMessage = "Error interno en el servidor";
        }
        
        if (event.code !== 1000) {
          setConnectionError(errorMessage);
        }
        
        onDisconnect?.();

        // Reconexión automática
        if (
          shouldReconnect.current &&
          autoReconnect &&
          isWebSocketEnabled &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          setIsReconnecting(true);
          reconnectAttempts.current++;
          websocketHealth.recordReconnectAttempt();

          // Verificar si estamos en bucle
          const healthData = websocketHealth.getHealthData();
          if (healthData.isInErrorLoop && WebSocketConfig.autoDisableOnLoop) {
            debugLog("Bucle de reconexión detectado, desactivando WebSockets");
            setIsWebSocketEnabled(false);
            setWebSocketsEnabled(false);
            setConnectionError(
              "Bucle de reconexión detectado - WebSockets desactivados temporalmente"
            );
            return;
          }

          // Backoff exponencial con máximo
          const exponentialDelay = reconnectDelay * Math.pow(1.5, reconnectAttempts.current - 1);
          const maxDelay = 30000; // 30 segundos máximo
          const cappedDelay = Math.min(exponentialDelay, maxDelay);
          const delayWithJitter = cappedDelay + Math.random() * 1000;

          console.log(
            `Esperando ${Math.round(delayWithJitter)}ms para reconectar (intento ${
              reconnectAttempts.current
            }/${maxReconnectAttempts})`
          );

          reconnectTimeout.current = setTimeout(() => {
            console.log(
              `Intentando reconectar... (${reconnectAttempts.current}/${maxReconnectAttempts})`
            );
            connect();
          }, delayWithJitter);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError("Máximo número de intentos de reconexión alcanzado");
          setIsReconnecting(false);
          console.log("Máximo de intentos alcanzado. Deteniendo reconexiones automáticas.");
          
          // Desactivar WebSockets tras muchos intentos fallidos
          if (errorCountRef.current >= 3) {
            setIsWebSocketEnabled(false);
            setWebSocketsEnabled(false);
            setConnectionError(
              "Demasiados errores consecutivos - WebSockets desactivados temporalmente"
            );
          }
        }
      };

      ws.current.onerror = (error) => {
        // Limpiar timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        
        console.error(`[WebSocketV2][${componentName.current}] Error WebSocket:`, error);
        
        // Registrar error
        lastErrorRef.current = { time: Date.now(), error };
        errorCountRef.current++;
        websocketHealth.recordError(error);

        // Verificar si es un error vacío
        const isEmptyError = !error.type || Object.keys(error).length === 0;
        
        if (isEmptyError) {
          debugLog("Error vacío ({}) detectado, posible problema de red o CORS");
          setConnectionError("Error de red o conexión (posible problema CORS)");
          websocketHealth.recordEmptyError();

          // Desactivar WebSockets tras varios errores vacíos
          if (websocketHealth.getHealthData().emptyErrors >= 3 && WebSocketConfig.autoDisableOnLoop) {
            debugLog("Múltiples errores vacíos detectados, desactivando WebSockets");
            setIsWebSocketEnabled(false);
            setWebSocketsEnabled(false);
            setConnectionError("Múltiples errores de conexión - WebSockets desactivados");
          }
        } else {
          try {
            // Intentar extraer más detalles del error
            const errorDetails = {
              type: error.type || "unknown",
              eventPhase: error.eventPhase,
              timeStamp: error.timeStamp,
              isTrusted: error.isTrusted,
              target: error.target
                ? {
                    url: (error.target as WebSocket)?.url,
                    readyState: (error.target as WebSocket)?.readyState,
                    protocol: (error.target as WebSocket)?.protocol,
                    extensions: (error.target as WebSocket)?.extensions,
                    bufferedAmount: (error.target as WebSocket)?.bufferedAmount,
                  }
                : "No target available",
            };
            debugLog("Detalles del error:", errorDetails);
            setConnectionError(`Error: ${error.type || "desconocido"}`);
          } catch (parseError) {
            debugLog("Error analizando detalles del error WebSocket:", parseError);
            setConnectionError("Error desconocido");
          }
        }

        onError?.(error);
      };
    } catch (error) {
      console.error("Error al crear conexión WebSocket:", error);
      setConnectionError("Error al crear conexión WebSocket");
    }
  }, [
    userId,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect,
    reconnectDelay,
    maxReconnectAttempts,
    isWebSocketEnabled,
    detectConnectionLoop,
    debugLog,
  ]);

  // Desconectar WebSocket
  const disconnect = useCallback(() => {
    shouldReconnect.current = false;
    
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    
    if (ws.current) {
      try {
        ws.current.close();
      } catch (err) {
        debugLog("Error al cerrar WebSocket:", err);
      }
      ws.current = null;
    }
    
    setIsConnected(false);
    setIsReconnecting(false);
  }, [debugLog]);

  // Reconectar WebSocket
  const reconnect = useCallback(() => {
    shouldReconnect.current = true;
    reconnectAttempts.current = 0;
    setConnectionError(null);
    websocketHealth.resetErrorState();
    
    disconnect();
    setTimeout(connect, 100);
  }, [connect, disconnect]);

  // Enviar mensaje WebSocket
  const sendMessage = useCallback(
    (message: Omit<WebSocketMessage, "time" | "user_id">) => {
      if (!isWebSocketEnabled) {
        console.warn("WebSockets están desactivados. Mensaje no enviado:", message);
        return;
      }
      
      if (ws.current?.readyState === WebSocket.OPEN) {
        try {
          const fullMessage: WebSocketMessage = {
            ...message,
            user_id: userId,
            time: new Date().toISOString(),
          };
          ws.current.send(JSON.stringify(fullMessage));
        } catch (error) {
          console.error("Error al enviar mensaje WebSocket:", error);
        }
      } else {
        console.warn(
          `WebSocket no conectado (estado: ${ws.current?.readyState}). Mensaje no enviado:`,
          message
        );
      }
    },
    [userId, isWebSocketEnabled]
  );

  // Unirse a una conversación
  const joinConversation = useCallback(
    (conversationId: number) => {
      sendMessage({
        type: "join_conversation",
        data: { conversation_id: conversationId.toString() },
      });
    },
    [sendMessage]
  );

  // Salir de una conversación
  const leaveConversation = useCallback(
    (conversationId: number) => {
      sendMessage({
        type: "leave_conversation",
        data: { conversation_id: conversationId.toString() },
      });
    },
    [sendMessage]
  );

  // Indicador de escritura
  const startTyping = useCallback(
    (conversationId: number) => {
      sendMessage({
        type: "typing_start",
        data: { conversation_id: conversationId.toString() },
      });
    },
    [sendMessage]
  );

  // Detener indicador de escritura
  const stopTyping = useCallback(
    (conversationId: number) => {
      sendMessage({
        type: "typing_stop",
        data: { conversation_id: conversationId.toString() },
      });
    },
    [sendMessage]
  );

  // Obtener información diagnóstica
  const getDiagnosticInfo = useCallback(() => {
    return {
      component: componentName.current,
      userId,
      connectionState: ws.current ? ws.current.readyState : "no-socket",
      reconnectAttempts: reconnectAttempts.current,
      isConnected,
      isReconnecting,
      connectionError,
      isWebSocketEnabled,
      errorCount: errorCountRef.current,
      lastError: lastErrorRef.current,
      health: websocketHealth.getHealthData(),
      websocketUrl: ws.current?.url || null,
    };
  }, [
    userId,
    isConnected,
    isReconnecting,
    connectionError,
    isWebSocketEnabled,
  ]);

  // Activar/desactivar WebSockets
  const toggleWebSocket = useCallback(
    (enabled?: boolean) => {
      const newState = enabled !== undefined ? enabled : !isWebSocketEnabled;
      setIsWebSocketEnabled(newState);
      setWebSocketsEnabled(newState);

      if (newState) {
        reconnect();
      } else {
        disconnect();
      }
    },
    [isWebSocketEnabled, reconnect, disconnect]
  );

  // Efecto para conectar cuando componente se monta
  useEffect(() => {
    if (!isWebSocketEnabled || !userId || connectingRef.current) {
      return;
    }

    connectingRef.current = true;
    
    debugLog("Iniciando conexión WebSocket al montar componente");
    connect();
    
    // Liberar flag después de un delay para evitar múltiples intentos
    setTimeout(() => {
      connectingRef.current = false;
    }, 1000);

    return () => {
      debugLog("Desmontando componente, cerrando WebSocket");
      disconnect();
    };
  }, [userId, connect, disconnect, isWebSocketEnabled, debugLog]);

  // Efecto para manejar cambios en activación
  useEffect(() => {
    if (isWebSocketEnabled && !connectingRef.current && userId) {
      debugLog("WebSockets activados, estableciendo conexión");
      connectingRef.current = true;
      reconnect();
      setTimeout(() => {
        connectingRef.current = false;
      }, 1000);
    } else if (!isWebSocketEnabled) {
      debugLog("WebSockets desactivados, cerrando conexiones");
      disconnect();
    }
  }, [isWebSocketEnabled, userId, disconnect, reconnect, debugLog]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    isReconnecting,
    sendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    disconnect,
    reconnect,
    connectionError,
    isWebSocketEnabled,
    toggleWebSocket,
    getDiagnosticInfo,
  };
};

export default useWebSocketV2;
