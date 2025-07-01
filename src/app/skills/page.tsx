"use client";

import { useState, useEffect } from "react";
import { Text } from "@/components/text";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserSkillsList from "./_components/UserSkillsList";
import SkillSelector from "./_components/SkillSelector";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/AuthContext";
import useCurrentUserId from "@/hooks/useCurrentUserId";
import { Award, Star } from "lucide-react";

export default function SkillsPage() {
  const [activeTab, setActiveTab] = useState("mis-habilidades");
  const { isAuthenticated, user } = useAuth();
  const currentUserId = useCurrentUserId();

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <Text size="heading-3" className="text-white mb-2">
              Mis Habilidades
            </Text>
            <Text size="paragraph-base" className="text-gray-400">
              Administra las habilidades que ofreces y las que buscas aprender
            </Text>
          </div>
          <Button asChild variant="outline">
            <a href={`/profiles/${currentUserId}`}>Ver Mi Perfil</a>
          </Button>
        </div>

        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger
              value="mis-habilidades"
              className="flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              Mis Habilidades
            </TabsTrigger>
            <TabsTrigger
              value="agregar-habilidad"
              className="flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Agregar Habilidad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mis-habilidades" className="space-y-6">
            <UserSkillsList userId={currentUserId?.toString() || ""} />
          </TabsContent>

          <TabsContent value="agregar-habilidad">
            <SkillSelector userId={currentUserId?.toString() || ""} />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
