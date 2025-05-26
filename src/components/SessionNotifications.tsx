"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Text } from "@/components/text";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { API_CONFIG } from "@/lib/api-config";

interface UpcomingSession {
  id: number;
  match_id: number;
  date_time: string;
  location: string;
  status: string;
  match: {
    user_1: {
      id: number;
      nombre_usuario: string;
    };
    user_2: {
      id: number;
      nombre_usuario: string;
    };
    ability_1: {
      name: string;
    };
    ability_2: {
      name: string;
    };
  };
}

interface SessionNotificationsProps {
  onlyShowUpcoming?: boolean;
  maxDisplayCount?: number;
}

export function SessionNotifications({
  onlyShowUpcoming = true,
  maxDisplayCount = 3,
}: SessionNotificationsProps) {
  const { user } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Primero obtenemos todos los matches del usuario
        const matchesResponse = await fetch(
          `${API_CONFIG.API_URL}/users/${user.id}/matches/`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );

        if (!matchesResponse.ok) {
          throw new Error(
            `No se pudieron cargar los matches: ${matchesResponse.status}`
          );
        }

        const matchesData = await matchesResponse.json();
        console.log("Matches del usuario:", matchesData);

        // Verificar que matchesData es un array
        if (!Array.isArray(matchesData)) {
          console.error("La respuesta de matches no es un array:", matchesData);
          setUpcomingSessions([]);
          setIsLoading(false);
          return;
        } // Para cada match, buscamos sus sesiones
        const sessionsPromises = matchesData.map((match: any) =>
          fetch(`${API_CONFIG.API_URL}/matches/${match.id}/sessions/`, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          })
            .then(async (res) => {
              if (!res.ok) {
                console.error(
                  `Error al obtener sesiones para match ${match.id}: ${res.status}`
                );
                return [];
              }
              const data = await res.json();
              return Array.isArray(data) ? data : [];
            })
            .catch((err) => {
              console.error(
                `Error en la petición de sesiones para match ${match.id}:`,
                err
              );
              return [];
            })
        );
        const sessionsArrays = await Promise.all(sessionsPromises);

        console.log("Arrays de sesiones obtenidos:", sessionsArrays);

        // Aplanamos el array de arrays
        let allSessions = sessionsArrays.flat();
        console.log("Sesiones totales:", allSessions.length);

        if (onlyShowUpcoming) {
          // Filtrar solo sesiones programadas y futuras
          const now = new Date();
          allSessions = allSessions.filter((session: UpcomingSession) => {
            if (!session || !session.date_time) {
              console.warn("Sesión inválida encontrada:", session);
              return false;
            }
            return (
              session.status === "scheduled" &&
              new Date(session.date_time) > now
            );
          });

          console.log("Sesiones futuras filtradas:", allSessions.length);

          // Ordenar por fecha más cercana primero
          allSessions.sort((a: UpcomingSession, b: UpcomingSession) => {
            return (
              new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
            );
          });
        }

        // Limitar el número de sesiones mostradas
        const limitedSessions = allSessions.slice(0, maxDisplayCount);
        console.log("Mostrando sesiones:", limitedSessions.length);
        setUpcomingSessions(limitedSessions);
      } catch (error) {
        console.error("Error fetching upcoming sessions:", error);
        setUpcomingSessions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUpcomingSessions();
    }
  }, [user, onlyShowUpcoming, maxDisplayCount]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPartnerName = (session: UpcomingSession) => {
    if (!user) return "Usuario";
    const isUser1 = user.id === session.match.user_1.id;
    return isUser1
      ? session.match.user_2.nombre_usuario
      : session.match.user_1.nombre_usuario;
  };
  // Si está cargando, mostrar un indicador de carga
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {onlyShowUpcoming ? "Próximas Sesiones" : "Mis Sesiones"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Cargando sesiones...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si no hay sesiones próximas, mostrar un mensaje
  if (upcomingSessions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {onlyShowUpcoming ? "Próximas Sesiones" : "Mis Sesiones"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No tienes sesiones {onlyShowUpcoming ? "próximas" : "programadas"}.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {onlyShowUpcoming ? "Próximas Sesiones" : "Mis Sesiones"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingSessions.map((session) => (
          <div
            key={session.id}
            className="p-3 border rounded-md bg-muted/30 hover:bg-muted transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <Text className="font-medium">{getPartnerName(session)}</Text>
                <Text className="text-sm text-muted-foreground">
                  {session.match.ability_1.name} ↔{" "}
                  {session.match.ability_2.name}
                </Text>
              </div>

              <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold">
                {new Date(session.date_time).toLocaleDateString() ===
                new Date().toLocaleDateString()
                  ? "Hoy"
                  : formatDate(session.date_time)}
              </div>
            </div>

            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-2" />
                <span>{formatTime(session.date_time)}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-2" />
                <span>{session.location}</span>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <Link href={`/sessions/${session.id}`}>
                <Button variant="link" size="sm" className="h-auto p-0">
                  Ver detalles
                </Button>
              </Link>
            </div>
          </div>
        ))}

        {upcomingSessions.length > 0 && (
          <Link href="/sessions" className="flex justify-center">
            <Button variant="outline" size="sm" className="w-full">
              Ver todas mis sesiones
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
