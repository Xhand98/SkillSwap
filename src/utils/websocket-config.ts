/**
 * Configuración global para el sistema de WebSockets
 */
export const WebSocketConfig = {
  // Desactivar WebSockets completamente (útil para depuración o si hay problemas)
  enabled: true,

  // URL para la conexión WebSocket
  baseUrl: "ws://localhost:8000",

  // Configuración de reconexión
  autoReconnect: true,
  reconnectDelay: 3000, // ms
  maxReconnectAttempts: 5,

  // Usar almacenamiento local para recordar si los WebSockets están habilitados
  useLocalStorage: true,

  // Tiempo de espera para verificar la conexión (ms)
  connectionTimeout: 5000,

  // Modo de depuración para desarrollo
  debug: false,

  // Opciones avanzadas
  keepAliveInterval: 30000, // Enviar ping cada 30 segundos para mantener la conexión activa
  maxConnectionsPerMinute: 10, // Máximo de conexiones permitidas por minuto (para evitar bucles)
  autoDisableOnLoop: true, // Desactivar automáticamente WebSockets si se detecta un bucle

  // Opciones de limpieza y recuperación
  cleanupInterval: 300000, // Limpiar recursos cada 5 minutos
  forceReconnectAfter: 1800000, // Forzar reconexión cada 30 minutos
};

/**
 * Activar o desactivar el modo de depuración para WebSockets
 */
export function setWebSocketDebug(enabled: boolean): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("websocket_debug", enabled.toString());
    console.log(
      `Modo de depuración WebSocket ${enabled ? "activado" : "desactivado"}`
    );
  }
}

/**
 * Verificar si el modo de depuración está activado
 */
export function isWebSocketDebugEnabled(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem("websocket_debug") === "true";
  }
  return WebSocketConfig.debug;
}

/**
 * Verificar si los WebSockets están habilitados, comprobando la configuración
 * y el almacenamiento local si corresponde
 */
export function areWebSocketsEnabled(): boolean {
  if (!WebSocketConfig.enabled) {
    return false;
  }

  if (WebSocketConfig.useLocalStorage && typeof window !== "undefined") {
    const storedValue = localStorage.getItem("websocket_enabled");
    if (storedValue === "false") {
      return false;
    }
  }

  return true;
}

/**
 * Establecer el estado de activación de WebSockets
 */
export function setWebSocketsEnabled(enabled: boolean): void {
  if (WebSocketConfig.useLocalStorage && typeof window !== "undefined") {
    localStorage.setItem("websocket_enabled", enabled.toString());
  }
}

/**
 * Obtener la URL completa para la conexión WebSocket
 */
export function getWebSocketUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = `${WebSocketConfig.baseUrl}${path}`;

  if (params) {
    const queryParams = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join("&");

    url += (url.includes("?") ? "&" : "?") + queryParams;
  }

  return url;
}
