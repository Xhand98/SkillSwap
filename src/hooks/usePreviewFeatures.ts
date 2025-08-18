/**
 * Hooks adicionales para el modo preview
 * Proporcionan datos mock para feed, estadísticas, y recomendaciones
 */

import { useState, useEffect } from 'react';

// Preview mode hooks removed; keep minimal no-op exports to avoid breaking imports.
const NO_PREVIEW = { isPreviewMode: false } as const;

// Hook para el feed principal
export const usePreviewFeed = (_initialPage = 1, _initialLimit = 10) => ({
    feed: [] as any[],
    loading: false,
    error: null as string | null,
    pagination: { page: 1, limit: 10, total: 0, hasMore: false },
    loadMore: () => {},
    refresh: () => {},
    ...NO_PREVIEW,
});

// Hook para actividad reciente
export const usePreviewActivity = (_limit = 10) => ({
    activities: [] as any[],
    loading: false,
    error: null as string | null,
    refresh: () => {},
    ...NO_PREVIEW,
});

// Hook para estadísticas del sistema
export const usePreviewStats = () => ({
    stats: {} as Record<string, any>,
    loading: false,
    error: null as string | null,
    refresh: () => {},
    ...NO_PREVIEW,
});

// Hook para recomendaciones de match
export const usePreviewRecommendations = (_limit = 5) => ({
    recommendations: [] as any[],
    loading: false,
    error: null as string | null,
    refresh: () => {},
    ...NO_PREVIEW,
});
