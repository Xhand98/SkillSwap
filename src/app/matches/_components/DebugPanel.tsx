"use client";

import { useState } from "react";
import { API_CONFIG } from "@/lib/api-config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Text } from "@/components/text";
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";

// Componente para mostrar información de depuración
export default function DebugPanel({ userId }: { userId: string }) {
  const [isChecking, setIsChecking] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const checkApiConnection = async () => {
    setIsChecking(true);
    setApiStatus("checking");
    setApiResponse(null);
    setApiError(null);

    try {
      // Intentamos conectar con la API usando fetch
      const response = await fetch(
        `${API_CONFIG.API_URL}/users/${userId}/matches/`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
          mode: "cors",
          signal: AbortSignal.timeout(3000), // 3 segundos de timeout
        }
      );

      // Si la respuesta no es ok, lanzamos un error
      if (!response.ok) {
        throw new Error(
          `Error de servidor: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setApiStatus("online");
      setApiResponse(data);
    } catch (err) {
      console.error("Error checking API:", err);
      setApiStatus("offline");
      setApiError(err instanceof Error ? err.message : String(err));

      // En caso de error, mostramos mensaje de error
      setApiResponse({
        message: "Error de conexión a la API",
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsChecking(false);
    }
  };

  const checkNetworkConnectivity = () => {
    return navigator.onLine;
  };

  return (
    <Card className="bg-gray-900 border-gray-800 mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-300">
          {apiStatus === "checking" && (
            <RefreshCw className="h-5 w-5 animate-spin text-amber-500" />
          )}
          {apiStatus === "online" && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {apiStatus === "offline" && (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          Estado API:{" "}
          {apiStatus === "checking"
            ? "Verificando..."
            : apiStatus === "online"
            ? "En línea"
            : "Fuera de línea"}
          <span className="ml-auto flex items-center">
            {checkNetworkConnectivity() ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span className="ml-1 text-sm">
              {checkNetworkConnectivity() ? "Conectado" : "Sin conexión"}
            </span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Text size="paragraph-sm" className="text-gray-400">
            {apiStatus === "online"
              ? "La API está funcionando correctamente."
              : apiStatus === "offline"
              ? "La API no está disponible. Se recomienda revisar el servidor."
              : "Comprobando conexión con la API..."}
          </Text>

          {apiError && (
            <div className="mt-4 p-3 bg-red-900/30 rounded-md border border-red-800">
              <Text size="paragraph-sm" className="text-red-400 font-medium">
                Error:
              </Text>
              <pre className="mt-1 text-xs text-red-300 whitespace-pre-wrap">
                {apiError}
              </pre>
            </div>
          )}

          {apiResponse && (
            <div className="mt-4">
              <Text size="paragraph-sm" className="text-gray-400">
                Respuesta recibida:
              </Text>
              <pre className="mt-2 p-3 bg-gray-800 rounded-md text-xs text-gray-300 max-h-40 overflow-auto">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-800/50 rounded-md">
            <Text size="paragraph-sm" className="text-gray-400">
              Información de configuración:
            </Text>
            <div className="mt-2 space-y-1 text-xs text-gray-400">
              <p>
                URL de la API:{" "}
                <span className="text-blue-400">{API_CONFIG.API_URL}</span>
              </p>
              <p>
                ID de Usuario: <span className="text-blue-400">{userId}</span>
              </p>
              <p>
                Ruta de matches:{" "}
                <span className="text-blue-400">/users/{userId}/matches/</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={checkApiConnection}
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Comprobando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar API
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
