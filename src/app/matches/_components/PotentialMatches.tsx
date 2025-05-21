"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, AlertCircle, Filter, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PotentialMatch {
  user: {
    id: number;
    nombre_usuario: string;
    primer_nombre: string;
    primer_apellido: string;
    ubicacion?: string;
  };
  matchReason: {
    userWants: {
      id: number;
      name: string;
      proficiency_level: string;
    };
    otherUserOffers: {
      id: number;
      name: string;
      proficiency_level: string;
    };
  };
}

interface UserSkill {
  id: number;
  usuario_id: number;
  ability_id: number;
  skill_type: string; // "Ofrece" o "Busca"
  proficiency_level: string;
  ability?: {
    id: number;
    name: string;
    category: string;
    description: string;
  };
}

interface PotentialMatchesProps {
  userId: string;
}

export default function PotentialMatches({ userId }: PotentialMatchesProps) {
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>(
    []
  );
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSkill, setFilterSkill] = useState("all");

  useEffect(() => {
    const fetchUserSkills = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/userabilities/user/${userId}`
        );

        if (!response.ok) {
          throw new Error(`Error al cargar habilidades: ${response.status}`);
        }

        const data = await response.json();
        setUserSkills(data || []);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error:", err);
        return [];
      }
    };

    const fetchPotentialMatches = async (skills: UserSkill[]) => {
      try {
        setLoading(true);

        // Filtramos solo las habilidades que el usuario busca
        const skillsUserWants = skills.filter(
          (skill) => skill.skill_type === "Busca"
        );

        if (skillsUserWants.length === 0) {
          setPotentialMatches([]);
          setLoading(false);
          return;
        }

        // Obtenemos todos los usuarios que ofrecen las habilidades que el usuario busca
        const matchPromises = skillsUserWants.map(async (wantedSkill) => {
          const response = await fetch(
            `http://localhost:8000/userabilities/matches/potential?userId=${userId}&abilityId=${wantedSkill.ability_id}`
          );

          if (!response.ok) {
            console.error(
              `Error buscando matches para habilidad ${wantedSkill.ability_id}`
            );
            return [];
          }

          const matchesData = await response.json();

          // Transformamos la respuesta al formato que necesitamos
          return matchesData.map((match: any) => ({
            user: {
              id: match.usuario_id,
              nombre_usuario: match.usuario.nombre_usuario,
              primer_nombre: match.usuario.primer_nombre,
              primer_apellido: match.usuario.primer_apellido,
              ubicacion: match.usuario.ubicacion,
            },
            matchReason: {
              userWants: {
                id: wantedSkill.ability_id,
                name:
                  wantedSkill.ability?.name ||
                  `Habilidad ${wantedSkill.ability_id}`,
                proficiency_level: wantedSkill.proficiency_level,
              },
              otherUserOffers: {
                id: match.ability_id,
                name: match.ability.name,
                proficiency_level: match.proficiency_level,
              },
            },
          }));
        });

        const matchesArrays = await Promise.all(matchPromises);
        // Aplanamos el array y eliminamos duplicados por ID de usuario
        const allMatches = matchesArrays.flat();
        const uniqueMatches = Array.from(
          new Map(allMatches.map((match) => [match.user.id, match])).values()
        );

        setPotentialMatches(uniqueMatches);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadData = async () => {
      const skills = await fetchUserSkills();
      await fetchPotentialMatches(skills);
    };

    if (userId) {
      loadData();
    }
  }, [userId]);

  const handleRequestMatch = async (otherUserId: number, abilityId: number) => {
    try {
      // Encontramos una habilidad que el usuario actual ofrece para hacer el intercambio
      const userOfferedSkill = userSkills.find(
        (skill) => skill.skill_type === "Ofrece"
      );

      if (!userOfferedSkill) {
        alert(
          "Debes agregar al menos una habilidad que ofrezcas para solicitar un match"
        );
        return;
      }

      const response = await fetch(`http://localhost:8000/matches/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id_1: parseInt(userId),
          user_id_2: otherUserId,
          ability_1_id: userOfferedSkill.ability_id,
          ability_2_id: abilityId,
          matching_state: "pendiente",
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al solicitar match: ${response.status}`);
      }

      // Actualizamos la lista quitando el usuario al que acabamos de enviar solicitud
      setPotentialMatches(
        potentialMatches.filter((match) => match.user.id !== otherUserId)
      );

      alert("¡Solicitud de match enviada con éxito!");
    } catch (err) {
      console.error("Error al solicitar match:", err);
      alert("No se pudo enviar la solicitud de match");
    }
  };

  // Filtramos según el término de búsqueda y el filtro de habilidad
  const filteredMatches = potentialMatches.filter((match) => {
    const nameMatches =
      `${match.user.primer_nombre} ${match.user.primer_apellido}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const skillMatches =
      filterSkill === "all" ||
      match.matchReason.userWants.id.toString() === filterSkill;

    return nameMatches && skillMatches;
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <p className="text-gray-400 mt-4">Buscando matches potenciales...</p>
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

  // Si el usuario no tiene habilidades buscadas
  if (userSkills.filter((skill) => skill.skill_type === "Busca").length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900 rounded-lg">
        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl text-gray-300 mb-2">
          No has registrado habilidades que buscas
        </h3>
        <p className="text-gray-400 mb-6">
          Para encontrar matches potenciales, primero debes agregar habilidades
          que te gustaría aprender.
        </p>
        <Button asChild>
          <Link href="/skills">Gestionar Habilidades</Link>
        </Button>
      </div>
    );
  }

  // Si no hay matches potenciales
  if (potentialMatches.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900 rounded-lg">
        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl text-gray-300 mb-2">
          No hay matches potenciales
        </h3>
        <p className="text-gray-400 mb-6">
          Actualmente no hay usuarios que ofrezcan las habilidades que estás
          buscando.
        </p>
        <Button asChild>
          <Link href="/explore">Explorar Habilidades</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 pb-6">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre..."
            className="pl-9 bg-gray-900 border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={filterSkill} onValueChange={setFilterSkill}>
            <SelectTrigger className="bg-gray-900 border-gray-700">
              <Filter className="h-4 w-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Filtrar por habilidad" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="all">Todas las habilidades</SelectItem>
              {userSkills
                .filter((skill) => skill.skill_type === "Busca")
                .map((skill) => (
                  <SelectItem
                    key={skill.ability_id}
                    value={skill.ability_id.toString()}
                  >
                    {skill.ability?.name || `Habilidad ${skill.ability_id}`}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="text-center py-8 bg-gray-900 rounded-lg">
          <p className="text-gray-400">
            No se encontraron resultados con los filtros actuales
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredMatches.map((match) => (
            <Card key={match.user.id} className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${
                          match.user.nombre_usuario || "user"
                        }`}
                      />
                      <AvatarFallback>
                        {match.user.primer_nombre?.[0] || "U"}
                        {match.user.primer_apellido?.[0] || "S"}
                      </AvatarFallback>
                    </Avatar>{" "}
                    <Link
                      href={`/profiles/${match.user.id}`}
                      className="hover:underline"
                    >
                      {match.user.primer_nombre} {match.user.primer_apellido}
                    </Link>
                  </div>
                  {match.user.ubicacion && (
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
                      {match.user.ubicacion}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-sm text-gray-400">
                  <p>
                    Buscas:{" "}
                    <span className="text-blue-400">
                      {match.matchReason.userWants.name}
                    </span>
                  </p>
                  <p>
                    Ofrece:{" "}
                    <span className="text-green-400">
                      {match.matchReason.otherUserOffers.name} (
                      {match.matchReason.otherUserOffers.proficiency_level})
                    </span>
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-indigo-800 text-indigo-500 hover:bg-indigo-950/50 hover:text-indigo-400"
                    onClick={() =>
                      handleRequestMatch(
                        match.user.id,
                        match.matchReason.otherUserOffers.id
                      )
                    }
                  >
                    <UserPlus size={16} className="mr-1" />
                    Solicitar Match
                  </Button>{" "}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/profiles/${match.user.id}`}>Ver Perfil</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
