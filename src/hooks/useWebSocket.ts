"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  WebSocketConfig,
  areWebSocketsEnabled,
  setWebSocketsEnabled,
  getWebSocketUrl,
  setWebSocketDebug,
} from "@/utils/websocket-config";
import { websocketHealth } from "@/utils/websocket-health";

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
  disableIfFailing?: boolean; // Desactivar WebSockets si hay demasiados fallos
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
  getDiagnosticInfo: () => any; // Añadir función de diagnóstico
}

// Función de ayuda para debug que nos permite identificar desde qué componente se está llamando al hook
const getComponentName = () => {
  try {
    const err = new Error();
    const stack = err.stack || "";
    // Analizamos el stack trace para extraer el nombre del componente
    const callerLine = stack.split("\n")[3] || "";
    const match = callerLine.match(/at\s+(.*)\s+\(/);
    return match ? match[1] : "Unknown Component";
  } catch (e) {
    return "Unknown Component";
  }
};

export const useWebSocket = ({
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
  const [isWebSocketEnabled, setIsWebSocketEnabled] =
    useState<boolean>(areWebSocketsEnabled);

  // Variables para detección de bucles
  const connectionsInLastMinute = useRef(0);
  const lastConnectionTimes = useRef<number[]>([]);

  // Añadir referencia para timeout de conexión
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Añadir estado para seguimiento de errores
  const lastErrorRef = useRef<{ time: number; error: any } | null>(null);
  const errorCountRef = useRef(0);

  // Añadir función de depuración
  const debugLog = useCallback(
    (message: string, data?: any) => {
      const isDebugMode =
        typeof window !== "undefined" &&
        localStorage.getItem("websocket_debug") === "true";
      if (isDebugMode) {
        console.log(
          `[WebSocket][${componentName.current}:${userId}] ${message}`,
          data || ""
        );
      }
    },
    [userId]
  );

  // Función para detectar patrones de conexión repetitivos (bucles)
  const detectConnectionLoop = useCallback(() => {
    const now = Date.now();
    lastConnectionTimes.current.push(now);

    // Solo mantener tiempos de conexión de los últimos 60 segundos
    lastConnectionTimes.current = lastConnectionTimes.current.filter(
      (time) => now - time < 60000
    );

    connectionsInLastMinute.current = lastConnectionTimes.current.length;

    // Si hay más de 10 conexiones en el último minuto, probablemente estamos en un bucle
    if (connectionsInLastMinute.current > 10) {
      debugLog(
        "¡ALERTA! Posible bucle de conexión detectado. Desactivando WebSockets temporalmente."
      );
      console.warn(
        `[WebSocket][${componentName.current}] Se detectó un posible bucle de conexión ` +
          `(${connectionsInLastMinute.current} intentos en el último minuto). ` +
          "Los WebSockets serán desactivados temporalmente para prevenir saturación."
      );
      return true;
    }
    return false;
  }, [debugLog]);

  const connect = useCallback(() => {
    // No intentar conectar si los WebSockets están desactivados
    if (!isWebSocketEnabled) {
      debugLog("WebSockets están desactivados, no se intentará conectar");
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

    // Si ya tenemos una conexión abierta, no hacemos nada
    if (ws.current?.readyState === WebSocket.OPEN) {
      debugLog("WebSocket ya está conectado");
      return;
    }

    // Si existe una conexión en proceso de conexión, no iniciamos otra
    if (ws.current?.readyState === WebSocket.CONNECTING) {
      debugLog("WebSocket ya está en proceso de conexión");
      return;
    }

    try {
      // Si tenemos una conexión existente en cualquier otro estado, la cerramos primero
      if (ws.current) {
        debugLog(
          "Cerrando conexión WebSocket existente antes de crear una nueva"
        );
        try {
          ws.current.close();
        } catch (err) {
          debugLog("Error al cerrar WebSocket previo:", err);
        }
      }

      // Limpiar timeout de conexión anterior si existe
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }

      debugLog(`Iniciando conexión WebSocket para usuario ${userId}`);
      const wsUrl = getWebSocketUrl("/ws", { user_id: userId });
      ws.current = new WebSocket(wsUrl);

      // Establecer un timeout para la conexión
      connectionTimeoutRef.current = setTimeout(() => {
        if (ws.current && ws.current.readyState !== WebSocket.OPEN) {
          debugLog("Timeout de conexión alcanzado");
          setConnectionError(
            "Timeout de conexión - El servidor no respondió a tiempo"
          );

          try {
            ws.current.close();
          } catch (err) {
            debugLog("Error al cerrar WebSocket después de timeout:", err);
          }

          // Resetear para próximo intento
          ws.current = null;

          // Incrementar contador de errores
          errorCountRef.current++;

          // Si hay demasiados errores consecutivos, desactivar WebSockets temporalmente
          if (errorCountRef.current >= 3) {
            debugLog(
              "Demasiados errores consecutivos, desactivando WebSockets temporalmente"
            );
            setIsWebSocketEnabled(false);
            setWebSocketsEnabled(false);
          }
        }
      }, WebSocketConfig.connectionTimeout);

      // Registrar intento de conexión en el monitor de salud
      websocketHealth.recordConnectionAttempt();

      ws.current.onopen = () => {
        // Limpiar timeout de conexión
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }

        debugLog("WebSocket conectado exitosamente");
        setIsConnected(true);
        setIsReconnecting(false);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        errorCountRef.current = 0; // Resetear contador de errores

        // Registrar conexión exitosa en el monitor de salud
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
          debugLog("WebSocket message received:", message);

          // Si recibimos un mensaje, la conexión está activa
          errorCountRef.current = 0;

          // Procesar mensajes especiales
          if (message.type === "pong") {
            debugLog("Recibido pong del servidor");
            return; // No propagar pongs a los componentes
          }

          onMessage?.(message);
        } catch (error) {
          debugLog("Error parsing WebSocket message:", error);
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.current.onclose = (event) => {
        // Limpiar timeout de conexión si existe
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }

        console.log(
          `[${componentName.current}] WebSocket closed: Code ${event.code}${
            event.reason ? ", Reason: " + event.reason : ""
          }`
        );
        setIsConnected(false);

        // Establecer mensaje de error adecuado basado en el código
        let errorMessage = "Conexión cerrada";
        if (event.code === 1000) {
          errorMessage = "Cierre normal";
        } else if (event.code === 1001) {
          errorMessage = "Endpoint se está desconectando";
        } else if (event.code === 1006) {
          errorMessage = "Conexión cerrada anormalmente";
          // Incrementar contador de errores en cierre anormal
          errorCountRef.current++;
        } else if (event.code === 1011) {
          errorMessage = "Error interno en el servidor";
        }

        if (event.code !== 1000) {
          setConnectionError(errorMessage);
        }

        onDisconnect?.();

        // Reconectar automáticamente si es necesario
        if (
          shouldReconnect.current &&
          autoReconnect &&
          isWebSocketEnabled &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          setIsReconnecting(true);
          reconnectAttempts.current++;
          // Registrar intento de reconexión en el monitor de salud
          websocketHealth.recordReconnectAttempt();

          // Verificar si estamos en un bucle antes de intentar reconectar
          const healthData = websocketHealth.getHealthData();
          if (healthData.isInErrorLoop && WebSocketConfig.autoDisableOnLoop) {
            debugLog(
              "Detectado bucle de reconexión, desactivando WebSockets temporalmente"
            );
            setIsWebSocketEnabled(false);
            setWebSocketsEnabled(false);
            setConnectionError(
              "Bucle de reconexión detectado - WebSockets desactivados temporalmente"
            );
            return;
          }

          // Implementar backoff exponencial para evitar sobrecarga
          const exponentialDelay =
            reconnectDelay * Math.pow(1.5, reconnectAttempts.current - 1);
          const maxDelay = 30000; // Máximo delay de 30 segundos
          const cappedDelay = Math.min(exponentialDelay, maxDelay);
          const delayWithJitter = cappedDelay + Math.random() * 1000; // Añadir algo de jitter

          console.log(
            `Esperando ${Math.round(
              delayWithJitter
            )}ms para reconectar (intento ${
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
          setConnectionError(
            "Máximo número de intentos de reconexión alcanzado"
          );
          setIsReconnecting(false);
          console.log(
            "Se ha alcanzado el máximo número de intentos de reconexión. Deteniendo reconexiones automáticas."
          );

          // Desactivar WebSockets temporalmente después de muchos intentos fallidos
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
        // Limpiar timeout de conexión si existe
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }

        console.error(`[${componentName.current}] WebSocket error:`, error);

        // Guardar el último error y aumentar contador
        lastErrorRef.current = { time: Date.now(), error };
        errorCountRef.current++;

        // Registrar error en el monitor de salud
        websocketHealth.recordError(error);

        // Analizar si el error es vacío
        const isEmptyError = !error.type || Object.keys(error).length === 0;
        if (isEmptyError) {
          debugLog(
            "Se detectó un error vacío ({}), esto podría indicar un problema de red"
          );
          setConnectionError("Error de red o conexión");
          websocketHealth.recordEmptyError();
        }

        try {
          // Intentar obtener más detalles del error
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

          // Identificar si es un error vacío ({})
          const isEmptyError =
            !error.type &&
            Object.keys(error).filter(
              (key) =>
                ![
                  "isTrusted",
                  "timeStamp",
                  "defaultPrevented",
                  "cancelBubble",
                  "cancelable",
                  "returnValue",
                ].includes(key)
            ).length === 0;

          if (isEmptyError) {
            console.warn(
              "Se recibió un objeto de error vacío, esto podría ser un error de CORS o conexión cerrada inesperadamente"
            );
            setConnectionError(
              "Error de conexión (posible problema CORS o red)"
            );

            // Si es un error vacío y estamos en un bucle, desactivar WebSockets temporalmente
            if (
              websocketHealth.getHealthData().emptyErrors >= 3 &&
              WebSocketConfig.autoDisableOnLoop
            ) {
              debugLog(
                "Múltiples errores vacíos detectados, desactivando WebSockets temporalmente"
              );
              setIsWebSocketEnabled(false);
              setWebSocketsEnabled(false);
            }
          } else {
            console.error("WebSocket error details:", errorDetails);
            setConnectionError("Error de conexión");
          }
        } catch (parseError) {
          console.error(
            "Error analizando detalles del error WebSocket:",
            parseError
          );
          setConnectionError("Error desconocido");
        }

        onError?.(error);
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      setConnectionError("Failed to create connection");
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
  ]);

  const disconnect = useCallback(() => {
    shouldReconnect.current = false;
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setIsConnected(false);
    setIsReconnecting(false);
  }, []);
  const reconnect = useCallback(() => {
    shouldReconnect.current = true;
    reconnectAttempts.current = 0;
    setConnectionError(null);

    // Restablecer estado de error en el monitor de salud
    websocketHealth.resetErrorState();

    disconnect();
    setTimeout(connect, 100);
  }, [connect, disconnect]);

  // Función para obtener datos de diagnóstico para depuración
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
      health: websocketHealth.getHealthData(),
    };
  }, [
    userId,
    isConnected,
    isReconnecting,
    connectionError,
    isWebSocketEnabled,
  ]);

  const sendMessage = useCallback(
    (message: Omit<WebSocketMessage, "time" | "user_id">) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        const fullMessage: WebSocketMessage = {
          ...message,
          user_id: userId,
          time: new Date().toISOString(),
        };
        ws.current.send(JSON.stringify(fullMessage));
      } else {
        console.warn("WebSocket is not connected. Message not sent:", message);
      }
    },
    [userId]
  );

  const joinConversation = useCallback(
    (conversationId: number) => {
      sendMessage({
        type: "join_conversation",
        data: { conversation_id: conversationId.toString() },
      });
    },
    [sendMessage]
  );

  const leaveConversation = useCallback(
    (conversationId: number) => {
      sendMessage({
        type: "leave_conversation",
        data: { conversation_id: conversationId.toString() },
      });
    },
    [sendMessage]
  );

  const startTyping = useCallback(
    (conversationId: number) => {
      sendMessage({
        type: "typing_start",
        data: { conversation_id: conversationId.toString() },
      });
    },
    [sendMessage]
  );

  const stopTyping = useCallback(
    (conversationId: number) => {
      sendMessage({
        type: "typing_stop",
        data: { conversation_id: conversationId.toString() },
      });
    },
    [sendMessage]
  ); // Variable para prevenir conexiones múltiples simultáneas
  const connectingRef = useRef(false);
  // Conectar cuando el componente se monta
  useEffect(() => {
    // Verificar si los WebSockets están habilitados
    if (!isWebSocketEnabled) {
      console.log("WebSockets están desactivados, no se intentará la conexión");
      return;
    }

    // Prevenir múltiples intentos simultáneos de conexión o cuando no hay userId
    if (!userId || connectingRef.current) {
      return;
    }

    let connectionTimeoutId: NodeJS.Timeout | null = null;
    const handleConnect = async () => {
      // Marcar que estamos en proceso de conexión
      connectingRef.current = true;

      try {
        // Verificar si ya existe una instancia activa para evitar conexiones duplicadas
        if (!ws.current) {
          console.log(
            `[${componentName.current}] Iniciando nueva conexión WebSocket para usuario ${userId}`
          );
          connect();

          // Establecer un timeout para verificar si la conexión se establece correctamente
          connectionTimeoutId = setTimeout(() => {
            if (ws.current?.readyState !== WebSocket.OPEN) {
              console.warn(
                `[${componentName.current}] La conexión WebSocket no se estableció en ${WebSocketConfig.connectionTimeout}ms`
              );
              setConnectionError("Timeout de conexión");
            }
          }, WebSocketConfig.connectionTimeout);
        } else if (ws.current.readyState === WebSocket.CLOSED) {
          console.log(
            `[${componentName.current}] Reconectando WebSocket para usuario ${userId} (socket cerrado)`
          );
          connect();
        } else {
          console.log(
            `[${componentName.current}] Conexión WebSocket ya existe para usuario ${userId} (estado: ${ws.current.readyState})`
          );
        }
      } finally {
        // Desmarcar el proceso de conexión después de un delay para evitar reconexiones rápidas
        setTimeout(() => {
          connectingRef.current = false;
        }, 1000);
      }
    };

    handleConnect();

    return () => {
      console.log(
        `Desmontando componente, cerrando WebSocket para usuario ${userId}`
      );
      if (connectionTimeoutId) {
        clearTimeout(connectionTimeoutId);
      }
      disconnect();
      connectingRef.current = false;
    };
  }, [userId, connect, disconnect, isWebSocketEnabled]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, []);
  // Función para activar/desactivar WebSockets
  const toggleWebSocket = useCallback(
    (enabled?: boolean) => {
      const newState = enabled !== undefined ? enabled : !isWebSocketEnabled;
      setIsWebSocketEnabled(newState);
      setWebSocketsEnabled(newState);

      if (newState) {
        reconnect(); // Reconectar si se activan
      } else {
        disconnect(); // Desconectar si se desactivan
      }
    },
    [isWebSocketEnabled, reconnect, disconnect]
  );
  // Efecto para manejar cambios en el estado de activación de WebSockets
  useEffect(() => {
    if (isWebSocketEnabled) {
      console.log("WebSockets activados, intentando establecer conexión");
      reconnect();
    } else {
      console.log("WebSockets desactivados, cerrando conexiones existentes");
      disconnect();
    }
  }, [isWebSocketEnabled, disconnect, reconnect]);
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
    getDiagnosticInfo, // Añadir función de diagnóstico
  };
};

export default useWebSocket;
