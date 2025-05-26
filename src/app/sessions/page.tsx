"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { API_CONFIG } from "@/lib/api-config";
import { Text } from "@/components/text";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, AlertTriangle, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface Session {
  id: number;
  match_id: number;
  date_time: string;
  location: string;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
  match: {
    id: number;
    user_id_1: number;
    user_id_2: number;
    ability_1_id: number;
    ability_2_id: number;
    matching_state: string;
    user_1: {
      id: number;
      nombre_usuario: string;
    };
    user_2: {
      id: number;
      nombre_usuario: string;
    };
    ability_1: {
      id: number;
      name: string;
    };
    ability_2: {
      id: number;
      name: string;
    };
  };
}

export default function MySessionsPage() {
  const { user, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserSessions = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        setError("Necesitas iniciar sesión para ver tus sesiones");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Primero obtenemos todos los matches del usuario
        const matchesResponse = await fetch(
          `${API_CONFIG.API_URL}/users/${user.id}/matches/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );

        if (!matchesResponse.ok) {
          throw new Error("No se pudieron cargar los matches");
        }

        const matchesData = await matchesResponse.json();

        // Para cada match, buscamos sus sesiones
        const sessionsPromises = matchesData.map((match: any) =>
          fetch(`${API_CONFIG.API_URL}/matches/${match.id}/sessions/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }).then((res) => res.json())
        );

        const sessionsArrays = await Promise.all(sessionsPromises);

        // Aplanamos el array de arrays
        const allSessions = sessionsArrays.flat();

        setSessions(allSessions);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError("Error al cargar las sesiones");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSessions();
  }, [isAuthenticated, user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Programada
          </span>
        );
      case "completed":
        return (
          <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Check className="h-3 w-3" />
            Completada
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Cancelada
          </span>
        );
      default:
        return (
          <span className="bg-gray-500/20 text-gray-500 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            {status}
          </span>
        );
    }
  };

  const getPartnerInfo = (session: Session) => {
    if (!user) return { name: "Usuario", id: 0 };

    const isUser1 = user.id === session.match.user_1.id;
    return {
      name: isUser1
        ? session.match.user_2.nombre_usuario
        : session.match.user_1.nombre_usuario,
      id: isUser1 ? session.match.user_id_2 : session.match.user_id_1,
    };
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
              <Text size="heading-3" className="mt-4">
                Acceso restringido
              </Text>
              <Text className="mt-2">
                Inicia sesión para ver tus sesiones programadas
              </Text>
              <Button asChild className="mt-4">
                <Link href="/login">Iniciar sesión</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Text size="heading-3" className="mb-6">
        Mis Sesiones
      </Text>

      {isLoading && (
        <div className="text-center py-10">Cargando sesiones...</div>
      )}

      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <Text>{error}</Text>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && sessions.length === 0 && (
        <Card className="mb-4 border-gray-200 bg-gray-50">
          <CardContent className="pt-6 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <Text size="heading-4" className="mt-4">
              No tienes sesiones programadas
            </Text>
            <Text className="mt-2 text-gray-500">
              Explora el feed y programa sesiones con otros usuarios
            </Text>
            <Button asChild className="mt-4">
              <Link href="/feed">Ir al feed</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {sessions.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => {
            const partner = getPartnerInfo(session);
            return (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>
                        {session.match.ability_1.name} ↔{" "}
                        {session.match.ability_2.name}
                      </CardTitle>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${partner.name}`}
                            alt={partner.name}
                          />
                          <AvatarFallback>
                            {partner.name[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Link
                          href={`/profiles/${partner.id}`}
                          className="hover:underline"
                        >
                          {partner.name}
                        </Link>
                      </div>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{formatDate(session.date_time)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{formatTime(session.date_time)}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{session.location}</span>
                    </div>
                    {session.notes && (
                      <div className="pt-2 text-sm border-t border-gray-200">
                        <p className="italic text-gray-600">{session.notes}</p>
                      </div>
                    )}
                    <div className="flex justify-end pt-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/sessions/${session.id}`}>Detalles</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
