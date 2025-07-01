// Hook personalizado para gestionar comentarios
import { useState, useEffect, useCallback } from "react";
import { useToast } from "./useToast";

// Función para obtener el token de autenticación
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

// Función para obtener headers de autenticación
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

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

interface CommentsData {
  comentarios: Comment[];
  pagination: {
    current_page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  pagination: CommentsData["pagination"] | null;
  fetchComments: (page?: number) => Promise<void>;
  createComment: (
    contenido: string,
    comentarioPadreId?: number
  ) => Promise<boolean>;
  updateComment: (comentarioId: number, contenido: string) => Promise<boolean>;
  deleteComment: (comentarioId: number) => Promise<boolean>;
  voteComment: (
    comentarioId: number,
    tipoVoto: "like" | "dislike"
  ) => Promise<boolean>;
  refreshComments: () => Promise<void>;
  addCommentFromWebSocket: (comment: Comment) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const useComments = (postId: number): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<
    CommentsData["pagination"] | null
  >(null);

  // Hook para notificaciones
  const { showSuccess, showError, showWarning } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Función para hacer fetch de comentarios
  const fetchComments = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/posts/${postId}/comments?page=${page}&page_size=20`
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: CommentsData = await response.json();

        setComments(data.comentarios || []);
        setPagination(data.pagination);
        setCurrentPage(page);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error fetching comments:", err);
      } finally {
        setLoading(false);
      }
    },
    [postId]
  );
  // Función para crear comentario
  const createComment = useCallback(
    async (contenido: string, comentarioPadreId?: number): Promise<boolean> => {
      try {
        const token = getAuthToken();
        if (!token) {
          showError(
            "Autenticación requerida",
            "Debes iniciar sesión para comentar"
          );
          throw new Error("Debes iniciar sesión para comentar");
        }

        const response = await fetch(
          `${API_BASE_URL}/posts/${postId}/comments`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              contenido,
              comentario_padre_id: comentarioPadreId || null,
            }),
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            showError("Sesión expirada", "Debes iniciar sesión nuevamente");
            throw new Error("Debes iniciar sesión para comentar");
          }
          showError(
            "Error al comentar",
            `Error ${response.status}: ${response.statusText}`
          );
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        // Refrescar comentarios después de crear
        await fetchComments(currentPage);
        showSuccess(
          "¡Comentario creado!",
          "Tu comentario se ha publicado exitosamente"
        );
        return true;
      } catch (err) {
        console.error("Error creating comment:", err);
        setError(
          err instanceof Error ? err.message : "Error al crear comentario"
        );
        return false;
      }
    },
    [postId, fetchComments, currentPage, showSuccess, showError]
  );

  // Función para actualizar comentario
  const updateComment = useCallback(
    async (comentarioId: number, contenido: string): Promise<boolean> => {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error("Debes iniciar sesión para editar comentarios");
        }

        const response = await fetch(
          `${API_BASE_URL}/comments/${comentarioId}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ contenido }),
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Debes iniciar sesión para editar comentarios");
          }
          if (response.status === 403) {
            throw new Error("No tienes permiso para editar este comentario");
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        // Refrescar comentarios después de actualizar
        await fetchComments(currentPage);
        return true;
      } catch (err) {
        console.error("Error updating comment:", err);
        setError(
          err instanceof Error ? err.message : "Error al actualizar comentario"
        );
        return false;
      }
    },
    [fetchComments, currentPage]
  );
  // Función para eliminar comentario
  const deleteComment = useCallback(
    async (comentarioId: number): Promise<boolean> => {
      try {
        const token = getAuthToken();
        if (!token) {
          showError(
            "Autenticación requerida",
            "Debes iniciar sesión para eliminar comentarios"
          );
          throw new Error("Debes iniciar sesión para eliminar comentarios");
        }

        const response = await fetch(
          `${API_BASE_URL}/comments/${comentarioId}`,
          {
            method: "DELETE",
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            showError("Sesión expirada", "Debes iniciar sesión nuevamente");
            throw new Error("Debes iniciar sesión para eliminar comentarios");
          }
          if (response.status === 403) {
            showError(
              "Sin permisos",
              "No tienes permiso para eliminar este comentario"
            );
            throw new Error("No tienes permiso para eliminar este comentario");
          }
          showError(
            "Error al eliminar",
            `Error ${response.status}: ${response.statusText}`
          );
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        // Refrescar comentarios después de eliminar
        await fetchComments(currentPage);
        showSuccess(
          "¡Comentario eliminado!",
          "El comentario se ha eliminado exitosamente"
        );
        return true;
      } catch (err) {
        console.error("Error deleting comment:", err);
        setError(
          err instanceof Error ? err.message : "Error al eliminar comentario"
        );
        return false;
      }
    },
    [fetchComments, currentPage, showSuccess, showError]
  );

  // Función para votar comentario
  const voteComment = useCallback(
    async (
      comentarioId: number,
      tipoVoto: "like" | "dislike"
    ): Promise<boolean> => {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error("Debes iniciar sesión para votar comentarios");
        }

        const response = await fetch(
          `${API_BASE_URL}/comments/${comentarioId}/like`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ tipo_voto: tipoVoto }),
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Debes iniciar sesión para votar comentarios");
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        // Refrescar comentarios después de votar
        await fetchComments(currentPage);
        return true;
      } catch (err) {
        console.error("Error voting comment:", err);
        setError(
          err instanceof Error ? err.message : "Error al votar comentario"
        );
        return false;
      }
    },
    [fetchComments, currentPage]
  );
  // Función para refrescar comentarios
  const refreshComments = useCallback(async () => {
    await fetchComments(currentPage);
  }, [fetchComments, currentPage]);

  // Función para agregar comentario desde WebSocket
  const addCommentFromWebSocket = useCallback((comment: Comment) => {
    setComments((prevComments) => {
      // Evitar duplicados
      const exists = prevComments.some(
        (c) => c.comentario_id === comment.comentario_id
      );
      if (exists) return prevComments;

      // Agregar al principio si es comentario principal
      if (!comment.comentario_padre_id) {
        return [comment, ...prevComments];
      }
      return [...prevComments, comment];
    });
  }, []);

  // Cargar comentarios al montar el componente
  useEffect(() => {
    if (postId) {
      fetchComments(1);
    }
  }, [postId, fetchComments]);
  return {
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
    addCommentFromWebSocket,
  };
};
