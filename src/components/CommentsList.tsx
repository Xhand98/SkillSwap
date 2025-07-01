// Componente para mostrar una lista de comentarios con autenticación integrada
import React, { useState, useEffect } from "react";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import { useComments } from "@/hooks/useComments";
import { useToastContext } from "@/contexts/ToastContext";
import { useSocketIO, SocketIOMessage } from "@/hooks/useSocketIO";
import LoadingSpinner from "./LoadingSpinner";
import { Wifi, WifiOff } from "lucide-react";

interface CommentsListProps {
  postId: number;
}

export const CommentsList: React.FC<CommentsListProps> = ({ postId }) => {
  const {
    comments,
    loading,
    error,
    pagination,
    fetchComments,
    createComment,
    deleteComment,
    voteComment,
    addCommentFromWebSocket,
  } = useComments(postId); // Hook para notificaciones
  const { showSuccess, showError } = useToastContext();

  // Estado para controlar la autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthenticated(!!token);

    // Decodificar el token para obtener el ID del usuario
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.user_id);
      } catch (error) {
        console.error("Error al decodificar token:", error);
        setIsAuthenticated(false);
        setCurrentUserId(null);
      }
    } else {
      setCurrentUserId(null);
    }
  }, []);  // Función para manejar mensajes Socket.IO
  const handleSocketIOMessage = (message: SocketIOMessage) => {
    if (message.type === "new_comment" && message.data.post_id === postId) {
      // Agregar nuevo comentario a la lista
      const newComment = {
        comentario_id: message.data.comentario_id,
        post_id: message.data.post_id,
        usuario_id: message.data.usuario_id,
        comentario_padre_id: message.data.comentario_padre_id,
        contenido: message.data.contenido,
        created_at: message.data.created_at,
        updated_at: message.data.updated_at,
        activo: message.data.activo,
        nombre_usuario: message.data.nombre_usuario,
        primer_nombre: message.data.primer_nombre,
        apellido: message.data.apellido,
        total_likes: message.data.total_likes,
        total_dislikes: message.data.total_dislikes,
        total_respuestas: message.data.total_respuestas,
      };

      // Usar la función del hook para agregar el comentario
      addCommentFromWebSocket(newComment);
    }
  };

  // Configurar Socket.IO si el usuario está autenticado
  const { isConnected, isReconnecting, joinPost, leavePost } = useSocketIO({
    userId: currentUserId || 0,
    onMessage: handleSocketIOMessage,
    onConnect: () => console.log("Socket.IO conectado para comentarios"),
    onDisconnect: () => console.log("Socket.IO desconectado"),
    onError: (error: Error) => console.error("Error Socket.IO:", error),
  });

  // Unirse al "room" del post para recibir notificaciones
  useEffect(() => {
    if (isConnected && currentUserId) {
      // Para comentarios usamos joinPost
      joinPost(postId);
    }

    return () => {
      if (currentUserId) {
        leavePost(postId);
      }
    };
  }, [isConnected, currentUserId, postId, joinPost, leavePost]);

  // Manejar creación de comentario
  const handleCreateComment = async (
    contenido: string,
    comentarioPadreId?: number
  ) => {
    if (!isAuthenticated) {
      showError("Error de autenticación", "Debes iniciar sesión para comentar");
      return;
    }

    const success = await createComment(contenido, comentarioPadreId);
    if (success) {
      showSuccess("Éxito", "Comentario creado exitosamente");
    }
  };

  // Manejar eliminación de comentario
  const handleDeleteComment = async (comentarioId: number) => {
    if (!isAuthenticated) {
      showError(
        "Error de autenticación",
        "Debes iniciar sesión para eliminar comentarios"
      );
      return;
    }

    if (!confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
      return;
    }
    const success = await deleteComment(comentarioId);
    if (success) {
      showSuccess("Éxito", "Comentario eliminado exitosamente");
    }
  };

  // Manejar votación de comentario
  const handleVoteComment = async (
    comentarioId: number,
    tipoVoto: "like" | "dislike"
  ) => {
    if (!isAuthenticated) {
      showError(
        "Error de autenticación",
        "Debes iniciar sesión para votar comentarios"
      );
      return;
    }

    const success = await voteComment(comentarioId, tipoVoto);
    if (success) {
      showSuccess("Éxito", "Voto registrado exitosamente");
    }
  };

  // Manejar cambio de página
  const handlePageChange = async (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.total_pages) {
      await fetchComments(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header con indicador de conexión WebSocket */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Comentarios</h2>
          {currentUserId && (
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="h-4 w-4 mr-1" />
                  <span className="text-sm">Conectado</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <WifiOff className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {isReconnecting ? "Reconectando..." : "Desconectado"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Formulario para crear nuevo comentario */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Agregar Comentario</h3>
        {isAuthenticated ? (
          <CommentForm
            onSubmit={(contenido: string) => handleCreateComment(contenido)}
          />
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
            <p className="text-sm">
              Debes{" "}
              <a
                href="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                iniciar sesión
              </a>{" "}
              para comentar en este post.
            </p>
          </div>
        )}
      </div>
      {/* Lista de comentarios */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay comentarios aún. ¡Sé el primero en comentar!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.comentario_id}
              comment={comment}
              onVote={handleVoteComment}
              onDelete={handleDeleteComment}
              onReply={(contenido: string) =>
                handleCreateComment(contenido, comment.comentario_id)
              }
              isAuthenticated={isAuthenticated}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
      {/* Paginación */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page <= 1}
            className="px-3 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Anterior
          </button>

          <span className="px-3 py-2 bg-gray-100 rounded">
            Página {pagination.current_page} de {pagination.total_pages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page >= pagination.total_pages}
            className="px-3 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}{" "}
      {/* Información de comentarios */}
      {pagination && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {comments.length} de {pagination.total} comentarios
        </div>
      )}
    </div>
  );
};
