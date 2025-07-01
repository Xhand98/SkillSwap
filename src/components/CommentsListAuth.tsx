// Componente para mostrar una lista de comentarios con autenticación integrada
import React, { useState, useEffect } from "react";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import { useComments } from "@/hooks/useComments";

interface CommentsListProps {
  postId: number;
}

export const CommentsListAuth: React.FC<CommentsListProps> = ({ postId }) => {
  const {
    comments,
    loading,
    error,
    pagination,
    fetchComments,
    createComment,
    deleteComment,
    voteComment,
  } = useComments(postId);

  // Estado para controlar la autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthenticated(!!token);
  }, []);

  // Manejar creación de comentario
  const handleCreateComment = async (
    contenido: string,
    comentarioPadreId?: number
  ) => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para comentar");
      return;
    }

    const success = await createComment(contenido, comentarioPadreId);
    if (success) {
      console.log("Comentario creado exitosamente");
    }
  };

  // Manejar eliminación de comentario
  const handleDeleteComment = async (comentarioId: number) => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para eliminar comentarios");
      return;
    }

    if (!confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
      return;
    }

    const success = await deleteComment(comentarioId);
    if (success) {
      console.log("Comentario eliminado exitosamente");
    }
  };

  // Manejar votación de comentario
  const handleVoteComment = async (
    comentarioId: number,
    tipoVoto: "like" | "dislike"
  ) => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para votar comentarios");
      return;
    }

    const success = await voteComment(comentarioId, tipoVoto);
    if (success) {
      console.log("Voto registrado exitosamente");
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
      {/* Formulario para crear nuevo comentario */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Agregar Comentario</h3>
        {isAuthenticated ? (
          <CommentForm
            onSubmit={(contenido) => handleCreateComment(contenido)}
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
              onReply={(contenido) =>
                handleCreateComment(contenido, comment.comentario_id)
              }
              isAuthenticated={isAuthenticated}
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
      )}

      {/* Información de comentarios */}
      {pagination && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {comments.length} de {pagination.total} comentarios
        </div>
      )}
    </div>
  );
};
