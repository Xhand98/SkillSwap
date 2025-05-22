"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatchesListMock from "./_components/MatchesList";
import MatchesListReal from "./_components/MatchesList.real";
import PotentialMatchesMock from "./_components/PotentialMatches";
import PotentialMatchesReal from "./_components/PotentialMatches.real";
import { USE_REAL_API } from "./_components/config";
import { useState, useEffect } from "react";

export default function Page() {
  const [userId, setUserId] = useState("4"); // Valor inicial como fallback
  const [isLoading, setIsLoading] = useState(true);

  // Intentar obtener el ID del usuario de localStorage
  useEffect(() => {
    try {
      const storedUserId = localStorage.getItem("currentUserId");
      if (storedUserId) {
        setUserId(storedUserId);
      }
      console.log("Matches page - User ID:", storedUserId || userId);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Matches</h1>

      {/* Mostrar ID de usuario para depuración */}
      <p className="text-sm text-gray-500 mb-4">ID de usuario: {userId}</p>

      <Tabs defaultValue="matches-actuales" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="matches-actuales">Mis Matches</TabsTrigger>
          <TabsTrigger value="matches-potenciales">
            Matches Potenciales
          </TabsTrigger>
        </TabsList>{" "}
        <TabsContent value="matches-actuales">
          {USE_REAL_API ? (
            <MatchesListReal userId={userId} />
          ) : (
            <MatchesListMock userId={userId} />
          )}
        </TabsContent>
        <TabsContent value="matches-potenciales">
          {USE_REAL_API ? (
            <PotentialMatchesReal userId={userId} />
          ) : (
            <PotentialMatchesMock userId={userId} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
