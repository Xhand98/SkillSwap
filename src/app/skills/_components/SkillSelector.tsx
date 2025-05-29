"use client";

import { useState, useEffect } from "react";
import { API_CONFIG } from "@/lib/api-config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/text";
import { Briefcase, Star, AlertTriangle } from "lucide-react";
import { DatabaseStatus } from "@/components/database-status";
import { useToast, showDatabaseToast } from "@/components/toast-provider";

interface Ability {
  id: number;
  name: string;
  category: string;
  description: string;
}

interface SkillSelectorProps {
  userId: string;
}

export default function SkillSelector({ userId }: SkillSelectorProps) {
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [selectedAbilityId, setSelectedAbilityId] = useState<string>("");
  const [skillType, setSkillType] = useState<string>("Ofrece");
  const [proficiencyLevel, setProficiencyLevel] =
    useState<string>("Principiante");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  //   const { addToast } = useToast();
  //   const dbToast = showDatabaseToast(addToast);
  useEffect(() => {
    const fetchAbilities = async () => {
      try {
        setLoading(true);
        // dbToast.loading("Conectando con la base de datos...");

        const response = await fetch(`${API_CONFIG.API_URL}/abilities/`);

        if (!response.ok) {
          throw new Error(`Error al cargar habilidades: ${response.status}`);
        }

        const data = await response.json();
        const abilitiesList = data.abilities || [];
        setAbilities(abilitiesList);

        // dbToast.success(
        //   `${abilitiesList.length} habilidades cargadas desde la base de datos`
        // );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        // dbToast.error(`Error al cargar habilidades: ${errorMessage}`);
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAbilities();
  }, []);

  const handleAddSkill = async () => {
    if (!selectedAbilityId) {
      setError("Por favor selecciona una habilidad");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      //   dbToast.loading("Guardando habilidad en la base de datos...");

      const response = await fetch(`${API_CONFIG.API_URL}/userabilities/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          ability_id: parseInt(selectedAbilityId),
          skill_type: skillType,
          proficiency_level: proficiencyLevel,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al agregar habilidad: ${response.status}`);
      }

      // Éxito
      const selectedAbility = abilities.find(
        (a) => a.id === parseInt(selectedAbilityId)
      );
      setSuccess("¡Habilidad guardada en la base de datos correctamente!");
      //   dbToast.success(
      //     `Habilidad "${selectedAbility?.name}" agregada exitosamente`
      //   );

      // Reset form
      setSelectedAbilityId("");
      setProficiencyLevel("Principiante");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      //   dbToast.error(`Error al guardar: ${errorMessage}`);
      console.error("Error:", err);
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Agregar Nueva Habilidad</CardTitle>
              <CardDescription>
                Selecciona una habilidad que ofreces o buscas aprender
              </CardDescription>
            </div>
            <DatabaseStatus />
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
            <p className="text-gray-400 mt-4">
              Cargando habilidades desde la base de datos...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Agregar Nueva Habilidad</CardTitle>
            <CardDescription>
              Selecciona una habilidad que ofreces o buscas aprender
            </CardDescription>
          </div>
          <DatabaseStatus />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-900/20 text-red-400 p-3 rounded-md flex items-start gap-2">
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-900/20 text-green-400 p-3 rounded-md">
            {success}
          </div>
        )}{" "}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="ability">Habilidad</Label>
            <span className="text-xs text-green-400">
              {abilities.length} disponibles desde la BD
            </span>
          </div>
          <Select
            value={selectedAbilityId}
            onValueChange={setSelectedAbilityId}
          >
            <SelectTrigger id="ability">
              <SelectValue placeholder="Selecciona una habilidad" />
            </SelectTrigger>
            <SelectContent>
              {abilities.length > 0 ? (
                abilities.map((ability) => (
                  <SelectItem key={ability.id} value={ability.id.toString()}>
                    {ability.name} - {ability.category}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No hay habilidades disponibles
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tipo de Habilidad</Label>
          <RadioGroup
            value={skillType}
            onValueChange={setSkillType}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Ofrece" id="ofrece" />
              <Label htmlFor="ofrece" className="flex items-center gap-1">
                <Briefcase size={16} className="text-green-400" />
                <span>La ofrezco</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Busca" id="busca" />
              <Label htmlFor="busca" className="flex items-center gap-1">
                <Star size={16} className="text-blue-400" />
                <span>La busco</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">
            Nivel de {skillType === "Ofrece" ? "Experiencia" : "Interés"}
          </Label>
          <Select value={proficiencyLevel} onValueChange={setProficiencyLevel}>
            <SelectTrigger id="level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Principiante">Principiante</SelectItem>
              <SelectItem value="Intermedio">Intermedio</SelectItem>
              <SelectItem value="Avanzado">Avanzado</SelectItem>
              <SelectItem value="Experto">Experto</SelectItem>
            </SelectContent>
          </Select>
        </div>{" "}
        <Button
          className="w-full"
          onClick={handleAddSkill}
          disabled={submitting || !selectedAbilityId}
        >
          {submitting ? "Guardando en base de datos..." : "Agregar Habilidad"}
        </Button>
      </CardContent>
    </Card>
  );
}
