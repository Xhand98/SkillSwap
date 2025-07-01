"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { API_CONFIG } from "@/lib/api-config";
import { Text } from "@/components/text";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Check,
  ArrowLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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

export default function SessionDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        setError("Necesitas iniciar sesión para ver esta sesión");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Obtener detalles de la sesión
        const sessionResponse = await fetch(
          `${API_CONFIG.API_URL}/sessions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );

        if (!sessionResponse.ok) {
          throw new Error(
            `Error ${sessionResponse.status}: ${sessionResponse.statusText}`
          );
        }

        const sessionData = await sessionResponse.json();

        // Verificar que el usuario tenga acceso a esta sesión
        if (
          sessionData.match.user_id_1 !== user.id &&
          sessionData.match.user_id_2 !== user.id &&
          user.rol !== "admin"
        ) {
          setError("No tienes permiso para ver esta sesión");
          setIsLoading(false);
          return;
        }

        setSession(sessionData);
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("Error al cargar los detalles de la sesión");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchSessionDetails();
    }
  }, [id, isAuthenticated, user]);

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
          <span className="bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Programada
          </span>
        );
      case "completed":
        return (
          <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Check className="h-4 w-4" />
            Completada
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Cancelada
          </span>
        );
      default:
        return (
          <span className="bg-gray-500/20 text-gray-500 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
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

  const handleUpdateStatus = async () => {
    if (!session || !newStatus) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_CONFIG.API_URL}/sessions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedSession = await response.json();
      setSession(updatedSession);
      setIsStatusDialogOpen(false);

      toast({
        title: "Estado actualizado",
        description: `La sesión ahora está ${
          newStatus === "completed"
            ? "completada"
            : newStatus === "cancelled"
            ? "cancelada"
            : "programada"
        }`,
      });
    } catch (error) {
      console.error("Error updating session status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la sesión",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!session) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_CONFIG.API_URL}/sessions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      setIsDeleteDialogOpen(false);

      toast({
        title: "Sesión eliminada",
        description: "La sesión ha sido eliminada correctamente",
      });

      // Redirigir a la página de sesiones
      router.push("/sessions");
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la sesión",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
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
                Inicia sesión para ver los detalles de la sesión
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
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/sessions" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mis Sesiones
          </Link>{" "}
        </Button>

        <Text size="heading-3">Detalles de la Sesión</Text>
      </div>

      {isLoading && (
        <div className="text-center py-10">
          Cargando detalles de la sesión...
        </div>
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

      {!isLoading && !error && session && (
        <Card>
          <CardHeader className="pb-2 space-y-4">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl">
                  {session.match.ability_1.name} ↔{" "}
                  {session.match.ability_2.name}
                </CardTitle>
                <Text className="text-gray-500 mt-1">
                  Intercambio de habilidades
                </Text>
              </div>
              <div>{getStatusBadge(session.status)}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 mt-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${session.match.user_1.nombre_usuario}`}
                    alt={session.match.user_1.nombre_usuario}
                  />
                  <AvatarFallback>
                    {session.match.user_1.nombre_usuario[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Text className="text-sm font-medium">
                    {session.match.user_1.nombre_usuario}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Comparte: {session.match.ability_1.name}
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${session.match.user_2.nombre_usuario}`}
                    alt={session.match.user_2.nombre_usuario}
                  />
                  <AvatarFallback>
                    {session.match.user_2.nombre_usuario[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Text className="text-sm font-medium">
                    {session.match.user_2.nombre_usuario}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Comparte: {session.match.ability_2.name}
                  </Text>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Fecha</div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                  <span>{formatDate(session.date_time)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Hora</div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-gray-500" />
                  <span>{formatTime(session.date_time)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Ubicación</div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                <span>{session.location}</span>
              </div>
            </div>

            {session.notes && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Notas</div>
                <div className="p-4 bg-gray-50 rounded-md">
                  <Text>{session.notes}</Text>
                </div>
              </div>
            )}

            <div className="pt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <div className="font-medium">Creada:</div>
                <div>
                  {new Date(session.created_at).toLocaleString("es-ES")}
                </div>
              </div>

              <div>
                <div className="font-medium">Última actualización:</div>
                <div>
                  {new Date(session.updated_at).toLocaleString("es-ES")}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between flex-wrap gap-4 pt-4">
            <div className="space-x-2">
              <Dialog
                open={isStatusDialogOpen}
                onOpenChange={setIsStatusDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Cambiar Estado</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Actualizar Estado de la Sesión</DialogTitle>
                    <DialogDescription>
                      Selecciona el nuevo estado para esta sesión
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Programada</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsStatusDialogOpen(false)}
                      disabled={isUpdating}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleUpdateStatus}
                      disabled={isUpdating || !newStatus}
                    >
                      {isUpdating ? "Actualizando..." : "Guardar Cambios"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {session.status !== "completed" && (
                <Link href={`/chat?matchId=${session.match_id}`}>
                  <Button variant="outline">Enviar Mensaje</Button>
                </Link>
              )}
            </div>

            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="destructive">Eliminar Sesión</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Eliminar Sesión</DialogTitle>
                  <DialogDescription>
                    ¿Estás seguro de que quieres eliminar esta sesión? Esta
                    acción no se puede deshacer.
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={isUpdating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDeleteSession}
                    variant="destructive"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Eliminando..." : "Eliminar Sesión"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
