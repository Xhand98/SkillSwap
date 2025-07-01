"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, Search, Plus, Wifi, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import useWebSocketV2, { WebSocketMessage } from "@/hooks/useWebSocketV2";

interface ConversationWithLastMessage {
  id: number;
  user1_id: number;
  user2_id: number;
  title: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  last_message_content?: string;
  last_message_time: string;
  unread_count: number;
}

interface ConversationsListProps {
  currentUserId: number;
}

export default function ConversationsList({
  currentUserId,
}: ConversationsListProps) {
  const router = useRouter();

  const [conversations, setConversations] = useState<
    ConversationWithLastMessage[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Usar el nuevo hook mejorado con mejor manejo de errores
  const {
    isConnected,
    isReconnecting,
    connectionError,
    isWebSocketEnabled,
    toggleWebSocket,
    reconnect,
    sendMessage,
  } = useWebSocketV2({
    userId: currentUserId,
    onMessage: handleWebSocketMessage,
    // Configuración de reconexión más robusta
    autoReconnect: true,
    reconnectDelay: 2000,
    maxReconnectAttempts: 5,
  });

  // Función para manejar mensajes recibidos por WebSocket
  function handleWebSocketMessage(message: WebSocketMessage) {
    console.log("Mensaje WebSocket recibido:", message);

    // Procesar mensajes de conversaciones
    if (
      message.type === "new_message" ||
      message.type === "conversation_updated"
    ) {
      // Actualizar la lista de conversaciones cuando hay un nuevo mensaje
      fetchConversations();
    }
  }

  // Función para obtener las conversaciones del usuario
  const fetchConversations = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/users/${currentUserId}/conversations`
      );
      if (response.ok) {
        const data = await response.json();
        setConversations(data || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear la fecha del último mensaje
  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours =
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 días
      return date.toLocaleDateString("es-ES", {
        weekday: "short",
      });
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  // Función para obtener el título de la conversación
  const getConversationTitle = (conversation: ConversationWithLastMessage) => {
    if (conversation.title) {
      return conversation.title;
    }
    // Si no hay título, mostrar información de los participantes
    const otherUserId =
      conversation.user1_id === currentUserId
        ? conversation.user2_id
        : conversation.user1_id;
    return `Usuario ${otherUserId}`;
  };

  // Función para navegar a una conversación
  const openConversation = (conversationId: number) => {
    router.push(`/messages/${conversationId}`);
  };

  // Función para navegar a nueva conversación
  const startNewConversation = () => {
    router.push("/messages/new");
  };

  // Filtrar conversaciones basado en el término de búsqueda
  const filteredConversations = conversations.filter(
    (conversation) =>
      getConversationTitle(conversation)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      conversation.last_message_content
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    fetchConversations();
    // Ya no necesitamos polling - WebSocket maneja las actualizaciones en tiempo real
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#1b1b1b] rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        {" "}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-200 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
              Mensajes
            </h2>{" "}
            {/* Indicador de estado de WebSocket */}
            <div className="ml-2 flex items-center">
              <div
                title={
                  isConnected
                    ? "Conectado"
                    : isReconnecting
                    ? "Reconectando..."
                    : "Sin conexión en tiempo real"
                }
                className="flex items-center cursor-help"
                onClick={() => router.push("/debug/websocket")}
              >
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-gray-500" />
                )}
                <span className="ml-1 text-xs text-gray-500">
                  {isConnected
                    ? "Tiempo real"
                    : isReconnecting
                    ? "Reconectando..."
                    : connectionError
                    ? "Error: " + connectionError
                    : "Sin tiempo real"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={startNewConversation}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            title="Nueva conversación"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="max-h-96 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {conversations.length === 0 ? (
              <>
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">
                  No tienes conversaciones
                </p>
                <p className="text-sm">¡Comienza tu primera conversación!</p>
                <button
                  onClick={startNewConversation}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Nueva conversación
                </button>
              </>
            ) : (
              <p>
                No se encontraron conversaciones que coincidan con tu búsqueda.
              </p>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => openConversation(conversation.id)}
              className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-400 truncate">
                      {getConversationTitle(conversation)}
                    </h3>
                    <div className="flex items-center ml-2">
                      <span className="text-xs text-gray-500">
                        {formatLastMessageTime(conversation.last_message_time)}
                      </span>
                      {conversation.unread_count > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full min-w-[20px]">
                          {conversation.unread_count > 99
                            ? "99+"
                            : conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                  {conversation.last_message_content && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conversation.last_message_content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
