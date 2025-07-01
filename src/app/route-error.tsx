"use client";

import { Container } from "@/components/container";
import { Text } from "@/components/text";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";

export default function RouteErrorPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setMessage("Debes iniciar sesión para acceder a esta página");
      } else {
        setMessage(
          "La página que buscas no existe o no tienes permisos para acceder"
        );
      }
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <Container className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <Text as="p">Verificando acceso...</Text>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] py-12">
      <div className="text-center max-w-lg">
        <Text as="h1" size="heading-3" className="mb-6 text-primary">
          Acceso Restringido
        </Text>
        <Text as="p" size="paragraph-base" className="mb-8">
          {message}
        </Text>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isAuthenticated ? (
            <>
              <Button asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register">Registrarse</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/">Volver al Inicio</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/feed">Ir al Feed</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
