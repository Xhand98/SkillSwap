/**
 * Preview hooks are disabled. This module now exports safe no-op hooks so imports won't break.
 * All functions return stable shapes with isPreviewMode=false and inert actions.
 */

// Estado del modo preview
export const usePreviewMode = () => ({ isPreviewMode: false, debugLog: (..._args: any[]) => {} });

// Datos de usuario
export const usePreviewUser = () => ({ user: null as any, loading: false, error: null as string | null, isPreviewMode: false });

// Posts
export const usePreviewPosts = () => ({
    posts: [] as any[],
    loading: false,
    error: null as string | null,
    createPost: async (..._args: any[]) => null,
    updatePost: async (..._args: any[]) => false,
    deletePost: async (..._args: any[]) => false,
    refetch: () => {},
    isPreviewMode: false,
});

// Comentarios
export const usePreviewComments = (_postId?: number) => ({
    comments: [] as any[],
    loading: false,
    error: null as string | null,
    addComment: async (..._args: any[]) => null,
    updateComment: async (..._args: any[]) => false,
    deleteComment: async (..._args: any[]) => false,
    refetch: () => {},
    isPreviewMode: false,
});

// WebSocket
export const usePreviewWebSocket = () => ({
    isConnected: false,
    lastMessage: null as any,
    sendMessage: (..._args: any[]) => {},
    joinRoom: (..._args: any[]) => {},
    leaveRoom: (..._args: any[]) => {},
    simulateMessage: (..._args: any[]) => {},
    simulateNotification: (..._args: any[]) => {},
    isPreviewMode: false,
});

// Notificaciones
export const usePreviewNotifications = () => ({
    notifications: [] as any[],
    unreadCount: 0,
    loading: false,
    markAsRead: async (..._args: any[]) => false,
    refetch: () => {},
    isPreviewMode: false,
});

// Matches
export const usePreviewMatches = () => ({
    matches: [] as any[],
    loading: false,
    error: null as string | null,
    createMatch: async (..._args: any[]) => null,
    updateMatch: async (..._args: any[]) => false,
    refetch: async () => {},
    isPreviewMode: false,
});

// Mensajes
export const usePreviewMessages = (_userId?: number) => ({
    messages: [] as any[],
    loading: false,
    sendMessage: async (..._args: any[]) => null,
    refetch: async () => {},
    isPreviewMode: false,
});

// Debug helpers
export const usePreviewDebug = () => ({
    verifyData: async () => null,
    initializeTestData: () => {},
    testMatches: async () => null,
    isPreviewMode: false,
});

// Hook principal
export const usePreview = () => ({
    isPreviewMode: false,
    cache: null as any,
    api: null as any,
    webSocket: null as any,
    debugLog: (..._args: any[]) => {},
    generateRandomData: () => {},
    clearCache: () => {},
    verifyData: async () => null,
    initializeTestData: () => {},
    simulateMessage: (..._args: any[]) => {},
    simulateNotification: (..._args: any[]) => {},
});
