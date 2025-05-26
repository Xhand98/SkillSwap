"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG } from "@/lib/api-config";

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

export function NotificationBell() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_CONFIG.API_URL}/users/${user.id}/notifications`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Asegurarse de que data es un array
        const notificationsArray = Array.isArray(data) ? data : [];
        console.log("Notificaciones obtenidas:", notificationsArray.length);

        setNotifications(notificationsArray);
        setUnreadCount(
          notificationsArray.filter((n: Notification) => !n.leida).length
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast({
          title: "Error",
          description:
            "No se pudieron cargar las notificaciones. Intente más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
      // Configurar intervalo para verificar notificaciones cada minuto
      const intervalId = setInterval(fetchNotifications, 60000);
      return () => clearInterval(intervalId);
    }
  }, [user]);
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
        setUnreadCount((prev) => Math.max(0, prev - 1));
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

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Menos de un minuto
    if (diff < 60000) {
      return "ahora";
    }

    // Menos de una hora
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `hace ${minutes}m`;
    }

    // Menos de un día
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `hace ${hours}h`;
    }

    // Menos de 7 días
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `hace ${days}d`;
    }

    // Más de 7 días
    return date.toLocaleDateString("es-ES");
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-4 py-3 border-b">
          <div className="font-semibold">Notificaciones</div>
          <div className="text-sm text-gray-500">
            {unreadCount > 0
              ? `${unreadCount} ${
                  unreadCount === 1
                    ? "nueva notificación"
                    : "nuevas notificaciones"
                }`
              : "No hay notificaciones nuevas"}
          </div>
        </div>

        {isLoading && (
          <div className="py-6 text-center text-sm text-gray-500">
            Cargando notificaciones...
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="py-6 text-center text-sm text-gray-500">
            No tienes notificaciones
          </div>
        )}

        {!isLoading &&
          notifications.slice(0, 5).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`py-3 px-4 hover:bg-gray-100 cursor-pointer ${
                !notification.leida ? "bg-blue-50" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{notification.titulo}</div>
                  <div className="text-xs text-gray-500">
                    {formatNotificationTime(notification.fecha_creacion)}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {notification.contenido}
                </div>
              </div>
            </DropdownMenuItem>
          ))}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/notifications"
                className="w-full text-center py-2 text-blue-600 hover:text-blue-700"
              >
                Ver todas las notificaciones
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
