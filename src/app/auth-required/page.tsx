"use client";

import { Container } from "@/components/container";
import { Text } from "@/components/text";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import useCurrentUserId from "@/hooks/useCurrentUserId";
import { redirect } from "next/navigation";
import RouteErrorPage from "../route-error";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AuthRequiredPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const currentUserId = useCurrentUserId();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Ejemplo de cómo usar currentUserId para obtener datos de perfil
    if (currentUserId) {
      // En una aplicación real, aquí se haría una llamada a la API
      console.log("Cargando datos del usuario con ID:", currentUserId);

      // Simular carga de datos
      setTimeout(() => {
        setUserData({
          id: currentUserId,
          nombre_completo: user?.primer_nombre + " " + user?.primer_apellido,
          correo: user?.correo_electronico,
          ciudad: user?.ciudad_trabajo || "No especificada",
        });
      }, 500);
    }
  }, [currentUserId, user]);

  if (!isLoading && !isAuthenticated) {
    return <RouteErrorPage />;
  }

  return (
    <ProtectedRoute>
      <Container className="py-12">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <Text as="h1" size="heading-3" className="mb-6">
            Área Protegida - Solo para usuarios autenticados
          </Text>

          {userData ? (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <Text as="h2" size="heading-4" className="mb-2 text-purple-700">
                  Datos del Usuario Autenticado
                </Text>
                <ul className="space-y-2">
                  <li>
                    <strong>ID de Usuario:</strong> {userData.id}
                  </li>
                  <li>
                    <strong>Nombre:</strong> {userData.nombre_completo}
                  </li>
                  <li>
                    <strong>Correo:</strong> {userData.correo}
                  </li>
                  <li>
                    <strong>Ciudad:</strong> {userData.ciudad}
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <Text as="p" className="text-blue-700">
                  Esta página utiliza el hook <code>useCurrentUserId</code> para
                  obtener el ID del usuario actual desde caché y mantenerlo
                  sincronizado con los cambios de autenticación.
                </Text>
              </div>

              <div className="flex space-x-4 mt-6">
                <Link href="/feed">
                  <Button>Ir al Feed</Button>
                </Link>
                <Link href={`/profiles/${currentUserId}`}>
                  <Button variant="outline">Ver mi perfil</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <span className="ml-3">Cargando datos de usuario...</span>
            </div>
          )}
        </div>
      </Container>
    </ProtectedRoute>
  );
}
