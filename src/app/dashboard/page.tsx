"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { apiClient } from "@/lib/api-client";
import { PREVIEW_MODE, debugLog } from "@/config/app-config";
import { PreviewBanner } from "@/components/PreviewModeIndicator";
import { Text } from "@/components/text";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SessionNotifications } from "@/components/SessionNotifications";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Calendar,
  Users,
  BookOpen,
  BarChart3,
  Clock,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { UserIcon } from "lucide-react";

interface DashboardStats {
  totalMatches: number;
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  cancellationRate: number;
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalMatches: 0,
    totalSessions: 0,
    completedSessions: 0,
    pendingSessions: 0,
    cancellationRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        setError("Necesitas iniciar sesión para ver tu dashboard");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        debugLog("Fetching user stats for dashboard", { userId: user.id });

        // Obtener matches del usuario
        const matchesResponse = await apiClient.get(
          `/users/${user.id}/matches/`,
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
        debugLog("Matches data received", matchesData);

        // Para cada match, buscamos sus sesiones
        const sessionsPromises = matchesData.data?.map((match: any) =>
          apiClient.get(`/matches/${match.id}/sessions/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }).then((res) => res.json())
        ) || [];

        const sessionsArrays = await Promise.all(sessionsPromises);
        const allSessions = sessionsArrays.flatMap(sessionResponse => sessionResponse.data || []);
        debugLog("All sessions data", allSessions);

        // Calcular estadísticas
        const totalMatches = matchesData.data?.length || 0;
        const totalSessions = allSessions.length;
        const completedSessions = allSessions.filter(
          (s: any) => s.status === "completed"
        ).length;
        const pendingSessions = allSessions.filter(
          (s: any) => s.status === "scheduled" || s.status === "pending"
        ).length;
        const cancelledSessions = allSessions.filter(
          (s: any) => s.status === "cancelled"
        ).length;
        const cancellationRate =
          totalSessions > 0
            ? Math.round((cancelledSessions / totalSessions) * 100)
            : 0;

        debugLog("Calculated stats", {
          totalMatches,
          totalSessions,
          completedSessions,
          pendingSessions,
          cancellationRate
        });

        setStats({
          totalMatches,
          totalSessions,
          completedSessions,
          pendingSessions,
          cancellationRate,
        });
      } catch (err) {
        console.error("Error fetching user stats:", err);
        setError("Error al cargar las estadísticas");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserStats();
    }
  }, [isAuthenticated, user]);

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
                Inicia sesión para ver tu panel de control
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
      <PreviewBanner />
      <div className="mb-8">
        <Text size="heading-3">Panel de Control</Text>
        <Text className="text-gray-500 mt-1">
          Bienvenido, {user?.nombre_usuario}. Aquí puedes ver un resumen de tu
          actividad.
          {PREVIEW_MODE && (
            <span className="block text-yellow-600 font-medium mt-1">
              📊 Mostrando datos de demostración
            </span>
          )}
        </Text>
      </div>
      {isLoading && (
        <div className="text-center py-10">Cargando estadísticas...</div>
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
      {!isLoading && !error && (
        <div className="grid gap-6">
          {/* Estadísticas de actividad */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Matches
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Text className="text-2xl font-bold">{stats.totalMatches}</Text>
                <Text className="text-xs text-muted-foreground">
                  Conexiones con otros usuarios
                </Text>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Sesiones totales
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Text className="text-2xl font-bold">
                  {stats.totalSessions}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Sesiones programadas en total
                </Text>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Sesiones completadas
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Text className="text-2xl font-bold">
                  {stats.completedSessions}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Intercambios de conocimiento exitosos
                </Text>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Tasa de cancelación
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Text className="text-2xl font-bold">
                  {stats.cancellationRate}%
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Porcentaje de sesiones canceladas
                </Text>
              </CardContent>
            </Card>
          </div>

          {/* Próximas sesiones y actividad reciente */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Sesiones</CardTitle>
                  <CardDescription>
                    {stats.pendingSessions === 0
                      ? "No tienes sesiones programadas"
                      : `Tienes ${stats.pendingSessions} ${
                          stats.pendingSessions === 1
                            ? "sesión programada"
                            : "sesiones programadas"
                        }`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.pendingSessions > 0 ? (
                    <div className="space-y-8">
                      <SessionNotifications
                        onlyShowUpcoming={true}
                        maxDisplayCount={3}
                      />

                      <div className="flex justify-center">
                        <Button asChild>
                          <Link href="/sessions">Ver todas mis sesiones</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <Text className="mb-2">
                        No tienes sesiones programadas actualmente
                      </Text>
                      <Button asChild className="mt-2">
                        <Link href="/feed">Explorar oportunidades</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                  <CardDescription>Gestiona tu actividad</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full justify-start">
                    <Link href="/feed">
                      <Zap className="mr-2 h-4 w-4" />
                      Explorar Feed
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/matches">
                      <Users className="mr-2 h-4 w-4" />
                      Ver mis Matches
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/sessions">
                      <Calendar className="mr-2 h-4 w-4" />
                      Gestionar Sesiones
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href={`/profiles/${user?.id}`}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      Editar mi Perfil
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
