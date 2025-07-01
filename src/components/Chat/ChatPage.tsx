"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, MoreVertical, Wifi, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import useSocketIO, { SocketIOMessage } from "@/hooks/useSocketIO";

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: number;
  user1_id: number;
  user2_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatPageProps {
  conversationId: number;
  currentUserId: number;
}

export default function ChatPage({
  conversationId,
  currentUserId,
}: ChatPageProps) {
  const router = useRouter();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [isNearBottom, setIsNearBottom] = useState(true);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Configurar WebSocket con variables de control para evitar bucles
  const joinedConversationRef = useRef(false);  const {
    isConnected,
    isReconnecting,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    connectionError,
    reconnect,
    isSocketIOEnabled,
    toggleSocketIO,
  } = useSocketIO({
    userId: currentUserId,
    onMessage: handleSocketIOMessage,
    onConnect: () => {
      if (!joinedConversationRef.current && isSocketIOEnabled) {
        joinConversation(conversationId);
        joinedConversationRef.current = true;
      }
    },
    onDisconnect: () => {
      // Al desconectar, marcamos que ya no estamos en la conversación
      joinedConversationRef.current = false;
    },
    onError: (error) => {
      // Error silencioso en producción
      console.error('Socket.IO error:', error);
    },
  });

  // Manejar mensajes Socket.IO
  function handleSocketIOMessage(message: SocketIOMessage) {
    switch (message.type) {
      case "new_message":
        // Solo actualizar si es un mensaje de esta conversación
        if (message.data.conversation_id === conversationId) {
          const newMsg: Message = {
            id: message.data.id,
            conversation_id: message.data.conversation_id,
            sender_id: message.data.sender_id,
            content: message.data.content,
            message_type: message.data.message_type || "text",
            is_read: false,
            created_at: message.data.created_at,
            updated_at: message.data.created_at,
          };
          setMessages((prevMessages) => {
            // Evitar duplicados de mensajes con ID positivo (del servidor)
            if (
              prevMessages.some((msg) => msg.id === newMsg.id && msg.id > 0)
            ) {
              return prevMessages;
            }

            // Si hay un mensaje temporal (ID negativo) que corresponde a este mensaje,
            // reemplazarlo en vez de agregar uno nuevo
            const tempIndex = prevMessages.findIndex(
              (msg) =>
                msg.id < 0 &&
                msg.content === newMsg.content &&
                msg.sender_id === newMsg.sender_id
            );

            if (tempIndex >= 0) {
              const updatedMessages = [...prevMessages];
              updatedMessages[tempIndex] = newMsg;
              return updatedMessages;
            }

            // Si no hay duplicado ni mensaje temporal, añadir el nuevo mensaje al inicio
            // ya que los mensajes del API están ordenados de más reciente a más antiguo
            return [newMsg, ...prevMessages];
          });
        }
        break;

      case "user_typing_start":
        if (
          message.data.conversation_id === conversationId.toString() &&
          message.data.user_id !== currentUserId
        ) {
          setTypingUsers((prev) => new Set([...prev, message.data.user_id]));
        }
        break;

      case "user_typing_stop":
        if (message.data.conversation_id === conversationId.toString()) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(message.data.user_id);
            return newSet;
          });
        }
        break;
      case "connection_established":
        // Conexión establecida con éxito
        break;

      default:
      // Tipo de mensaje no manejado
    }
  }

  // Función para obtener los mensajes de la conversación
  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/conversations/${conversationId}/messages`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        setMessages([]); // Establecer como array vacío en caso de error
      }
    } catch (error) {
      setMessages([]); // Establecer como array vacío en caso de error
    }
  };

  // Función para obtener los detalles de la conversación
  const fetchConversation = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/conversations/${conversationId}`
      );
      if (response.ok) {
        const data = await response.json();
        setConversation(data);
      }
    } catch (error) {
      // Error silencioso en producción
    }
  };
  // Función para enviar un mensaje
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    stopTyping(conversationId); // Detener indicador de escritura

    // Guardar el contenido del mensaje para usarlo después
    const messageContent = newMessage.trim();
    // Limpiar el input inmediatamente para mejor UX
    setNewMessage("");

    // Crear un ID temporal para el mensaje
    const tempId = -Date.now(); // ID negativo temporal para distinguirlo de IDs reales

    // Crear un mensaje temporal con el formato esperado
    const tempMessage: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: messageContent,
      message_type: "text",
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }; // Agregar el mensaje temporal al estado al inicio del array
    // ya que los mensajes del API están ordenados de más reciente a más antiguo
    setMessages((prevMessages) => [tempMessage, ...prevMessages]);

    // Forzar el scroll hacia abajo cuando el usuario envía un mensaje
    setIsNearBottom(true);

    try {
      const response = await fetch(
        `http://localhost:8000/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender_id: currentUserId,
            content: messageContent,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json(); // Reemplazar el mensaje temporal con el real (con ID del servidor)
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === tempId
              ? {
                  ...msg,
                  id: data.id,
                  created_at: data.created_at || msg.created_at,
                  updated_at: data.updated_at || msg.updated_at,
                }
              : msg
          )
        );
      } else {
        // Notificar al usuario que hubo un error
        alert("No se pudo enviar el mensaje. Inténtelo de nuevo.");

        // Remover el mensaje temporal en caso de error
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== tempId)
        );
      }
    } catch (error) {
      // Remover el mensaje temporal en caso de error
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== tempId)
      );
    } finally {
      setSending(false);
    }
  };

  // Función para marcar mensajes como leídos
  const markAsRead = async () => {
    try {
      await fetch(
        `http://localhost:8000/conversations/${conversationId}/read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: currentUserId,
          }),
        }
      );
    } catch (error) {
      // Error silencioso en producción
    }
  };
  // Función para formatear la fecha
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Manejar cambios en el input de mensaje para indicador de escritura
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Si el usuario está escribiendo, enviar indicador de escritura
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      startTyping(conversationId);
    }

    // Resetear timeout de escritura
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Detener indicador de escritura después de 2 segundos de inactividad
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping(conversationId);
      }
    }, 2000);
  };

  // Detener escritura cuando el usuario deja de escribir
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        stopTyping(conversationId);
      }
    };
  }, [conversationId, isTyping, stopTyping]); // Auto-scroll a los mensajes más recientes
  // Función mejorada para scroll automático solo cuando el usuario está cerca del fondo
  const scrollToBottom = () => {
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Detectar la posición del scroll para determinar si el usuario está cerca del fondo
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      // Considerar "cerca del fondo" si está a menos de 100px del fondo
      const isBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsNearBottom(isBottom);
    }
  };
  useEffect(() => {
    // Reiniciar el estado cuando cambia el usuario o la conversación
    setMessages([]);
    setConversation(null);
    joinedConversationRef.current = false;

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMessages(), fetchConversation()]);
      // Asegurarse de que al cargar los mensajes iniciales, siempre se desplace al fondo
      setIsNearBottom(true);
      setLoading(false);
    };

    loadData();
    markAsRead();

    // Si estamos conectados al WebSocket, unirse a la nueva conversación
    if (isConnected && isSocketIOEnabled) {
      joinConversation(conversationId);
      joinedConversationRef.current = true;
    }

    // Cuando el componente se desmonta o cambia de conversación/usuario, dejar la conversación
    return () => {
      if (joinedConversationRef.current) {
        leaveConversation(conversationId);
        joinedConversationRef.current = false;
      }
    };
  }, [conversationId, currentUserId]);
  // Efecto para añadir/eliminar el evento de scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Efecto para hacer scroll cuando cambian los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isNearBottom]);

  // Ya no necesitamos polling - WebSocket se encarga de las actualizaciones en tiempo real
  // Comentado: const interval = setInterval(fetchMessages, 3000);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-screen bg-[#1b1b1b]">
      {" "}
      {/* Header */}
      <div className="bg-[#242424] border-b border-[#333333] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {" "}
          <button
            onClick={() => router.back()}
            className="mr-3 p-2 rounded-full hover:bg-[#333333]"
          >
            <ArrowLeft className="h-5 w-5 text-gray-300" />
          </button>
          <div className="flex-1">
            <div className="flex items-center">
              {" "}
              <h1 className="text-lg font-semibold text-gray-100">
                {conversation?.title || "Conversación"}
              </h1>{" "}
              {/* Indicador de estado WebSocket */}{" "}
              <div className="ml-2 flex items-center">
                {!isSocketIOEnabled ? (
                  <div
                    title="Socket.IO desactivado"
                    className="flex items-center"
                  >
                    <WifiOff className="h-4 w-4 text-gray-500" />
                    <span className="ml-1 text-xs text-gray-500">
                      Desactivado
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSocketIO(true);
                      }}
                      className="ml-2 text-xs text-blue-500 hover:underline"
                      title="Activar WebSockets"
                    >
                      Activar
                    </button>
                  </div>
                ) : isConnected ? (
                  <div title="Conectado" className="flex items-center">
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="ml-1 text-xs text-green-500">
                      Conectado
                    </span>
                  </div>
                ) : isReconnecting ? (
                  <div className="flex items-center" title="Reconectando...">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-1" />
                    <span className="ml-1 text-xs text-yellow-500">
                      Reconectando...
                    </span>
                  </div>
                ) : (
                  <div title="Desconectado" className="flex items-center">
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="ml-1 text-xs text-red-500">
                      {connectionError ? "Error" : "Desconectado"}
                    </span>

                    <div className="flex ml-2 gap-2">
                      {/* Botón de reconexión */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          reconnect();
                        }}
                        className="text-xs text-blue-500 hover:underline"
                        title="Intentar reconectar"
                      >
                        Reconectar
                      </button>

                      {/* Opción de desactivar si hay errores persistentes */}
                      {connectionError && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSocketIO(false);
                          }}
                          className="text-xs text-gray-500 hover:underline"
                          title="Desactivar WebSockets temporalmente"
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500">
                {messages && messages.length} mensaje
                {messages && messages.length !== 1 ? "s" : ""}
              </p>
              {/* Indicador de usuarios escribiendo */}
              {typingUsers.size > 0 && (
                <p className="text-sm text-blue-500 animate-pulse">
                  {typingUsers.size === 1
                    ? "Escribiendo..."
                    : `${typingUsers.size} usuarios escribiendo...`}
                </p>
              )}
              {connectionError && (
                <p className="text-sm text-red-500">Error de conexión</p>
              )}
            </div>
          </div>
        </div>{" "}
        <button className="p-2 rounded-full hover:bg-[#333333]">
          <MoreVertical className="h-5 w-5 text-gray-300" />
        </button>
      </div>
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        onScroll={handleScroll}
      >
        {!messages || messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>No hay mensajes en esta conversación</p>
            <p className="text-sm">¡Envía el primer mensaje!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? "bg-blue-500 text-white"
                      : "bg-[#2a2a2a] text-gray-200 border border-[#333333]"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`text-xs ${
                        isOwnMessage ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </span>
                    {isOwnMessage && (
                      <span
                        className={`text-xs ${
                          message.is_read ? "text-blue-100" : "text-blue-200"
                        }`}
                      >
                        {message.is_read ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />{" "}
      </div>{" "}
      {/* Message Input */}
      <div className="bg-[#242424] border-t border-[#333333] px-4 py-3">
        <form onSubmit={sendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={handleMessageChange}
            placeholder={
              !isSocketIOEnabled
                ? "Socket.IO desactivado - Solo envío básico"
                : "Escribe un mensaje..."
            }
            className="flex-1 px-4 py-2 border border-[#444444] bg-[#333333] text-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending || (!isConnected && isSocketIOEnabled)}
          />
          <button
            type="submit"
            disabled={
              !newMessage.trim() ||
              sending ||
              (!isConnected && isSocketIOEnabled)
            }
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>

        {/* Mostrar estado de conexión en el input */}
        {!isSocketIOEnabled ? (
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              Socket.IO desactivado - Algunas funciones no estarán disponibles
            </p>
            <button
              onClick={() => toggleSocketIO(true)}
              className="text-xs text-blue-500 hover:underline"
            >
              Activar WebSockets
            </button>
          </div>
        ) : (
          !isConnected && (
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-red-500">
                {isReconnecting
                  ? "Reconectando..."
                  : "Sin conexión - Los mensajes no se enviarán"}
              </p>
              {connectionError && (
                <button
                  onClick={() => toggleSocketIO(false)}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Usar modo sin WebSockets
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
