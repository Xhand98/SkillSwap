/**
 * Hooks adicionales para el modo preview
 * Proporcionan datos mock para feed, estadísticas, y recomendaciones
 */

import { useState, useEffect } from 'react';
import { PREVIEW_MODE, debugLog } from '../config/app-config';
import { previewApi } from '../lib/preview-api';

// Hook para el feed principal
export const usePreviewFeed = (initialPage = 1, initialLimit = 10) => {
    const [feed, setFeed] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: initialPage,
        limit: initialLimit,
        total: 0,
        hasMore: false
    });

    const fetchFeed = async (page = pagination.page, limit = pagination.limit) => {
        if (!PREVIEW_MODE) return;

        try {
            setLoading(true);
            setError(null);
            
            debugLog(`Fetching preview feed (page ${page}, limit ${limit})...`);
            const result = await previewApi.getFeed(page, limit);

            if (result.success) {
                setFeed(prev => {
                    // Si es la primera página, reemplazar todo
                    if (page === 1) return result.data.items || [];
                    // Si no, añadir a lo existente
                    return [...prev, ...(result.data.items || [])];
                });
                
                setPagination({
                    page,
                    limit,
                    total: result.data.pagination.total || 0,
                    hasMore: result.data.pagination.has_more || false
                });
                
                debugLog(`Feed loaded: ${result.data.items?.length || 0} items`);
            } else {
                setError(result.error || 'Error desconocido');
                debugLog('Error loading feed:', result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMsg);
            debugLog('Exception loading feed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (PREVIEW_MODE) {
            fetchFeed(initialPage, initialLimit);
        }
    }, [initialPage, initialLimit]);

    const loadMore = () => {
        if (pagination.hasMore && !loading) {
            fetchFeed(pagination.page + 1, pagination.limit);
        }
    };

    const refresh = () => {
        fetchFeed(1, pagination.limit);
    };

    return {
        feed,
        loading,
        error,
        pagination,
        loadMore,
        refresh,
        isPreviewMode: PREVIEW_MODE
    };
};

// Hook para actividad reciente
export const usePreviewActivity = (limit = 10) => {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActivities = async () => {
        if (!PREVIEW_MODE) return;

        try {
            setLoading(true);
            setError(null);
            
            const result = await previewApi.getActivityFeed(limit);

            if (result.success) {
                setActivities(result.data || []);
                debugLog(`Activities loaded: ${result.data?.length || 0} items`);
            } else {
                setError(result.error || 'Error desconocido');
                debugLog('Error loading activities:', result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMsg);
            debugLog('Exception loading activities:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (PREVIEW_MODE) {
            fetchActivities();
        }
    }, []);

    return {
        activities,
        loading,
        error,
        refresh: fetchActivities,
        isPreviewMode: PREVIEW_MODE
    };
};

// Hook para estadísticas del sistema
export const usePreviewStats = () => {
    const [stats, setStats] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        if (!PREVIEW_MODE) return;

        try {
            setLoading(true);
            setError(null);
            
            const result = await previewApi.getSystemStats();

            if (result.success) {
                setStats(result.data || {});
                debugLog(`System stats loaded`);
            } else {
                setError(result.error || 'Error desconocido');
                debugLog('Error loading stats:', result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMsg);
            debugLog('Exception loading stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (PREVIEW_MODE) {
            fetchStats();
        }
    }, []);

    return {
        stats,
        loading,
        error,
        refresh: fetchStats,
        isPreviewMode: PREVIEW_MODE
    };
};

// Hook para recomendaciones de match
export const usePreviewRecommendations = (limit = 5) => {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRecommendations = async () => {
        if (!PREVIEW_MODE) return;

        try {
            setLoading(true);
            setError(null);
            
            const result = await previewApi.getRecommendedMatches(limit);

            if (result.success) {
                setRecommendations(result.data || []);
                debugLog(`Recommendations loaded: ${result.data?.length || 0} items`);
            } else {
                setError(result.error || 'Error desconocido');
                debugLog('Error loading recommendations:', result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMsg);
            debugLog('Exception loading recommendations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (PREVIEW_MODE) {
            fetchRecommendations();
        }
    }, []);

    return {
        recommendations,
        loading,
        error,
        refresh: fetchRecommendations,
        isPreviewMode: PREVIEW_MODE
    };
};
