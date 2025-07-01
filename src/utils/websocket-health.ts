"use client";

/**
 * Utilidad para monitorizar la salud de las conexiones WebSocket y detectar problemas
 */

import { WebSocketConfig } from "./websocket-config";

interface WebSocketHealthData {
  totalConnections: number;
  successfulConnections: number;
  failedConnections: number;
  emptyErrors: number;
  reconnectAttempts: number;
  lastConnectionTime: number | null;
  lastErrorTime: number | null;
  lastError: any;
  isInErrorLoop: boolean;
}

class WebSocketHealthMonitor {
  private static instance: WebSocketHealthMonitor;
  private health: WebSocketHealthData;
  private errorCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.health = {
      totalConnections: 0,
      successfulConnections: 0,
      failedConnections: 0,
      emptyErrors: 0,
      reconnectAttempts: 0,
      lastConnectionTime: null,
      lastErrorTime: null,
      lastError: null,
      isInErrorLoop: false,
    };

    // Iniciar verificación periódica (cada 10 segundos)
    this.startErrorCheckInterval();
  }

  public static getInstance(): WebSocketHealthMonitor {
    if (!WebSocketHealthMonitor.instance) {
      WebSocketHealthMonitor.instance = new WebSocketHealthMonitor();
    }
    return WebSocketHealthMonitor.instance;
  }

  // Se llama cuando se intenta una nueva conexión
  public recordConnectionAttempt(): void {
    this.health.totalConnections++;
    this.health.lastConnectionTime = Date.now();
  }

  // Se llama cuando una conexión se establece correctamente
  public recordSuccessfulConnection(): void {
    this.health.successfulConnections++;
    this.health.reconnectAttempts = 0; // Resetear contador de reintentos
  }

  // Se llama cuando ocurre un error
  public recordError(error: any): void {
    this.health.failedConnections++;
    this.health.lastErrorTime = Date.now();
    this.health.lastError = error;

    // Detectar errores vacíos ({})
    if (
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
      ).length === 0
    ) {
      this.health.emptyErrors++;
    }

    // Verificar si estamos en un bucle
    this.checkForErrorLoop();
  }

  // Se llama cuando se intenta una reconexión
  public recordReconnectAttempt(): void {
    this.health.reconnectAttempts++;

    // Si hay demasiados intentos seguidos, podríamos estar en un bucle
    if (this.health.reconnectAttempts >= 5) {
      this.health.isInErrorLoop = true;
    }
  }

  // Se llama cuando se detecta un error vacío {}
  public recordEmptyError(): void {
    this.health.emptyErrors++;

    // Si hay varios errores vacíos consecutivos, consideramos que estamos en un bucle
    if (this.health.emptyErrors >= 3) {
      this.health.isInErrorLoop = true;
    }
  }

  // Resetear el estado de error (después de una reconexión exitosa)
  public resetErrorState(): void {
    this.health.reconnectAttempts = 0;
    this.health.isInErrorLoop = false;
    // No reseteamos el contador de errores vacíos para mantener registro
  }

  // Verificar si estamos en un bucle
  private checkForErrorLoop(): void {
    const now = Date.now();
    if (!this.health.lastErrorTime) return;

    // Si hay más de 3 errores en menos de 10 segundos, probablemente estamos en un bucle
    if (
      this.health.failedConnections >= 3 &&
      now - this.health.lastErrorTime < 10000
    ) {
      this.health.isInErrorLoop = true;

      // Desactivar WebSockets automáticamente si el usuario ha habilitado esta característica
      if (WebSocketConfig.autoDisableOnLoop) {
        this.disableWebSockets();
      }
    }
  }

  // Desactivar WebSockets cuando se detecta un bucle
  private disableWebSockets(): void {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("websocket_enabled", "false");
    }
  }

  // Iniciar intervalo de verificación para reiniciar el estado de error si ha pasado suficiente tiempo
  private startErrorCheckInterval(): void {
    this.errorCheckInterval = setInterval(() => {
      // Si han pasado más de 30 segundos sin un error, resetear el estado de bucle
      if (
        this.health.isInErrorLoop &&
        this.health.lastErrorTime &&
        Date.now() - this.health.lastErrorTime > 30000
      ) {
        this.resetErrorState();
      }
    }, 10000); // Verificar cada 10 segundos
  }

  // Obtener datos de salud para diagnóstico
  public getHealthData(): WebSocketHealthData {
    return { ...this.health };
  }

  // Detener el monitor
  public stopMonitor(): void {
    if (this.errorCheckInterval) {
      clearInterval(this.errorCheckInterval);
      this.errorCheckInterval = null;
    }
  }
}

export const websocketHealth = WebSocketHealthMonitor.getInstance();
export default WebSocketHealthMonitor;
