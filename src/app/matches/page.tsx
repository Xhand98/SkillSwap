"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatchesList from "./_components/MatchesList";
import PotentialMatches from "./_components/PotentialMatches";
import { debugLog } from "../../config/app-config";
import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import useCurrentUserId from "@/hooks/useCurrentUserId";

export default function Page() {
  // Usar nuestro hook personalizado para obtener el ID del usuario automáticamente
  const currentUserId = useCurrentUserId();
  const userId = currentUserId?.toString() || "4"; // Valor fallback si no hay usuario autenticado
  const [isLoading, setIsLoading] = useState(false);

  // No necesitamos efecto para cargar el ID ya que el hook se encarga de esto
  debugLog("Matches page - User ID:", userId);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-4 py-16">
  <h1 className="text-3xl font-bold mb-6">Matches</h1>

        <Tabs defaultValue="matches-actuales" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="matches-actuales">Mis Matches</TabsTrigger>
          </TabsList>{" "}
          <TabsContent value="matches-actuales">
            <MatchesList userId={userId} />
          </TabsContent>
          <TabsContent value="matches-potenciales">
            <PotentialMatches userId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
