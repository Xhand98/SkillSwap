"use client";

import { useState, useEffect } from "react";
import { API_CONFIG } from "@/lib/api-config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/text";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Mail,
  MapPin,
  Calendar,
  Globe,
  Briefcase,
  User,
  Star,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

interface UserProfile {
  id: number;
  nombre_usuario: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  correo_electronico: string;
  ciudad_trabajo: string;
  fecha_nacimiento?: string;
  linkedin_link?: string;
  github_link?: string;
  website_link?: string;
  rol: string;
  created_at: string;
}

interface UserSkill {
  id: number;
  usuario_id: number;
  ability_id: number;
  skill_type: string;
  proficiency_level: string;
  ability?: {
    id: number;
    name: string;
    category: string;
    description: string;
  };
}

interface UserProfileProps {
  userId: string;
}

export default function ProfileDetails({ userId }: UserProfileProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si es el perfil del usuario actual
  const isOwnProfile = user && user.id.toString() === userId;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true); // Obtener datos del perfil
        const profileResponse = await fetch(
          `${API_CONFIG.API_URL}/users/${userId}`
        );

        if (!profileResponse.ok) {
          throw new Error(
            `Error al cargar el perfil: ${profileResponse.status}`
          );
        }

        const profileData = await profileResponse.json();
        setProfile(profileData);

        // Intentar obtener habilidades del usuario
        try {
          const skillsResponse = await fetch(
            `${API_CONFIG.API_URL}/userabilities/user/${userId}`
          );
          if (skillsResponse.ok) {
            const skillsData = await skillsResponse.json();
            setUserSkills(skillsData || []);
          }
        } catch (skillError) {
          console.error("Error al cargar habilidades:", skillError);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <p className="text-gray-400 mt-4">Cargando perfil...</p>
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

  if (!profile) {
    return (
      <div className="p-8 text-center bg-gray-900 rounded-lg">
        <User size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-300 mb-2">
          Perfil no encontrado
        </h2>
        <p className="text-gray-400">
          No se encontró información para este usuario
        </p>
      </div>
    );
  }

  const fullName = [
    profile.primer_nombre,
    profile.segundo_nombre,
    profile.primer_apellido,
    profile.segundo_apellido,
  ]
    .filter(Boolean)
    .join(" ");

  // Separar habilidades que ofrece y que busca
  const skillsOfrecidas = userSkills.filter(
    (skill) => skill.skill_type === "Ofrece"
  );
  const skillsBuscadas = userSkills.filter(
    (skill) => skill.skill_type === "Busca"
  );

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Cabecera del perfil */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-primary/40 to-primary"></div>
        <div className="absolute -bottom-16 left-6">
          <Avatar className="h-32 w-32 border-4 border-gray-900">
            <AvatarImage
              src={`https://avatar.vercel.sh/${profile.nombre_usuario}`}
            />
            <AvatarFallback>
              {profile.primer_nombre[0]}
              {profile.primer_apellido[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Información del perfil */}
      <div className="pt-20 px-6 pb-6">
        {" "}
        <div className="flex justify-between items-start">
          <div>
            {" "}
            <Text size="heading-3" className="text-white">
              {fullName}
            </Text>
            <Text size="paragraph-base" className="text-gray-400">
              @{profile.nombre_usuario}
            </Text>
            <Text size="paragraph-sm" className="text-gray-400 mt-1">
              {profile.rol === "admin" ? "Administrador" : "Usuario"}
            </Text>
          </div>{" "}
          <div className="flex gap-2">
            {isOwnProfile ? (
              // Botones para el propio perfil
              <>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link href="/profiles/edit">
                    <Edit size={16} />
                    Editar Perfil
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link href="/skills">
                    <Briefcase size={16} />
                    Gestionar Habilidades
                  </Link>
                </Button>
              </>
            ) : (
              // Botones para perfiles de otros usuarios
              <>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link href={`/skills`}>
                    <Briefcase size={16} />
                    Ver Habilidades
                  </Link>
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Mail size={16} />
                      Contactar
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-semibold text-white">
                        Contactar a {profile.primer_nombre}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      {/* Información del usuario */}
                      <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${profile.nombre_usuario}`}
                          />
                          <AvatarFallback>
                            {profile.primer_nombre[0]}
                            {profile.primer_apellido[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-white">{fullName}</h3>
                          <p className="text-sm text-gray-400">
                            @{profile.nombre_usuario}
                          </p>
                        </div>
                      </div>{" "}
                      {/* Información de contacto */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={16} className="text-gray-400" />
                          <span className="text-gray-300">
                            {profile.correo_electronico}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="text-gray-300">
                            {profile.ciudad_trabajo}
                          </span>
                        </div>

                        {profile.fecha_nacimiento && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar size={16} className="text-gray-400" />
                            <span className="text-gray-300">
                              {new Date(
                                profile.fecha_nacimiento
                              ).toLocaleDateString("es-ES")}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Enlaces profesionales */}
                      {(profile.linkedin_link ||
                        profile.github_link ||
                        profile.website_link) && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-300">
                            Enlaces Profesionales
                          </h4>
                          <div className="space-y-2">
                            {profile.linkedin_link && (
                              <a
                                href={profile.linkedin_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-400 hover:underline"
                              >
                                <Globe size={16} />
                                LinkedIn
                              </a>
                            )}

                            {profile.github_link && (
                              <a
                                href={profile.github_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-400 hover:underline"
                              >
                                <Globe size={16} />
                                GitHub
                              </a>
                            )}

                            {profile.website_link && (
                              <a
                                href={profile.website_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-400 hover:underline"
                              >
                                <Globe size={16} />
                                Sitio Web
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Habilidades disponibles */}
                      {skillsOfrecidas.length > 0 && (
                        <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                          <h4 className="text-sm font-medium text-white mb-2">
                            Habilidades que ofrece:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {skillsOfrecidas.slice(0, 3).map((skill) => (
                              <span
                                key={skill.id}
                                className="text-xs bg-green-900/20 text-green-400 px-2 py-1 rounded-full"
                              >
                                {skill.ability?.name ||
                                  `Habilidad ${skill.ability_id}`}
                              </span>
                            ))}
                            {skillsOfrecidas.length > 3 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{skillsOfrecidas.length - 3} más
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Botón de acción */}
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => {
                            window.open(
                              `mailto:${profile.correo_electronico}?subject=Contacto desde SkillSwap&body=Hola ${profile.primer_nombre},%0D%0A%0D%0AHe visto tu perfil en SkillSwap y me gustaría ponerme en contacto contigo.%0D%0A%0D%0ASaludos!`,
                              "_blank"
                            );
                          }}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Mail size={14} className="mr-1" />
                          Enviar Email
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
        {/* Detalles adicionales */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center text-gray-400 gap-2">
            <MapPin size={16} />
            <Text size="paragraph-sm">{profile.ciudad_trabajo}</Text>
          </div>
          <div className="flex items-center text-gray-400 gap-2">
            <Mail size={16} />
            <Text size="paragraph-sm">{profile.correo_electronico}</Text>
          </div>
          <div className="flex items-center text-gray-400 gap-2">
            <Calendar size={16} />
            <Text size="paragraph-sm">
              Se unió el{" "}
              {new Date(profile.created_at).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </div>
        </div>
        {/* Habilidades del usuario */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Habilidades que ofrece */}
          <div>
            {" "}
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={18} className="text-green-400" />
              <Text size="heading-3" className="text-white">
                Habilidades que ofrece
              </Text>
            </div>
            {skillsOfrecidas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skillsOfrecidas.map((skill) => (
                  <div
                    key={skill.id}
                    className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    <Globe size={14} />
                    {skill.ability?.name || `Habilidad ${skill.ability_id}`}
                    <span className="bg-green-900/20 text-green-400 px-1.5 py-0.5 rounded-full text-xs ml-1">
                      {skill.proficiency_level}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No hay habilidades ofrecidas
              </p>
            )}
          </div>

          {/* Habilidades que busca */}
          <div>
            {" "}
            <div className="flex items-center gap-2 mb-3">
              <Star size={18} className="text-blue-400" />
              <Text size="heading-3" className="text-white">
                Habilidades que busca
              </Text>
            </div>
            {skillsBuscadas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skillsBuscadas.map((skill) => (
                  <div
                    key={skill.id}
                    className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    <Globe size={14} />
                    {skill.ability?.name || `Habilidad ${skill.ability_id}`}
                    <span className="bg-blue-900/20 text-blue-400 px-1.5 py-0.5 rounded-full text-xs ml-1">
                      {skill.proficiency_level}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No hay habilidades buscadas
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
