import { Text } from "@/components/text";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  User,
  Trash2,
  MoreVertical,
  Calendar,
  UserPlus,
  Briefcase,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { QuickSchedule } from "./QuickSchedule";
import { API_CONFIG } from "@/lib/api-config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FeedCardProps {
  title: string;
  description: string;
  tags: string[];
  author: string;
  createdAt?: string;
  likes?: number;
  comments?: number;
  reposts?: number;
  id?: number;
  postId?: number;
  onPostDeleted?: () => void;
  skillName?: string; // Nombre de la habilidad del post
}

const FeedCard: React.FC<FeedCardProps> = ({
  title,
  description,
  id,
  postId,
  tags = [],
  author,
  createdAt = new Date().toISOString(),
  likes = Math.floor(Math.random() * 100),
  comments = Math.floor(Math.random() * 50),
  reposts = Math.floor(Math.random() * 10),
  onPostDeleted,
  skillName,
}) => {
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasScheduledSession, setHasScheduledSession] = useState(false);
  const [isRequestingMatch, setIsRequestingMatch] = useState(false);
  const [existingMatch, setExistingMatch] = useState<{
    exists: boolean;
    match_id?: number;
  }>({ exists: false });

  const isAdmin = user?.rol === "admin";
  const isAuthor = user?.id === id;
  const canDelete = isAdmin || isAuthor;

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return `${diffSecs}s`;
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      return `${diffDays}d`;
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Fecha inválida";
    }
  };

  useEffect(() => {
    const checkForScheduledSessions = async () => {
      if (!postId || !user || !user.id) return;

      try {
        // Verificar si existe un match
        const matchResponse = await fetch(
          `${API_CONFIG.API_URL}/matches/check?user1=${user.id}&user2=${id}`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (!matchResponse.ok) {
          console.error(`Error en respuesta de match: ${matchResponse.status}`);
          return;
        }

        const matchData = await matchResponse.json();
        console.log("Match data:", matchData);

        // Actualizar estado de match existente
        setExistingMatch(matchData);

        if (matchData && matchData.exists && matchData.match_id) {
          // Si hay match, verificar si hay sesiones programadas
          const sessionsResponse = await fetch(
            `${API_CONFIG.API_URL}/matches/${matchData.match_id}/sessions/`,
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            }
          );

          if (!sessionsResponse.ok) {
            console.error(
              `Error en respuesta de sesiones: ${sessionsResponse.status}`
            );
            return;
          }

          const sessionsData = await sessionsResponse.json();
          console.log("Sessions data:", sessionsData);

          // Si hay al menos una sesión, actualizamos el estado
          setHasScheduledSession(
            Array.isArray(sessionsData) && sessionsData.length > 0
          );
        }
      } catch (error) {
        console.error("Error al verificar sesiones:", error);
      }
    };

    checkForScheduledSessions();
  }, [postId, user, id]);

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_CONFIG.API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        if (onPostDeleted) onPostDeleted();
      } else {
        console.error("Error al eliminar post:", response.statusText);
        alert("No se pudo eliminar la publicación");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la publicación");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };
  const handleRequestMatch = async () => {
    console.log("🚀 === INICIANDO PROCESO DE MATCH ===");
    console.log("👤 Usuario actual:", user);
    console.log("🎯 Usuario del post:", { id, author });
    console.log("💼 Habilidad del post:", skillName);

    if (!user || !id || !skillName) {
      alert("Información insuficiente para crear el match");
      console.error("❌ Información faltante:", {
        user: !!user,
        id: !!id,
        skillName: !!skillName,
      });
      return;
    }

    console.log("🔍 === VERIFICANDO USUARIO ACTUAL ===");
    console.log("🆔 ID del usuario actual:", user.id);
    console.log("🆔 ID del usuario del post:", id);

    if (user.id === id) {
      alert("No puedes hacer match contigo mismo");
      return;
    }
    setIsRequestingMatch(true);
    try {
      // 1. Obtener las habilidades del usuario actual
      console.log("📚 === OBTENIENDO HABILIDADES DEL USUARIO ACTUAL ===");
      const userSkillsResponse = await fetch(
        `${API_CONFIG.API_URL}/userabilities/user/${user.id}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!userSkillsResponse.ok) {
        throw new Error("Error al obtener tus habilidades");
      }

      const userSkills = await userSkillsResponse.json();
      console.log("📋 Habilidades del usuario actual:", userSkills);

      // 2. Encontrar una habilidad que el usuario actual ofrece
      const userOfferedSkill = userSkills.find(
        (skill: any) => skill.skill_type === "Ofrece"
      );

      console.log(
        "💼 Habilidad ofrecida por usuario actual:",
        userOfferedSkill
      );

      if (!userOfferedSkill) {
        alert(
          "⚠️ Debes agregar al menos una habilidad que ofrezcas para solicitar un match.\n\nVe a tu perfil para agregar habilidades."
        );
        return;
      }

      // 3. Obtener las habilidades del usuario del post
      console.log("📚 === OBTENIENDO HABILIDADES DEL USUARIO DEL POST ===");
      const postUserSkillsResponse = await fetch(
        `${API_CONFIG.API_URL}/userabilities/user/${id}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (!postUserSkillsResponse.ok) {
        throw new Error("Error al obtener habilidades del usuario del post");
      }

      const postUserSkills = await postUserSkillsResponse.json();

      // 4. Buscar la habilidad específica que el usuario del post ofrece
      console.log("=== BUSCANDO HABILIDAD DEL POST ===");
      console.log(
        "🎯 skillName buscado:",
        `"${skillName}" (length: ${skillName?.length})`
      );
      console.log("📋 postUserSkills total:", postUserSkills.length);

      // Mostrar todas las habilidades que ofrece para debugging
      const offeredSkills = postUserSkills.filter(
        (skill: any) => skill.skill_type === "Ofrece"
      );
      console.log("💼 Habilidades que ofrece el usuario del post:");
      offeredSkills.forEach((skill: any, index: number) => {
        const abilityName = skill.ability?.name;
        console.log(
          `  ${index + 1}. "${abilityName}" (length: ${abilityName?.length})`
        );
        console.log(`     ✓ Comparación exacta: ${abilityName === skillName}`);
        console.log(
          `     ✓ Comparación trim: ${
            abilityName?.trim() === skillName?.trim()
          }`
        );
        console.log(
          `     ✓ Comparación lower: ${
            abilityName?.toLowerCase() === skillName?.toLowerCase()
          }`
        );
      });

      // Intentar búsqueda exacta primero
      let postUserOfferedSkill = postUserSkills.find(
        (skill: any) =>
          skill.skill_type === "Ofrece" && skill.ability?.name === skillName
      );

      console.log("🔍 Resultado búsqueda exacta:", !!postUserOfferedSkill);

      // Si no encuentra, intentar con trim y case-insensitive
      if (!postUserOfferedSkill) {
        console.log(
          "🔄 Búsqueda exacta falló, intentando con trim y case-insensitive..."
        );
        postUserOfferedSkill = postUserSkills.find(
          (skill: any) =>
            skill.skill_type === "Ofrece" &&
            skill.ability?.name?.trim().toLowerCase() ===
              skillName?.trim().toLowerCase()
        );
        console.log("🔍 Resultado búsqueda flexible:", !!postUserOfferedSkill);
      }
      if (!postUserOfferedSkill) {
        console.warn(
          `⚠️ No se encontró exactamente la habilidad "${skillName}". Buscando alternativas...`
        );

        // Intentar búsqueda más flexible (sin case sensitivity y sin espacios extra)
        postUserOfferedSkill = postUserSkills.find(
          (skill: any) =>
            skill.skill_type === "Ofrece" &&
            skill.ability?.name?.replace(/\s+/g, " ").trim().toLowerCase() ===
              skillName?.replace(/\s+/g, " ").trim().toLowerCase()
        );

        if (postUserOfferedSkill) {
          console.log(
            "✅ Habilidad encontrada con búsqueda flexible:",
            postUserOfferedSkill
          );
        } else {
          // Intentar encontrar cualquier habilidad que ofrezca el usuario
          const anyOfferedSkill = postUserSkills.find(
            (skill: any) => skill.skill_type === "Ofrece"
          );

          if (anyOfferedSkill) {
            console.log("Habilidad alternativa encontrada:", anyOfferedSkill);
            const shouldContinue = confirm(
              `Este usuario ofrece "${anyOfferedSkill.ability?.name}" pero no encontramos exactamente "${skillName}". ¿Quieres hacer match con "${anyOfferedSkill.ability?.name}" en su lugar?`
            );

            if (shouldContinue) {
              postUserOfferedSkill = anyOfferedSkill;
            } else {
              return;
            }
          } else {
            alert("Este usuario no ofrece ninguna habilidad actualmente");
            return;
          }
        }
      } // 5. Crear el match
      console.log("=== CREANDO MATCH ===");
      const matchData = {
        user_id_1: user.id,
        user_id_2: id,
        ability_1_id: userOfferedSkill.ability_id,
        ability_2_id: postUserOfferedSkill.ability_id,
        matching_state: "pendiente",
      };
      console.log("📤 Datos del match a crear:", matchData);
      console.log(
        `📋 Intercambio: "${userOfferedSkill.ability?.name}" ↔️ "${postUserOfferedSkill.ability?.name}"`
      );

      const matchResponse = await fetch(`${API_CONFIG.API_URL}/matches/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(matchData),
      });

      console.log(
        "📡 Respuesta del servidor:",
        matchResponse.status,
        matchResponse.statusText
      );

      if (!matchResponse.ok) {
        const errorText = await matchResponse.text();
        console.error("❌ Error en la respuesta del match:", errorText);
        throw new Error(`Error al crear match: ${errorText}`);
      }

      const matchResult = await matchResponse.json();
      console.log("✅ Match creado exitosamente:", matchResult);

      // 6. Actualizar el estado local
      setExistingMatch({ exists: true, match_id: matchResult.id });

      alert(
        `🎉 ¡Solicitud de match enviada con éxito!\n\n` +
          `Tu habilidad: "${userOfferedSkill.ability?.name}"\n` +
          `Habilidad de ${author}: "${postUserOfferedSkill.ability?.name}"\n\n` +
          `Tu solicitud está pendiente de aprobación.`
      );
    } catch (error) {
      console.error("Error al solicitar match:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo enviar la solicitud de match"
      );
    } finally {
      setIsRequestingMatch(false);
    }
  };

  return (
    <div className="rounded-lg p-4 bg-background border mb-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center mb-3">
          <Avatar className="mr-2 h-10 w-10">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`}
            />
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
          <div>
            <Link href={`/profiles/${id}`}>
              <Text className="font-semibold hover:underline cursor-pointer">
                {author}
              </Text>
            </Link>{" "}
            <Text className="text-xs text-muted-foreground">
              {formatTimeAgo(createdAt)}
            </Text>
          </div>
        </div>

        {canDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar publicación
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>{" "}
      <Link href={`/posts/${postId}`}>
        <Text className="text-lg font-semibold mb-1 hover:underline">
          {title}
        </Text>
      </Link>
      <Text className="mb-3">{description}</Text>
      {/* Mostrar información de la habilidad */}
      {skillName && (
        <div className="mb-3 p-2 bg-secondary/10 rounded-lg border border-secondary/20">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Habilidad:</span>
            <span className="text-sm text-foreground">{skillName}</span>
          </div>
        </div>
      )}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap mb-3">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs mr-2 mb-2"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex justify-between mt-4">
        <div className="flex items-center space-x-2">
          {user && user.id !== id && (
            <>
              {/* Botón de Hacer Match */}
              {!existingMatch.exists ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestMatch}
                  disabled={isRequestingMatch}
                  className="border-blue-600 text-blue-500 hover:bg-blue-950/50 hover:text-blue-400"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isRequestingMatch ? "Enviando..." : "Hacer Match"}
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Match solicitado
                </Button>
              )}

              {/* Botón de QuickSchedule o Sesión programada */}
              {hasScheduledSession ? (
                <Button variant="outline" size="sm" disabled>
                  <Calendar className="h-4 w-4 mr-2" />
                  Sesión programada
                </Button>
              ) : (
                id !== undefined && (
                  <QuickSchedule
                    userId={id}
                    postId={postId || 0}
                    postAuthor={author}
                  />
                )
              )}
            </>
          )}
        </div>
      </div>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              esta publicación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeletePost();
              }}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FeedCard;
