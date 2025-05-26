"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { API_CONFIG } from "@/lib/api-config";
import { Text } from "@/components/text";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Bell, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: number;
  usuario_id: number;
  tipo: string;
  titulo: string;
  contenido: string;
  referencia_id: number;
  fecha_creacion: string;
  leida: boolean;
  fecha_lectura: string | null;
}

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        setError("Necesitas iniciar sesión para ver tus notificaciones");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_CONFIG.API_URL}/users/${user.id}/notifications`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Error al cargar las notificaciones");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.leida) {
      try {
        const response = await fetch(
          `${API_CONFIG.API_URL}/notifications/${notification.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: JSON.stringify({ leida: true }),
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        // Actualizar estado local
        setNotifications((prevNotifications) =>
          prevNotifications.map((n) =>
            n.id === notification.id ? { ...n, leida: true } : n
          )
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Gestionar la navegación según el tipo de notificación
    if (
      notification.tipo === "session_reminder" &&
      notification.referencia_id
    ) {
      window.location.href = `/sessions/${notification.referencia_id}`;
    } else if (
      notification.tipo === "match_created" &&
      notification.referencia_id
    ) {
      window.location.href = `/matches/${notification.referencia_id}`;
    }
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Agrupar notificaciones por fecha (hoy, ayer, esta semana, anteriores)
  const groupNotifications = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

    const groups: { [key: string]: Notification[] } = {
      today: [],
      yesterday: [],
      thisWeek: [],
      earlier: [],
    };

    notifications.forEach((notification) => {
      const notifDate = new Date(notification.fecha_creacion);
      notifDate.setHours(0, 0, 0, 0);

      if (notifDate.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (notifDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else if (notifDate > thisWeekStart) {
        groups.thisWeek.push(notification);
      } else {
        groups.earlier.push(notification);
      }
    });

    return groups;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "session_reminder":
        return <Calendar className="h-6 w-6 text-blue-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
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
                Inicia sesión para ver tus notificaciones
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

  const groupedNotifications = groupNotifications();

  return (
    <div className="container mx-auto p-6">
      <Text size="heading-3" className="mb-6">
        Mis Notificaciones
      </Text>

      {isLoading && (
        <div className="text-center py-10">Cargando notificaciones...</div>
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

      {!isLoading && !error && notifications.length === 0 && (
        <Card className="mb-4 border-gray-200 bg-gray-50">
          <CardContent className="pt-6 text-center py-10">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <Text size="heading-4" className="mb-2">
              No tienes notificaciones
            </Text>
            <Text className="text-gray-500">
              Las notificaciones sobre sesiones y matches aparecerán aquí
            </Text>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && notifications.length > 0 && (
        <div className="space-y-8">
          {groupedNotifications.today.length > 0 && (
            <div>
              <Text size="heading-3" className="mb-4">
                Hoy
              </Text>
              <div className="space-y-3">
                {groupedNotifications.today.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer hover:border-blue-200 transition-colors ${
                      !notification.leida ? "border-blue-300 bg-blue-50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex gap-4">
                        <div className="mt-1">
                          {getNotificationIcon(notification.tipo)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <Text className="font-medium">
                              {notification.titulo}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              {new Date(
                                notification.fecha_creacion
                              ).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Text>
                          </div>
                          <Text className="text-gray-600">
                            {notification.contenido}
                          </Text>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {groupedNotifications.yesterday.length > 0 && (
            <div>
              <Text size="heading-3" className="mb-4">
                Ayer
              </Text>
              <div className="space-y-3">
                {groupedNotifications.yesterday.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer hover:border-blue-200 transition-colors ${
                      !notification.leida ? "border-blue-300 bg-blue-50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex gap-4">
                        <div className="mt-1">
                          {getNotificationIcon(notification.tipo)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <Text className="font-medium">
                              {notification.titulo}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              {new Date(
                                notification.fecha_creacion
                              ).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Text>
                          </div>
                          <Text className="text-gray-600">
                            {notification.contenido}
                          </Text>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {groupedNotifications.thisWeek.length > 0 && (
            <div>
              <Text size="heading-3" className="mb-4">
                Esta semana
              </Text>
              <div className="space-y-3">
                {groupedNotifications.thisWeek.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer hover:border-blue-200 transition-colors ${
                      !notification.leida ? "border-blue-300 bg-blue-50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex gap-4">
                        <div className="mt-1">
                          {getNotificationIcon(notification.tipo)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <Text className="font-medium">
                              {notification.titulo}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              {new Date(
                                notification.fecha_creacion
                              ).toLocaleDateString("es-ES", {
                                weekday: "long",
                              })}
                            </Text>
                          </div>
                          <Text className="text-gray-600">
                            {notification.contenido}
                          </Text>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {groupedNotifications.earlier.length > 0 && (
            <div>
              <Text size="heading-3" className="mb-4">
                Anteriores
              </Text>
              <div className="space-y-3">
                {groupedNotifications.earlier.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer hover:border-blue-200 transition-colors ${
                      !notification.leida ? "border-blue-300 bg-blue-50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex gap-4">
                        <div className="mt-1">
                          {getNotificationIcon(notification.tipo)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <Text className="font-medium">
                              {notification.titulo}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              {formatNotificationDate(
                                notification.fecha_creacion
                              )}
                            </Text>
                          </div>
                          <Text className="text-gray-600">
                            {notification.contenido}
                          </Text>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
