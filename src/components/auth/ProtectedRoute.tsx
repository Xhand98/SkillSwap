"use client";

import { useAuth } from "@/lib/AuthContext";
import useCurrentUserId from "@/hooks/useCurrentUserId";
import { AuthService } from "@/lib/AuthService";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const currentUserId = useCurrentUserId();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    // Definimos un tiempo de espera para el userId en caso de que esté tardando
    let userIdTimeout: NodeJS.Timeout;

    // Si ya no está cargando, verificamos la autenticación
    if (!isLoading) {
      // Si no está autenticado según el contexto de Auth, redirigimos
      if (!isAuthenticated) {
        console.log(
          "Acceso no autorizado - Redirigiendo a login (no autenticado)"
        );

        // Guardar la ruta actual para redirigir después del login
        localStorage.setItem("redirectAfterLogin", pathname);

        // Redirigir al login
        router.push("/login");
        return;
      }

      // Si está autenticado pero no tenemos userId, esperamos un poco
      if (!currentUserId) {
        console.log("Autenticado pero esperando userId...");

        // Damos un pequeño tiempo para que se cargue el userId
        userIdTimeout = setTimeout(() => {
          const idFromStorage = AuthService.getCurrentUserId();

          if (!idFromStorage) {
            console.log(
              "No se pudo obtener userId después de esperar - Redirigiendo a login"
            );
            localStorage.setItem("redirectAfterLogin", pathname);
            router.push("/login");
          } else {
            console.log("UserId obtenido después de espera:", idFromStorage);
            setIsReady(true);
          }
        }, 1000);
      } else {
        // Si tenemos userId y estamos autenticados, todo bien
        console.log("Usuario autenticado con ID:", currentUserId);
        setIsReady(true);
      }
    }

    return () => {
      if (userIdTimeout) clearTimeout(userIdTimeout);
    };
  }, [isAuthenticated, isLoading, currentUserId, router, pathname]);

  // Muestra un indicador de carga mientras se verifica la autenticación
  if (isLoading || !isReady) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            Verificando autenticación...
          </p>
        </div>
      </div>
    );
  }

  // Si está autenticado y tenemos el ID del usuario, muestra el contenido de la página
  return <>{children}</>;
}
