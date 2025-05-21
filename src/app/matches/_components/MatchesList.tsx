"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, UserCheck, X, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Match {
  id: number;
  user_id_1: number;
  user_id_2: number;
  ability_1_id: number;
  ability_2_id: number;
  matching_state: string;
  user_1?: {
    id: number;
    nombre_usuario: string;
    primer_nombre: string;
    primer_apellido: string;
  };
  user_2?: {
    id: number;
    nombre_usuario: string;
    primer_nombre: string;
    primer_apellido: string;
  };
  ability_1?: {
    id: number;
    name: string;
  };
  ability_2?: {
    id: number;
    name: string;
  };
}

interface MatchesListProps {
  userId: string;
}

export default function MatchesList({ userId }: MatchesListProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8000/users/${userId}/matches/`
        );

        if (!response.ok) {
          throw new Error(`Error al cargar matches: ${response.status}`);
        }

        const data = await response.json();
        setMatches(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMatches();
    }
  }, [userId]);

  const handleUpdateMatchStatus = async (matchId: number, status: string) => {
    try {
      const response = await fetch(`http://localhost:8000/matches/${matchId}`, {
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

      // Actualizar la lista de matches
      setMatches(
        matches.map((match) =>
          match.id === matchId ? { ...match, matching_state: status } : match
        )
      );
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

  if (error) {
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

  // Filtramos los matches activos y pendientes
  const activeMatches = matches.filter(
    (match) => match.matching_state === "aceptado"
  );
  const pendingMatches = matches.filter(
    (match) => match.matching_state === "pendiente"
  );

  // Para determinar si el usuario actual es user_1 o user_2 en cada match
  const getOtherUser = (match: Match) => {
    const userIdNum = parseInt(userId);
    if (match.user_id_1 === userIdNum) {
      return match.user_2;
    } else {
      return match.user_1;
    }
  };

  const getUserAbility = (match: Match) => {
    const userIdNum = parseInt(userId);
    if (match.user_id_1 === userIdNum) {
      return match.ability_1;
    } else {
      return match.ability_2;
    }
  };

  const getOtherUserAbility = (match: Match) => {
    const userIdNum = parseInt(userId);
    if (match.user_id_1 === userIdNum) {
      return match.ability_2;
    } else {
      return match.ability_1;
    }
  };

  return (
    <div className="space-y-10">
      {pendingMatches.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Solicitudes Pendientes
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
            Matches Activos
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
                      <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full">
                        Conectado
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
                        className="border-indigo-800 text-indigo-500 hover:bg-indigo-950/50 hover:text-indigo-400"
                        asChild
                      >
                        <Link href={`/chat/${otherUser?.id}`}>
                          <MessageSquare size={16} className="mr-1" />
                          Chatear
                        </Link>
                      </Button>{" "}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/profiles/${otherUser?.id}`}>
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
    </div>
  );
}
