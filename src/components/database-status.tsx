"use client";

import { useState, useEffect } from "react";
import { API_CONFIG } from "@/lib/api-config";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Wifi, WifiOff, Loader2 } from "lucide-react";

interface DatabaseStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function DatabaseStatus({
  showDetails = false,
  className = "",
}: DatabaseStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    const startTime = Date.now();
    try {
      const response = await fetch(`${API_CONFIG.API_URL}/health`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const endTime = Date.now();
      const responseTimeMs = endTime - startTime;

      if (response.ok) {
        const data = await response.json();
        setIsConnected(true);
        setResponseTime(responseTimeMs);
        setError(null);
        setLastChecked(new Date());
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setResponseTime(null);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Check immediately
    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (isConnected === null) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    return isConnected ? (
      <Wifi className="h-4 w-4" />
    ) : (
      <WifiOff className="h-4 w-4" />
    );
  };

  const getStatusColor = () => {
    if (isConnected === null) return "bg-yellow-100 text-yellow-800";
    return isConnected
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getStatusText = () => {
    if (isConnected === null) return "Verificando...";
    return isConnected ? "Base de datos conectada" : "Sin conexión";
  };

  if (!showDetails) {
    return (
      <Badge variant="secondary" className={`${getStatusColor()} ${className}`}>
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </Badge>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Estado de la Base de Datos</span>
          </div>
          <Badge variant="secondary" className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </Badge>
        </div>

        {showDetails && (
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            {lastChecked && (
              <div>Última verificación: {lastChecked.toLocaleTimeString()}</div>
            )}
            {responseTime && <div>Tiempo de respuesta: {responseTime}ms</div>}
            {error && <div className="text-red-600">Error: {error}</div>}
            <div>Endpoint: {API_CONFIG.API_URL}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
