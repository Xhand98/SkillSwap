"use client";

import React, { useState, useEffect } from "react";
import ConversationsList from "@/components/Chat/ConversationsList";
import { User } from "lucide-react";

export default function MessagesPage() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // En una aplicación real, obtendrías el ID del usuario del contexto de autenticación
      // Por ahora, usaremos un valor fijo para pruebas
      const userId = localStorage.getItem("userId") || "1";
      setCurrentUserId(parseInt(userId));
      setIsLoading(false);
    } catch (err) {
      console.error("Error al obtener ID de usuario:", err);
      setError("No se pudo cargar la información del usuario");
      setIsLoading(false);
    }
  }, []);

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-[#1b1b1b] flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1b1b1b] py-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Centro de Mensajes
            </h1>
            <p className="text-gray-400">
              Conecta con otros usuarios y comparte conocimientos
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ConversationsList currentUserId={currentUserId} />
            </div>

            <div className="lg:col-span-1">
              <div className="bg-neutral-900 rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">
                  Consejos de Mensajería
                </h3>
                <div className="space-y-4 text-sm text-gray-300">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>
                      Sé respetuoso y profesional en todas tus conversaciones
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>
                      Responde de manera oportuna para mantener una buena
                      comunicación
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>
                      Comparte detalles específicos sobre tus habilidades e
                      intereses
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>
                      Coordina horarios y lugares para intercambios presenciales
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
