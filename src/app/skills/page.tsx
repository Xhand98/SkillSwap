"use client";

import { useState, useEffect } from "react";
import { Text } from "@/components/text";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserSkillsList from "./_components/UserSkillsList";
import SkillSelector from "./_components/SkillSelector";

export default function SkillsPage() {
  const [activeTab, setActiveTab] = useState("mis-habilidades");
  const userId = 1; // Hardcodeado por ahora - En una app real vendría de un contexto de autenticación

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <Text size="heading-3" className="text-white mb-2">
          Mis Habilidades
        </Text>
        <Text size="paragraph-base" className="text-gray-400">
          Administra las habilidades que ofreces y las que buscas aprender
        </Text>
      </div>

      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="mis-habilidades">Mis Habilidades</TabsTrigger>
          <TabsTrigger value="agregar-habilidad">Agregar Habilidad</TabsTrigger>
        </TabsList>

        <TabsContent value="mis-habilidades" className="space-y-6">
          <UserSkillsList userId={userId.toString()} />
        </TabsContent>

        <TabsContent value="agregar-habilidad">
          <SkillSelector userId={userId.toString()} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
