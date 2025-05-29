"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ChatPage from "@/components/Chat/ChatPage";
import { User } from "lucide-react";

export default function ConversationPage() {
  const params = useParams();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const conversationId = params.id ? parseInt(params.id as string) : null;

  useEffect(() => {
    // En una aplicación real, obtendrías el ID del usuario del contexto de autenticación
    const userId = localStorage.getItem("userId") || "1";
    setCurrentUserId(parseInt(userId));
  }, []);

  if (!currentUserId || !conversationId) {
    return (
      <div className="min-h-screen bg-[#1b1b1b] flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">
            {!currentUserId
              ? "Cargando información del usuario..."
              : "ID de conversación inválido"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChatPage conversationId={conversationId} currentUserId={currentUserId} />
  );
}
