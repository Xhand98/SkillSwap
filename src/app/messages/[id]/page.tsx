"use client";

import React from "react";
import { useParams } from "next/navigation";
import ChatPage from "@/components/Chat/ChatPage";
import { User } from "lucide-react";
import useCurrentUserId from "@/hooks/useCurrentUserId";

export default function ConversationPage() {
  const params = useParams();
  const currentUserId = useCurrentUserId();
  const conversationId = params?.id ? parseInt(params.id as string) : null;

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
