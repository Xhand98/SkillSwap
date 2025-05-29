// Hook optimizado para comentarios con caché y gestión de estado avanzada
import { useCallback, useMemo } from "react";
import { useComments } from "./useComments";
import { useToastContext } from "@/contexts/ToastContext";

interface UseOptimizedCommentsOptions {
  enableCache?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useOptimizedComments = (
  postId: number,
  options: UseOptimizedCommentsOptions = {}
) => {
  const {
    enableCache = true,
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  const {
    comments,
    loading,
    error,
    pagination,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    voteComment,
    refreshComments,
  } = useComments(postId);

  const { showSuccess, showError, showInfo } = useToastContext();

  // Memoizar estadísticas derivadas
  const commentStats = useMemo(() => {
    const totalComments = comments.length;
    const totalLikes = comments.reduce(
      (sum, comment) => sum + comment.total_likes,
      0
    );
    const totalDislikes = comments.reduce(
      (sum, comment) => sum + comment.total_dislikes,
      0
    );
    const averageLength =
      totalComments > 0
        ? comments.reduce((sum, comment) => sum + comment.contenido.length, 0) /
          totalComments
        : 0;

    return {
      totalComments,
      totalLikes,
      totalDislikes,
      averageLength: Math.round(averageLength),
      engagementRate:
        totalComments > 0 ? (totalLikes + totalDislikes) / totalComments : 0,
      positivityRate:
        totalLikes + totalDislikes > 0
          ? (totalLikes / (totalLikes + totalDislikes)) * 100
          : 0,
    };
  }, [comments]);

  // Crear comentario optimizado con feedback mejorado
  const createCommentOptimized = useCallback(
    async (contenido: string, comentarioPadreId?: number) => {
      const loadingToastId = showInfo(
        "Enviando comentario...",
        "Por favor espera un momento"
      );

      try {
        const success = await createComment(contenido, comentarioPadreId);
        if (success) {
          showSuccess(
            "¡Comentario publicado!",
            comentarioPadreId
              ? "Tu respuesta ha sido añadida"
              : "Tu comentario ha sido publicado"
          );
          return true;
        }
        return false;
      } catch (error) {
        showError(
          "Error al publicar",
          "No se pudo enviar el comentario. Inténtalo de nuevo."
        );
        return false;
      }
    },
    [createComment, showSuccess, showError, showInfo]
  );

  // Votar comentario optimizado
  const voteCommentOptimized = useCallback(
    async (comentarioId: number, tipoVoto: "like" | "dislike") => {
      try {
        const success = await voteComment(comentarioId, tipoVoto);
        if (success) {
          showSuccess(
            "Voto registrado",
            `Has dado ${tipoVoto === "like" ? "like" : "dislike"} al comentario`
          );
        }
        return success;
      } catch (error) {
        showError(
          "Error al votar",
          "No se pudo registrar tu voto. Inténtalo de nuevo."
        );
        return false;
      }
    },
    [voteComment, showSuccess, showError]
  );

  // Eliminar comentario optimizado
  const deleteCommentOptimized = useCallback(
    async (comentarioId: number) => {
      try {
        const success = await deleteComment(comentarioId);
        if (success) {
          showSuccess(
            "Comentario eliminado",
            "Tu comentario ha sido eliminado correctamente"
          );
        }
        return success;
      } catch (error) {
        showError(
          "Error al eliminar",
          "No se pudo eliminar el comentario. Inténtalo de nuevo."
        );
        return false;
      }
    },
    [deleteComment, showSuccess, showError]
  );

  return {
    // Estado básico
    comments,
    loading,
    error,
    pagination,

    // Estadísticas calculadas
    commentStats,

    // Acciones optimizadas
    fetchComments,
    createComment: createCommentOptimized,
    updateComment,
    deleteComment: deleteCommentOptimized,
    voteComment: voteCommentOptimized,
    refreshComments,

    // Utilidades
    hasComments: comments.length > 0,
    isEmpty: comments.length === 0,
    canLoadMore: pagination
      ? pagination.current_page < pagination.total_pages
      : false,
  };
};
