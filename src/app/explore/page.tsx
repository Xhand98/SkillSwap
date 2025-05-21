"use client";

import { useState, useEffect } from "react";
import { Text } from "@/components/text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Ability {
  id: number;
  name: string;
  category: string;
  description: string;
}

export default function AllAbilitiesPage() {
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [filteredAbilities, setFilteredAbilities] = useState<Ability[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAbilities = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/abilities/");

        if (!response.ok) {
          throw new Error(`Error al cargar habilidades: ${response.status}`);
        }

        const data = await response.json();
        const abilitiesList = data.abilities || [];
        setAbilities(abilitiesList);
        setFilteredAbilities(abilitiesList);

        // Extraer categorías únicas
        const uniqueCategories = Array.from(
          new Set(abilitiesList.map((ability: Ability) => ability.category))
        ) as string[];
        setCategories(uniqueCategories);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAbilities();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAbilities(abilities);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = abilities.filter(
      (ability) =>
        ability.name.toLowerCase().includes(query) ||
        ability.category.toLowerCase().includes(query) ||
        ability.description.toLowerCase().includes(query)
    );

    setFilteredAbilities(filtered);
  }, [searchQuery, abilities]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <p className="text-gray-400 mt-4">Cargando habilidades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-gray-900 rounded-lg">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  // Agrupar habilidades por categoría
  const abilitiesByCategory: Record<string, Ability[]> = {};
  filteredAbilities.forEach((ability) => {
    if (!abilitiesByCategory[ability.category]) {
      abilitiesByCategory[ability.category] = [];
    }
    abilitiesByCategory[ability.category].push(ability);
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <Text size="heading-3" className="text-white mb-2">
          Explorar Habilidades
        </Text>
        <Text size="paragraph-base" className="text-gray-400">
          Descubre todas las habilidades disponibles en la plataforma
        </Text>
      </div>

      <div className="mb-8 relative">
        <div className="absolute left-3 top-2.5 text-gray-400">
          <Search size={20} />
        </div>
        <Input
          type="text"
          placeholder="Buscar habilidades..."
          className="pl-10 bg-gray-900 border-gray-800"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredAbilities.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-lg">
          <h3 className="text-xl text-gray-300 mb-2">
            No se encontraron resultados
          </h3>
          <p className="text-gray-400">
            No hay habilidades que coincidan con tu búsqueda: "{searchQuery}"
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.keys(abilitiesByCategory).map((category) => (
            <div key={category}>
              <h2 className="text-xl font-bold text-primary mb-4">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {abilitiesByCategory[category].map((ability) => (
                  <Card
                    key={ability.id}
                    className="bg-gray-900 border-gray-800 h-full"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{ability.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm">
                        {ability.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
