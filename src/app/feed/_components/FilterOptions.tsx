"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FilterOptionsProps {
  onFilterChange: (filters: {
    type: string | null;
    searchTerm: string | null;
    userId: number | null;
  }) => void;
  className?: string;
  currentUserId?: number | null;
}

export function FilterOptions({
  onFilterChange,
  className = "",
  currentUserId,
}: FilterOptionsProps) {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showMine, setShowMine] = useState<boolean>(false);

  const handleTypeChange = (type: string | null) => {
    const newType = activeType === type ? null : type;
    setActiveType(newType);
    onFilterChange({
      type: newType,
      searchTerm: searchTerm || null,
      userId: showMine && currentUserId ? currentUserId : null,
    });
  };

  const handleSearch = () => {
    onFilterChange({
      type: activeType,
      searchTerm: searchTerm || null,
      userId: showMine && currentUserId ? currentUserId : null,
    });
  };

  const handleClearFilters = () => {
    setActiveType(null);
    setSearchTerm("");
    setShowMine(false);
    onFilterChange({ type: null, searchTerm: null, userId: null });
  };

  const handleToggleMine = () => {
    const newShowMine = !showMine;
    setShowMine(newShowMine);
    onFilterChange({
      type: activeType,
      searchTerm: searchTerm || null,
      userId: newShowMine && currentUserId ? currentUserId : null,
    });
  };
  return (
    <div className={`p-4 border-b border-gray-800 ${className}`}>
      <div className="flex gap-2 mb-3">
        <Button
          variant={activeType === "OFREZCO" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleTypeChange("OFREZCO")}
        >
          Ofrezco
        </Button>
        <Button
          variant={activeType === "BUSCO" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleTypeChange("BUSCO")}
        >
          Busco
        </Button>
        {(activeType !== null || searchTerm || showMine) && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full ml-auto text-gray-400 hover:text-white"
            onClick={handleClearFilters}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por habilidad..."
          className="flex-1 bg-gray-900 border border-gray-800 rounded-full px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          variant="default"
          size="sm"
          className="rounded-full"
          onClick={handleSearch}
        >
          Buscar
        </Button>
      </div>

      {currentUserId && (
        <div className="flex items-center space-x-2">
          <Switch
            id="show-mine"
            checked={showMine}
            onCheckedChange={handleToggleMine}
          />
          <Label htmlFor="show-mine" className="text-sm text-gray-300">
            Mostrar solo mis publicaciones
          </Label>
        </div>
      )}
    </div>
  );
}
