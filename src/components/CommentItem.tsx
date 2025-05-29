// Componente para mostrar un comentario individual
import React, { useState } from "react";
import { CommentForm } from "./CommentForm";
import LoadingSpinner from "./LoadingSpinner";

interface Comment {
  comentario_id: number;
  post_id: number;
  usuario_id: number;
  comentario_padre_id: number | null;
  contenido: string;
  created_at: string;
  updated_at: string;
  activo: boolean;
  nombre_usuario: string;
  primer_nombre: string;
  apellido: string;
  total_likes: number;
  total_dislikes: number;
  total_respuestas: number;
}

interface CommentItemProps {
  comment: Comment;
  onVote: (comentarioId: number, tipoVoto: "like" | "dislike") => void;
  onDelete: (comentarioId: number) => void;
  onReply: (contenido: string) => void;
  level?: number; // Para mostrar nivel de anidación
  isAuthenticated?: boolean;
  currentUserId?: number | null;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onVote,
  onDelete,
  onReply,
  level = 0,
  isAuthenticated = false,
  currentUserId = null,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  // Función para cargar respuestas
  const fetchReplies = async () => {
    if (comment.total_respuestas === 0) return;

    try {
      setLoadingReplies(true);
      const response = await fetch(
        `http://localhost:8000/comments/${comment.comentario_id}/replies`
      );

      if (!response.ok) {
        throw new Error("Error al cargar respuestas");
      }

      const data = await response.json();
      setReplies(data.respuestas || []);
      setShowReplies(true);
    } catch (err) {
      console.error("Error cargando respuestas:", err);
    } finally {
      setLoadingReplies(false);
    }
  };

  // Función para manejar respuesta
  const handleReply = (contenido: string) => {
    onReply(contenido);
    setShowReplyForm(false);
    // Recargar respuestas si ya están mostradas
    if (showReplies) {
      fetchReplies();
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calcular margen basado en nivel de anidación
  const marginLeft = level * 20;

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200"
      style={{ marginLeft: `${marginLeft}px` }}
    >
      {/* Header del comentario */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar placeholder */}
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {comment.primer_nombre.charAt(0)}
            </div>

            <div>
              <h4 className="font-semibold text-gray-900">
                {comment.primer_nombre} {comment.apellido}
              </h4>
              <p className="text-sm text-gray-500">@{comment.nombre_usuario}</p>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {formatDate(comment.created_at)}
            {comment.updated_at !== comment.created_at && (
              <span className="ml-2 text-xs">(editado)</span>
            )}
          </div>
        </div>
      </div>
      {/* Contenido del comentario */}
      <div className="p-4">
        <p className="text-gray-800 leading-relaxed">{comment.contenido}</p>
      </div>{" "}
      {/* Acciones del comentario */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Botones de voto */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onVote(comment.comentario_id, "like")}
              disabled={!isAuthenticated}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                isAuthenticated
                  ? "text-gray-600 hover:text-green-600"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              title={!isAuthenticated ? "Debes iniciar sesión para votar" : ""}
            >
              <span>👍</span>
              <span>{comment.total_likes}</span>
            </button>

            <button
              onClick={() => onVote(comment.comentario_id, "dislike")}
              disabled={!isAuthenticated}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                isAuthenticated
                  ? "text-gray-600 hover:text-red-600"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              title={!isAuthenticated ? "Debes iniciar sesión para votar" : ""}
            >
              <span>👎</span>
              <span>{comment.total_dislikes}</span>
            </button>
          </div>

          {/* Botón de responder */}
          {isAuthenticated ? (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Responder
            </button>
          ) : (
            <span
              className="text-sm text-gray-400"
              title="Debes iniciar sesión para responder"
            >
              Responder
            </span>
          )}

          {/* Mostrar respuestas */}
          {comment.total_respuestas > 0 && (
            <button
              onClick={fetchReplies}
              disabled={loadingReplies}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              {loadingReplies
                ? "Cargando..."
                : showReplies
                ? `Ocultar respuestas (${comment.total_respuestas})`
                : `Ver respuestas (${comment.total_respuestas})`}
            </button>
          )}
        </div>

        {/* Botón de eliminar (solo para el autor) */}
        {isAuthenticated && currentUserId === comment.usuario_id && (
          <button
            onClick={() => onDelete(comment.comentario_id)}
            className="text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            Eliminar
          </button>
        )}
      </div>
      {/* Formulario de respuesta */}
      {showReplyForm && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="mt-4">
            <CommentForm
              onSubmit={handleReply}
              onCancel={() => setShowReplyForm(false)}
              placeholder="Escribe tu respuesta..."
              submitText="Responder"
            />
          </div>
        </div>
      )}{" "}
      {/* Respuestas anidadas */}
      {showReplies && replies.length > 0 && (
        <div className="border-t border-gray-100">
          {replies.map((reply) => (
            <CommentItem
              key={reply.comentario_id}
              comment={reply}
              onVote={onVote}
              onDelete={onDelete}
              onReply={onReply}
              level={level + 1}
              isAuthenticated={isAuthenticated}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
