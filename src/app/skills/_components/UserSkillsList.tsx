"use client";

import { useState, useEffect } from "react";
import { API_CONFIG } from "@/lib/api-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Star, Trash2 } from "lucide-react";
import { Text } from "@/components/text";
import { DatabaseStatus } from "@/components/database-status";

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

interface UserSkillsListProps {
  userId: string;
}

export default function UserSkillsList({ userId }: UserSkillsListProps) {
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserSkills = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_CONFIG.API_URL}/userabilities/user/${userId}`
        );

        if (!response.ok) {
          throw new Error(`Error al cargar habilidades: ${response.status}`);
        }

        const data = await response.json();
        setSkills(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserSkills();
    }
  }, [userId]);

  const handleDeleteSkill = async (skillId: number) => {
    try {
      const response = await fetch(
        `${API_CONFIG.API_URL}/userabilities/${skillId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Error al eliminar habilidad: ${response.status}`);
      }

      // Actualizar la lista de habilidades
      setSkills(skills.filter((skill) => skill.id !== skillId));
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("No se pudo eliminar la habilidad");
    }
  };
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Text size="heading-4" className="text-white">
              Mis Habilidades
            </Text>
            <Text size="paragraph-sm" className="text-gray-400 mt-1">
              Cargando habilidades desde la base de datos...
            </Text>
          </div>
          <DatabaseStatus />
        </div>
        <div className="p-8 text-center bg-gray-900 rounded-lg">
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
          <p className="text-gray-400 mt-4">Sincronizando con el servidor...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Text size="heading-4" className="text-white">
              Mis Habilidades
            </Text>
            <Text size="paragraph-sm" className="text-red-400 mt-1">
              Error de conexión con la base de datos
            </Text>
          </div>
          <DatabaseStatus />
        </div>
        <div className="p-8 text-center bg-gray-900 rounded-lg">
          <h2 className="text-xl font-bold text-red-500 mb-2">
            Error de conexión
          </h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Reintentar conexión
          </Button>
        </div>
      </div>
    );
  }

  // Separar habilidades que ofrece y que busca
  const skillsOfrecidas = skills.filter(
    (skill) => skill.skill_type === "Ofrece"
  );
  const skillsBuscadas = skills.filter((skill) => skill.skill_type === "Busca");
  if (skills.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Text size="heading-4" className="text-white">
              Mis Habilidades
            </Text>
            <Text size="paragraph-sm" className="text-green-400 mt-1">
              ✓ Conectado a la base de datos - Sin habilidades registradas
            </Text>
          </div>
          <DatabaseStatus />
        </div>
        <div className="text-center py-12 bg-gray-900 rounded-lg">
          <h3 className="text-xl text-gray-300 mb-2">
            No tienes habilidades registradas
          </h3>
          <p className="text-gray-400 mb-6">
            Añade habilidades que ofreces o que te gustaría aprender
          </p>
          <Button
            onClick={() =>
              document
                .querySelector('[value="agregar-habilidad"]')
                ?.dispatchEvent(new Event("click"))
            }
          >
            Agregar Habilidad
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Text size="heading-4" className="text-white">
            Mis Habilidades
          </Text>
          <Text size="paragraph-sm" className="text-green-400 mt-1">
            ✓ {skills.length} habilidades sincronizadas desde la base de datos
          </Text>
        </div>
        <DatabaseStatus />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Habilidades que ofrece */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="text-green-400" size={20} />
              <span>Habilidades que ofrezco</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skillsOfrecidas.length > 0 ? (
              <ul className="space-y-3">
                {skillsOfrecidas.map((skill) => (
                  <li
                    key={skill.id}
                    className="flex justify-between items-center bg-gray-800 p-3 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-200">
                        {skill.ability?.name || `Habilidad ${skill.ability_id}`}
                      </h4>
                      <span className="text-sm text-gray-400">
                        Nivel:{" "}
                        <span className="text-green-400">
                          {skill.proficiency_level}
                        </span>
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-400 hover:bg-gray-700"
                      onClick={() => handleDeleteSkill(skill.id)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No has registrado habilidades que ofreces
              </p>
            )}
          </CardContent>
        </Card>

        {/* Habilidades que busca */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="text-blue-400" size={20} />
              <span>Habilidades que busco</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skillsBuscadas.length > 0 ? (
              <ul className="space-y-3">
                {skillsBuscadas.map((skill) => (
                  <li
                    key={skill.id}
                    className="flex justify-between items-center bg-gray-800 p-3 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-200">
                        {skill.ability?.name || `Habilidad ${skill.ability_id}`}
                      </h4>
                      <span className="text-sm text-gray-400">
                        Nivel deseado:{" "}
                        <span className="text-blue-400">
                          {skill.proficiency_level}
                        </span>
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-400 hover:bg-gray-700"
                      onClick={() => handleDeleteSkill(skill.id)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No has registrado habilidades que buscas
              </p>
            )}{" "}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
