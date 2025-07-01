"use client";

import { useState, useEffect } from "react";
import { API_CONFIG } from "@/lib/api-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/text";
import {
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Server,
  Globe,
  Clock,
} from "lucide-react";

interface DiagnosticResult {
  name: string;
  status: "success" | "error" | "loading";
  message: string;
  details?: string;
  responseTime?: number;
}

export default function DatabaseDiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);

    const tests: DiagnosticResult[] = [];

    // Test 1: Health Check
    try {
      const startTime = Date.now();
      const response = await fetch(`${API_CONFIG.API_URL}/health`);
      const endTime = Date.now();

      if (response.ok) {
        const data = await response.json();
        tests.push({
          name: "Health Check",
          status: "success",
          message: "API responde correctamente",
          details: JSON.stringify(data, null, 2),
          responseTime: endTime - startTime,
        });
      } else {
        tests.push({
          name: "Health Check",
          status: "error",
          message: `HTTP ${response.status}: ${response.statusText}`,
          details: `URL: ${API_CONFIG.API_URL}/health`,
        });
      }
    } catch (error) {
      tests.push({
        name: "Health Check",
        status: "error",
        message: "No se puede conectar al servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      });
    }

    setDiagnostics([...tests]);

    // Test 2: Abilities Endpoint
    try {
      const startTime = Date.now();
      const response = await fetch(`${API_CONFIG.API_URL}/abilities/`);
      const endTime = Date.now();

      if (response.ok) {
        const data = await response.json();
        tests.push({
          name: "Cargar Habilidades",
          status: "success",
          message: `${
            data.abilities?.length || 0
          } habilidades cargadas desde la BD`,
          details: `Primeras habilidades: ${data.abilities
            ?.slice(0, 3)
            .map((a: any) => a.name)
            .join(", ")}`,
          responseTime: endTime - startTime,
        });
      } else {
        tests.push({
          name: "Cargar Habilidades",
          status: "error",
          message: `HTTP ${response.status}: ${response.statusText}`,
          details: `URL: ${API_CONFIG.API_URL}/abilities/`,
        });
      }
    } catch (error) {
      tests.push({
        name: "Cargar Habilidades",
        status: "error",
        message: "Error al cargar habilidades",
        details: error instanceof Error ? error.message : "Error desconocido",
      });
    }

    setDiagnostics([...tests]);

    // Test 3: UserAbilities POST
    try {
      const startTime = Date.now();
      const response = await fetch(`${API_CONFIG.API_URL}/userabilities/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: 999, // Test user ID
          ability_id: 1,
          skill_type: "Ofrece",
          proficiency_level: "Test",
        }),
      });
      const endTime = Date.now();

      if (response.ok) {
        tests.push({
          name: "Agregar Habilidad (POST)",
          status: "success",
          message: "Endpoint POST funciona correctamente",
          details: "Habilidad de prueba agregada exitosamente",
          responseTime: endTime - startTime,
        });
      } else {
        tests.push({
          name: "Agregar Habilidad (POST)",
          status: "error",
          message: `HTTP ${response.status}: ${response.statusText}`,
          details: `URL: ${API_CONFIG.API_URL}/userabilities/`,
        });
      }
    } catch (error) {
      tests.push({
        name: "Agregar Habilidad (POST)",
        status: "error",
        message: "Error en endpoint POST",
        details: error instanceof Error ? error.message : "Error desconocido",
      });
    }

    setDiagnostics([...tests]);

    // Test 4: UserAbilities GET
    try {
      const startTime = Date.now();
      const response = await fetch(
        `${API_CONFIG.API_URL}/userabilities/user/1`
      );
      const endTime = Date.now();

      if (response.ok) {
        const data = await response.json();
        tests.push({
          name: "Cargar Habilidades de Usuario",
          status: "success",
          message: `${data?.length || 0} habilidades del usuario encontradas`,
          details: "Endpoint GET de habilidades de usuario funciona",
          responseTime: endTime - startTime,
        });
      } else {
        tests.push({
          name: "Cargar Habilidades de Usuario",
          status: "error",
          message: `HTTP ${response.status}: ${response.statusText}`,
          details: `URL: ${API_CONFIG.API_URL}/userabilities/user/1`,
        });
      }
    } catch (error) {
      tests.push({
        name: "Cargar Habilidades de Usuario",
        status: "error",
        message: "Error al cargar habilidades de usuario",
        details: error instanceof Error ? error.message : "Error desconocido",
      });
    }

    setDiagnostics([...tests]);
    setIsRunning(false);
    setLastRun(new Date());
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />;
      case "loading":
        return <RefreshCw className="h-5 w-5 text-yellow-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case "loading":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Cargando</Badge>
        );
    }
  };

  const successCount = diagnostics.filter((d) => d.status === "success").length;
  const errorCount = diagnostics.filter((d) => d.status === "error").length;

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-8">
        <Text size="heading-3" className="text-white mb-2">
          Diagnóstico de Base de Datos
        </Text>
        <Text size="paragraph-base" className="text-gray-400 mb-4">
          Verifica el estado de todas las conexiones con la base de datos
        </Text>

        {lastRun && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Última verificación: {lastRun.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Summary */}
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Resumen de Conectividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {successCount}
              </div>
              <div className="text-sm text-gray-400">Conexiones exitosas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {errorCount}
              </div>
              <div className="text-sm text-gray-400">Errores detectados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {diagnostics.length}
              </div>
              <div className="text-sm text-gray-400">Tests realizados</div>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`}
              />
              {isRunning ? "Ejecutando pruebas..." : "Volver a probar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <div className="space-y-4">
        {diagnostics.map((test, index) => (
          <Card key={index} className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getStatusIcon(test.status)}
                  {test.name}
                </CardTitle>
                {getStatusBadge(test.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-2">{test.message}</p>
              {test.responseTime && (
                <p className="text-sm text-blue-400 mb-2">
                  Tiempo de respuesta: {test.responseTime}ms
                </p>
              )}
              {test.details && (
                <details className="mt-2">
                  <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                    Ver detalles
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-800 rounded text-xs text-gray-300 overflow-x-auto">
                    {test.details}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Connection Info */}
      <Card className="bg-gray-900 border-gray-800 mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Información de Conexión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">URL de la API:</span>
              <span className="text-green-400">{API_CONFIG.API_URL}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Navegador:</span>
              <span className="text-gray-300">
                {navigator.userAgent.split(" ")[0]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Zona horaria:</span>
              <span className="text-gray-300">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
