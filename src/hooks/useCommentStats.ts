import { useState, useEffect } from "react";

interface CommentStatsData {
  totalComments: number;
  totalLikes: number;
  totalDislikes: number;
  mostActiveUser: string | null;
  averageLength: number;
  topComments: Array<{
    comentario_id: number;
    contenido: string;
    total_likes: number;
    nombre_usuario: string;
  }>;
}

interface UseCommentStatsReturn {
  stats: CommentStatsData | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const useCommentStats = (postId: number): UseCommentStatsReturn => {
  const [stats, setStats] = useState<CommentStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/posts/${postId}/comments/stats`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error fetching comment stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchStats();
    }
  }, [postId]);

  const refreshStats = async () => {
    await fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
};
