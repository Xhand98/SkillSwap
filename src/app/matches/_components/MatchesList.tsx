"use client";

import { useState, useEffect } from "react";
import { API_CONFIG } from "@/lib/api-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  UserCheck,
  X,
  Check,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

// Definición actualizada según la respuesta real de la API
interface User {
  id: number;
  nombre_usuario: string;
  primer_nombre: string;
  primer_apellido: string;
  segundo_apellido?: string;
  correo_electronico?: string;
  ciudad_trabajo?: string;
  created_at?: string;
  updated_at?: string;
  rol?: string;
}

interface Ability {
  id: number;
  name: string;
  category?: string;
  description?: string;
}

interface Match {
  id: number;
  user_id_1: number;
  user_id_2: number;
  ability_1_id: number;
  ability_2_id: number;
  matching_state: string;
  created_at?: string;
  user_1?: User;
  user_2?: User;
  ability_1?: Ability;
  ability_2?: Ability;
}

interface MatchesListProps {
  userId: string;
}

export default function MatchesList({ userId }: MatchesListProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [apiInfo, setApiInfo] = useState<any>({
    url: "",
    requestTime: 0,
    status: "idle",
    matchesCount: 0,
  });
  // Función para manejar el caso de fallo de la API
  const handleApiFailure = (error: any) => {
    console.error("Error en la conexión a la API:", error);
    setMatches([]);
    setIsUsingMockData(false);
    setError(
      "Error de conexión a la API. Por favor, inténtalo de nuevo más tarde."
    );
    return false;
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(
          `Obteniendo matches para el usuario ${userId} desde la API real...`
        );

        // Guardamos el tiempo de inicio para calcular la duración de la petición
        const startTime = performance.now(); // URL para obtener matches de la API real
        const url = `${API_CONFIG.API_URL}/users/${userId}/matches`;
        setApiInfo((prev: any) => ({ ...prev, url }));
        console.log(`Realizando petición a: ${url}`);

        // Configuración de la petición con timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
          mode: "cors",
        });

        clearTimeout(timeoutId);
        const requestTime = Math.round(performance.now() - startTime);

        if (!response.ok) {
          console.log(
            `Error en la petición: ${url}, status: ${response.status}`
          );
          throw new Error(
            `Error al cargar matches: ${response.status} ${response.statusText}`
          );
        }

        console.log(`Petición exitosa a: ${url}`);
        const data = await response.json();
        console.log("Respuesta de la API:", data);

        // Actualizamos la información de la API
        setApiInfo({
          url,
          requestTime,
          status: "success",
          statusCode: response.status,
          statusText: response.statusText,
          matchesCount: Array.isArray(data) ? data.length : 0,
        });

        // La API devuelve directamente un array de matches
        if (Array.isArray(data)) {
          setMatches(data);
          console.log(`Se encontraron ${data.length} matches en la API real`);
        } else {
          console.warn("Formato de respuesta inesperado:", data);
          setMatches([]);
        }

        setIsUsingMockData(false);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Error desconocido";
        console.error("Error al obtener matches:", errorMsg);
        setError(`Error al cargar matches: ${errorMsg}`);

        setApiInfo((prev: any) => ({
          ...prev,
          status: "error",
          errorMessage: errorMsg,
        })); // Manejamos el error de la API
        handleApiFailure(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMatches();
    } else {
      console.error("No se proporcionó un ID de usuario");
      setError("No se proporcionó un ID de usuario");
      setLoading(false);
    }
  }, [userId]);

  const handleUpdateMatchStatus = async (matchId: number, status: string) => {
    try {
      console.log(`Actualizando estado del match ${matchId} a ${status}`);
      const response = await fetch(`${API_CONFIG.API_URL}/matches/${matchId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matching_state: status,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar el estado: ${response.status}`);
      }

      // Actualizamos la lista de matches localmente
      setMatches(
        matches.map((match) =>
          match.id === matchId ? { ...match, matching_state: status } : match
        )
      );

      console.log(`Match ${matchId} actualizado exitosamente a ${status}`);
    } catch (err) {
      console.error("Error al actualizar match:", err);
      alert("No se pudo actualizar el estado del match");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <p className="text-gray-400 mt-4">Cargando matches...</p>
      </div>
    );
  }

  if (error && matches.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-900 rounded-lg">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-gray-300">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900 rounded-lg">
        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl text-gray-300 mb-2">No tienes matches</h3>
        <p className="text-gray-400 mb-6">
          Aún no tienes ningún match. Explora los matches potenciales para
          conectar con otros usuarios.
        </p>
        <Button
          onClick={() =>
            document
              .querySelector('[value="matches-potenciales"]')
              ?.dispatchEvent(new Event("click"))
          }
        >
          Ver Matches Potenciales
        </Button>
      </div>
    );
  }

  // Información de depuración
  console.log("DEBUG - Estado de matches:");
  console.log("- Total matches:", matches.length);
  console.log("- Hay matches para renderizar:", matches.length > 0);
  console.log("- isUsingMockData:", isUsingMockData);
  console.log("- userId:", userId);

  // Filtramos los matches activos, pendientes y programados
  // Nota: Adaptamos los estados según la API real
  const pendingMatches = matches.filter(
    (match) =>
      match.matching_state === "pendiente" ||
      match.matching_state === "Pendiente"
  );

  const activeMatches = matches.filter(
    (match) =>
      match.matching_state === "aceptado" ||
      match.matching_state === "Activo" ||
      match.matching_state === "Programado"
  );

  console.log("Matches activos:", activeMatches.length);
  console.log("Matches pendientes:", pendingMatches.length);

  // Para determinar si el usuario actual es user_id_1 o user_id_2 en cada match
  const getOtherUser = (match: Match) => {
    const userIdNum = parseInt(userId);
    if (match.user_id_1 === userIdNum) {
      return (
        match.user_2 || {
          id: match.user_id_2,
          nombre_usuario: "Usuario",
          primer_nombre: "Sin",
          primer_apellido: "nombre",
        }
      );
    } else {
      return (
        match.user_1 || {
          id: match.user_id_1,
          nombre_usuario: "Usuario",
          primer_nombre: "Sin",
          primer_apellido: "nombre",
        }
      );
    }
  };

  const getUserAbility = (match: Match) => {
    const userIdNum = parseInt(userId);
    if (match.user_id_1 === userIdNum) {
      return (
        match.ability_1 || {
          id: match.ability_1_id,
          name: "Habilidad no especificada",
        }
      );
    } else {
      return (
        match.ability_2 || {
          id: match.ability_2_id,
          name: "Habilidad no especificada",
        }
      );
    }
  };

  const getOtherUserAbility = (match: Match) => {
    const userIdNum = parseInt(userId);
    if (match.user_id_1 === userIdNum) {
      return (
        match.ability_2 || {
          id: match.ability_2_id,
          name: "Habilidad no especificada",
        }
      );
    } else {
      return (
        match.ability_1 || {
          id: match.ability_1_id,
          name: "Habilidad no especificada",
        }
      );
    }
  };

  return (
    <div className="space-y-10">
      {/* Indicador de datos fallback */}
      {error && isUsingMockData && (
        <div className="p-4 bg-amber-900/20 border border-amber-700 rounded-md mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <p className="text-sm text-amber-500">
              Error al conectar con la API, utilizando datos de respaldo.
            </p>
          </div>
          <p className="text-xs text-amber-400/70 mt-1">{error}</p>
        </div>
      )}

      {pendingMatches.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Solicitudes Pendientes ({pendingMatches.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingMatches.map((match) => {
              const otherUser = getOtherUser(match);
              const userAbility = getUserAbility(match);
              const otherUserAbility = getOtherUserAbility(match);

              return (
                <Card key={match.id} className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${
                              otherUser?.nombre_usuario || "user"
                            }`}
                          />
                          <AvatarFallback>
                            {otherUser?.primer_nombre?.[0] || "U"}
                            {otherUser?.primer_apellido?.[0] || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {otherUser?.primer_nombre}{" "}
                          {otherUser?.primer_apellido}
                        </span>
                      </div>
                      <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded-full">
                        Pendiente
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 text-sm text-gray-400">
                      <p>
                        Ofreces:{" "}
                        <span className="text-green-400">
                          {userAbility?.name}
                        </span>
                      </p>
                      <p>
                        Buscas:{" "}
                        <span className="text-blue-400">
                          {otherUserAbility?.name}
                        </span>
                      </p>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-800 text-red-500 hover:bg-red-950/50 hover:text-red-400"
                        onClick={() =>
                          handleUpdateMatchStatus(match.id, "rechazado")
                        }
                      >
                        <X size={16} className="mr-1" />
                        Rechazar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-800 text-green-500 hover:bg-green-950/50 hover:text-green-400"
                        onClick={() =>
                          handleUpdateMatchStatus(match.id, "aceptado")
                        }
                      >
                        <Check size={16} className="mr-1" />
                        Aceptar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeMatches.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Matches Activos ({activeMatches.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeMatches.map((match) => {
              const otherUser = getOtherUser(match);
              const userAbility = getUserAbility(match);
              const otherUserAbility = getOtherUserAbility(match);

              return (
                <Card key={match.id} className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${
                              otherUser?.nombre_usuario || "user"
                            }`}
                          />
                          <AvatarFallback>
                            {otherUser?.primer_nombre?.[0] || "U"}
                            {otherUser?.primer_apellido?.[0] || "S"}
                          </AvatarFallback>
                        </Avatar>{" "}
                        <Link
                          href={`/profiles/${otherUser?.id}`}
                          className="hover:underline"
                        >
                          {otherUser?.primer_nombre}{" "}
                          {otherUser?.primer_apellido}
                        </Link>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          match.matching_state === "Programado"
                            ? "bg-blue-900/30 text-blue-400"
                            : "bg-green-900/30 text-green-400"
                        }`}
                      >
                        {match.matching_state === "Programado"
                          ? "Programado"
                          : "Activo"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 text-sm text-gray-400">
                      <p>
                        Ofreces:{" "}
                        <span className="text-green-400">
                          {userAbility?.name}
                        </span>
                        {userAbility?.category && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({userAbility.category})
                          </span>
                        )}
                      </p>
                      <p>
                        Buscas:{" "}
                        <span className="text-blue-400">
                          {otherUserAbility?.name}
                        </span>
                        {otherUserAbility?.category && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({otherUserAbility.category})
                          </span>
                        )}
                      </p>
                      {otherUser?.ciudad_trabajo && (
                        <p className="text-xs text-gray-500 mt-2">
                          Ubicación: {otherUser.ciudad_trabajo}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Link
                          href={`/profiles/${otherUser?.id}`}
                          className="flex items-center"
                        >
                          <UserCheck size={16} className="mr-1" />
                          Ver Perfil
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Panel de diagnóstico */}
      {/* <details className="mt-8 text-left border-t border-gray-800 pt-4 text-xs text-gray-500">
        <summary className="cursor-pointer flex items-center">
          <ChevronDown className="h-3 w-3 mr-1" />
          Información técnica
        </summary>
        <div className="p-4 bg-gray-950 rounded mt-2">
          <h4 className="font-medium mb-2">Estado de la API:</h4>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>URL: {apiInfo.url}</li>
            <li>
              Estado:{" "}
              <span
                className={
                  apiInfo.status === "success"
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {apiInfo.status}
              </span>
            </li>
            {apiInfo.requestTime && (
              <li>Tiempo de respuesta: {apiInfo.requestTime}ms</li>
            )}
            {apiInfo.errorMessage && (
              <li className="text-red-500">Error: {apiInfo.errorMessage}</li>
            )}
          </ul>

          <h4 className="font-medium mt-4 mb-2">Estado interno:</h4>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Usuario ID: {userId}</li>
            <li>Total de matches: {matches.length}</li>
            <li>Matches activos: {activeMatches.length}</li>
            <li>Matches pendientes: {pendingMatches.length}</li>
            <li>Usando datos simulados: {isUsingMockData ? "Sí" : "No"}</li>
          </ul>
        </div>
      </details> */}
    </div>
  );
}
