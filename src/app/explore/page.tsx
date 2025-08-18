"use client";

import { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import { API_CONFIG } from "@/lib/api-config";
import { Text } from "@/components/text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DatabaseStatus } from "@/components/database-status";

interface Ability {
  id: number;
  name: string;
  category: string;
  description: string;
}

export default function AllAbilitiesPage() {
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch abilities from API with abort support
  useEffect(() => {
    const controller = new AbortController();
    const fetchAbilities = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_CONFIG.API_URL}/abilities/`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Error al cargar habilidades: ${response.status}`);
        }

        const payload = await response.json();
        const abilitiesList: Ability[] = Array.isArray(payload)
          ? payload
          : (payload?.abilities as Ability[]) || [];
        setAbilities(abilitiesList);
      } catch (err) {
        if ((err as any)?.name === "AbortError") return; // ignore aborts
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error:", err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchAbilities();
    return () => controller.abort();
  }, []);

  // Smooth typing with deferred value
  const deferredQuery = useDeferredValue(searchQuery);

  // Derived: filtered by search
  const filteredAbilities = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return abilities;
    return abilities.filter((a) =>
      [a.name, a.category, a.description]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [abilities, deferredQuery]);
  // Small UI subcomponents
  const PageHeader = () => (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Text size="heading-3" className="text-white mb-2">
            Explorar Habilidades
          </Text>
          <Text size="paragraph-base" className="text-gray-400">
            Descubre todas las habilidades disponibles en la plataforma
          </Text>
        </div>
        <div className="ml-4 shrink-0 hidden sm:block">
        </div>
      </div>
    </div>
  );

  const LoadingState = () => (
    <div className="p-8 text-center bg-gray-900 rounded-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
      <h2 className="text-xl font-bold text-white mb-2">
        Cargando desde la base de datos...
      </h2>
      <p className="text-gray-400">Obteniendo habilidades del servidor</p>
    </div>
  );

  const ErrorState = ({ message }: { message: string }) => (
    <div className="p-8 text-center bg-gray-900 rounded-lg">
      <h2 className="text-xl font-bold text-red-500 mb-2">Error de conexión</h2>
      <p className="text-gray-300 mb-4">{message}</p>
      <p className="text-gray-400 text-sm">
        Verifica el estado de la base de datos arriba y refresca la página
      </p>
    </div>
  );

  const EmptyState = ({ query }: { query: string }) => (
    <div className="text-center py-12 bg-gray-900 rounded-lg">
      <h3 className="text-xl text-gray-300 mb-2">No se encontraron resultados</h3>
      <p className="text-gray-400">
        No hay habilidades que coincidan con tu búsqueda: "{query}"
      </p>
    </div>
  );

  const AbilityCard = ({ ability }: { ability: Ability }) => (
    <Card className="bg-gray-900 border-gray-800 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{ability.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400 text-sm">{ability.description}</p>
      </CardContent>
    </Card>
  );

  const onSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value),
    []
  );

  if (loading || error) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-5xl">
        <PageHeader />
        {loading ? <LoadingState /> : <ErrorState message={error ?? ""} />}
      </div>
    );
  }

  // Agrupar habilidades por categoría (memoized)
  const abilitiesByCategory = useMemo(() => {
    return filteredAbilities.reduce<Record<string, Ability[]>>((acc, ability) => {
      const cat = ability.category || "Otras";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(ability);
      return acc;
    }, {});
  }, [filteredAbilities]);

  const sortedCategories = useMemo(
    () => Object.keys(abilitiesByCategory).sort((a, b) => a.localeCompare(b)),
    [abilitiesByCategory]
  );
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <PageHeader />

      <div className="mb-8 relative">
        <div className="absolute left-3 top-2.5 text-gray-400">
          <Search size={20} />
        </div>
        <Input
          type="text"
          placeholder="Buscar habilidades..."
          className="pl-10 bg-gray-900 border-gray-800"
          value={searchQuery}
          onChange={onSearchChange}
          aria-label="Buscar habilidades"
        />
      </div>

      {filteredAbilities.length === 0 ? (
        <EmptyState query={searchQuery} />
      ) : (
        <div className="space-y-10">
          {sortedCategories.map((category) => (
            <section key={category} aria-label={`Categoría ${category}`}>
              <h2 className="text-xl font-bold text-primary mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {abilitiesByCategory[category].map((ability) => (
                  <AbilityCard key={ability.id} ability={ability} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
