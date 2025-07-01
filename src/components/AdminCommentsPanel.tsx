// Panel de administración para comentarios con métricas y moderación
import React, { useState, useEffect } from "react";
import { commentValidationMiddleware } from "@/utils/commentValidationMiddleware";
import { useToastContext } from "@/contexts/ToastContext";
import LoadingSpinner from "./LoadingSpinner";

interface CommentModerationData {
  commentId: number;
  postId: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
  totalLikes: number;
  totalDislikes: number;
  isReported: boolean;
  reportCount: number;
}

interface AdminCommentsPanelProps {
  className?: string;
}

const AdminCommentsPanel: React.FC<AdminCommentsPanelProps> = ({
  className = "",
}) => {
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<CommentModerationData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "reported" | "recent">("all");
  const { showSuccess, showError } = useToastContext();

  // Cargar datos de comentarios
  useEffect(() => {
    loadCommentsModerationData();
    loadValidationStats();
  }, [filter]);

  const loadCommentsModerationData = async () => {
    try {
      setLoading(true);
      // Aquí harías la llamada a la API para obtener comentarios
      // Por ahora, datos de ejemplo
      const mockData: CommentModerationData[] = [
        {
          commentId: 1,
          postId: 1,
          userId: 1,
          username: "usuario1",
          content: "Este es un comentario de ejemplo",
          createdAt: new Date().toISOString(),
          totalLikes: 5,
          totalDislikes: 1,
          isReported: false,
          reportCount: 0,
        },
        // Más datos de ejemplo...
      ];

      setComments(mockData);
    } catch (error) {
      showError("Error", "No se pudieron cargar los comentarios");
    } finally {
      setLoading(false);
    }
  };

  const loadValidationStats = () => {
    const validationStats = commentValidationMiddleware.getValidationStats();
    setStats(validationStats);
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
      return;
    }

    try {
      // Llamada a la API para eliminar comentario
      showSuccess("Éxito", "Comentario eliminado correctamente");
      loadCommentsModerationData(); // Recargar datos
    } catch (error) {
      showError("Error", "No se pudo eliminar el comentario");
    }
  };

  const handleApproveComment = async (commentId: number) => {
    try {
      // Llamada a la API para aprobar comentario
      showSuccess("Éxito", "Comentario aprobado");
      loadCommentsModerationData();
    } catch (error) {
      showError("Error", "No se pudo aprobar el comentario");
    }
  };

  const filteredComments = comments.filter((comment) => {
    switch (filter) {
      case "reported":
        return comment.isReported;
      case "recent":
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(comment.createdAt) > oneDayAgo;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`admin-comments-panel ${className}`}>
      {/* Header con estadísticas */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Moderación de Comentarios
        </h2>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-600">
                Usuarios Totales
              </h3>
              <p className="text-2xl font-bold text-blue-900">
                {stats.totalUsers}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-600">
                Usuarios Activos
              </h3>
              <p className="text-2xl font-bold text-green-900">
                {stats.activeUsers}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-600">
                Promedio por Usuario
              </h3>
              <p className="text-2xl font-bold text-purple-900">
                {stats.averageCommentsPerUser.toFixed(1)}
              </p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Todos ({comments.length})
          </button>
          <button
            onClick={() => setFilter("reported")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "reported"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Reportados ({comments.filter((c) => c.isReported).length})
          </button>
          <button
            onClick={() => setFilter("recent")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "recent"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Recientes (24h)
          </button>
        </div>
      </div>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay comentarios que mostrar en esta categoría.
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.commentId}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                comment.isReported ? "border-red-400" : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">
                      @{comment.username}
                    </span>
                    <span className="text-sm text-gray-500">
                      Post #{comment.postId}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString("es-ES")}
                    </span>
                    {comment.isReported && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Reportado ({comment.reportCount})
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 mb-3">{comment.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>👍 {comment.totalLikes}</span>
                    <span>👎 {comment.totalDislikes}</span>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  {comment.isReported && (
                    <button
                      onClick={() => handleApproveComment(comment.commentId)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Aprobar
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteComment(comment.commentId)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Acciones masivas */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Acciones Masivas
        </h3>
        <div className="flex space-x-4">
          <button
            onClick={() => commentValidationMiddleware.cleanupOldHistory()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Limpiar Historial Antiguo
          </button>
          <button
            onClick={loadValidationStats}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Actualizar Estadísticas
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCommentsPanel;
