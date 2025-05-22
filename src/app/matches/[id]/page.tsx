"use client";

import { useState, useEffect } from "react";
import { Text } from "@/components/text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PotentialMatches from "../_components/PotentialMatches.real";
import React from "react";
// Importamos la versión que utiliza la API real
import MatchesList from "../_components/MatchesList.real";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MatchesPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const userId = resolvedParams.id;

  console.log("MatchesPage renderizándose con userId:", userId);

  const [activeTab, setActiveTab] = useState("matches-actuales");
  const [isLoading, setIsLoading] = useState(true);

  // Efecto para simular un tiempo de carga y asegurar que los componentes tengan tiempo para renderizar
  useEffect(() => {
    console.log("Iniciando carga de la página de matches...");
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log("Página de matches lista para mostrar contenido");
    }, 500); // Aumentado a 500ms para dar más tiempo

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container px-4 py-16 max-w-5xl min-h-screen">
      <div className="mb-8">
        <Text size="heading-3" className="text-white mb-2">
          Mis Matches
        </Text>
        <Text size="paragraph-base" className="text-gray-400">
          Gestiona tus conexiones y encuentra nuevos matches basados en tus
          habilidades
        </Text>
      </div>
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="matches-actuales">Mis Matches</TabsTrigger>
          <TabsTrigger value="matches-potenciales">
            Matches Potenciales
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="py-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <Text size="paragraph-base" className="text-gray-400">
              Cargando matches...
            </Text>
          </div>
        ) : (
          <>
            <TabsContent value="matches-actuales" className="space-y-6">
              <MatchesList userId={userId} />
            </TabsContent>

            <TabsContent value="matches-potenciales">
              <PotentialMatches userId={userId} />
            </TabsContent>
          </>
        )}
      </Tabs>{" "}
      {/* Panel para depuración - se puede quitar en producción */}
      {/* <div className="mt-8 border-t border-gray-800 pt-8">
        <details className="text-gray-400" open>
          <summary className="cursor-pointer hover:text-gray-300 transition-colors">
            Diagnóstico del Servidor (modo desarrollo)
          </summary>
          <div className="mt-4">
            <div className="p-4 bg-gray-800 rounded-md mb-4">
              <h3 className="font-medium text-gray-300 mb-2">Estado actual:</h3>
              <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                <li>
                  ID de usuario: <span className="text-blue-400">{userId}</span>
                </li>
                <li>
                  Pestaña activa:{" "}
                  <span className="text-blue-400">{activeTab}</span>
                </li>
                <li>
                  Estado de carga:{" "}
                  <span className="text-blue-400">
                    {isLoading ? "Cargando..." : "Completado"}
                  </span>
                </li>
              </ul>
            </div>
            {/* Importamos dinámicamente el panel de depuración
            {(() => {
              const DebugPanel = React.lazy(
                () => import("../_components/DebugPanel")
              );
              return (
                <React.Suspense fallback={<div>Cargando herramientas...</div>}>
                  <DebugPanel userId={userId} />
                </React.Suspense>
              );
            })()}
          </div>
        </details>
      </div> */}
    </div>
  );
}
