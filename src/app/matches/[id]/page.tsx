"use client";

import { useState } from "react";
import { Text } from "@/components/text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatchesList from "../_components/MatchesList";
import PotentialMatches from "../_components/PotentialMatches";

interface PageProps {
  params: {
    id: string; // URL param based on the folder [id]
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

export default function MatchesPage({ params }: PageProps) {
  const userId = params.id; // ✅ Safe for now in Client Components

  const [activeTab, setActiveTab] = useState("matches-actuales");

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
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
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="matches-actuales">Mis Matches</TabsTrigger>
          <TabsTrigger value="matches-potenciales">
            Matches Potenciales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches-actuales" className="space-y-6">
          <MatchesList userId={userId} />
        </TabsContent>

        <TabsContent value="matches-potenciales">
          <PotentialMatches userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
