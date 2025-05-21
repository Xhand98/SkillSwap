"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Smile, Globe, Calendar } from "lucide-react";
import { Text } from "@/components/text";

interface Ability {
  id: number;
  name: string; // Cambiado de "nombre" a "name" para coincidir con el backend
}

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [selectedAbility, setSelectedAbility] = useState<number | null>(null);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [loading, setLoading] = useState(false);
  const [postType, setPostType] = useState<"Ofrezco" | "Busco">("Ofrezco");
  const [currentUser] = useState({
    id: 1, // ID del usuario logueado
    name: "Usuario", // Nombre del usuario logueado
  }); // Cargar habilidades disponibles
  useEffect(() => {
    const fetchAbilities = async () => {
      try {
        const response = await fetch("http://localhost:8000/abilities/");
        if (response.ok) {
          const data = await response.json();
          console.log("Habilidades recibidas:", data);

          // Verificamos que data.abilities existe y es un array
          if (data.abilities && Array.isArray(data.abilities)) {
            setAbilities(data.abilities);
          } else {
            console.error("Formato de respuesta inesperado:", data);
            // Si la respuesta tiene un formato diferente, intentamos adaptarnos
            if (Array.isArray(data)) {
              setAbilities(data);
            } else if (data && typeof data === "object") {
              // Intenta encontrar alguna propiedad que parezca un array de habilidades
              const possibleArrays = Object.values(data).filter((value) =>
                Array.isArray(value)
              );
              if (possibleArrays.length > 0) {
                setAbilities(possibleArrays[0] as Ability[]);
              }
            }
          }
        } else {
          console.error(
            "Error en la respuesta:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error cargando habilidades:", error);
      }
    };

    fetchAbilities();
  }, []);

  const handleSubmit = async () => {
    if (!content.trim() || !selectedAbility) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/posts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: currentUser.id,
          tipo_post: postType,
          habilidad_id: selectedAbility,
          descripcion: content,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Limpiar el formulario
      setContent("");
      setSelectedAbility(null);

      // Notificar que se ha creado un post
      onPostCreated();
    } catch (error) {
      console.error("Error al crear post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b border-gray-800 p-4">
      <div className="flex gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={`https://avatar.vercel.sh/${currentUser.name}`} />
          <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="mb-2">
            <div className="inline-flex rounded-full border border-gray-800 p-1">
              <Button
                variant={postType === "Ofrezco" ? "default" : "ghost"}
                size="sm"
                className={
                  postType === "Ofrezco"
                    ? "rounded-full"
                    : "rounded-full text-gray-400"
                }
                onClick={() => setPostType("Ofrezco")}
              >
                Ofrezco
              </Button>
              <Button
                variant={postType === "Busco" ? "default" : "ghost"}
                size="sm"
                className={
                  postType === "Busco"
                    ? "rounded-full"
                    : "rounded-full text-gray-400"
                }
                onClick={() => setPostType("Busco")}
              >
                Busco
              </Button>
            </div>
          </div>

          <textarea
            className="w-full bg-transparent text-lg text-white placeholder-gray-500 border-none focus:outline-none resize-none"
            placeholder={
              postType === "Ofrezco"
                ? "¿Qué habilidad quieres ofrecer?"
                : "¿Qué habilidad estás buscando?"
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />

          {abilities.length > 0 && (
            <div className="mb-3">
              <Text className="text-gray-400 mb-2" size="paragraph-sm">
                Selecciona una habilidad:
              </Text>
              <div className="flex flex-wrap gap-2">
                {abilities.map((ability) => (
                  <button
                    key={ability.id}
                    onClick={() =>
                      setSelectedAbility(
                        ability.id === selectedAbility ? null : ability.id
                      )
                    }
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedAbility === ability.id
                        ? "bg-primary/80 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {ability.name || "Sin nombre"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {abilities.length === 0 && (
            <div className="mb-3 text-gray-400">Cargando habilidades...</div>
          )}

          <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-800">
            <div className="flex gap-2 text-primary">
              <button className="p-2 rounded-full hover:bg-primary/10">
                <Image size={20} />
              </button>
              <button className="p-2 rounded-full hover:bg-primary/10">
                <Globe size={20} />
              </button>
              <button className="p-2 rounded-full hover:bg-primary/10">
                <Smile size={20} />
              </button>
              <button className="p-2 rounded-full hover:bg-primary/10">
                <Calendar size={20} />
              </button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || !selectedAbility || loading}
              className={`rounded-full ${
                !content.trim() || !selectedAbility
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {loading ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
