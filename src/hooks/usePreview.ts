// Preview hooks disabled. Export safe no-ops to keep imports working.

export const usePreviewMode = () => ({ isPreviewMode: false, debugLog: (..._args: any[]) => {} });

export const usePreviewUser = () => ({ user: null as any, loading: false, error: null as string | null, isPreviewMode: false });

export const usePreviewPosts = () => ({
    posts: [] as any[],
    loading: false,
    error: null as string | null,
    createPost: async (..._args: any[]) => null,
    updatePost: async (..._args: any[]) => false,
    deletePost: async (..._args: any[]) => false,
    refetch: async () => {},
    isPreviewMode: false,
});

export const usePreviewComments = (_postId?: number) => ({
    comments: [] as any[],
    loading: false,
    error: null as string | null,
    addComment: async (..._args: any[]) => null,
    updateComment: async (..._args: any[]) => false,
    deleteComment: async (..._args: any[]) => false,
    refetch: async () => {},
    isPreviewMode: false,
});

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

export const usePreviewNotifications = () => ({
    notifications: [] as any[],
    unreadCount: 0,
    loading: false,
    markAsRead: async (..._args: any[]) => false,
    refetch: async () => {},
    isPreviewMode: false,
});

export const usePreviewMatches = () => ({
    matches: [] as any[],
    loading: false,
    createMatch: async (..._args: any[]) => null,
    updateMatch: async (..._args: any[]) => false,
    refetch: async () => {},
    isPreviewMode: false,
});

export const usePreviewMessages = (_userId?: number) => ({
    messages: [] as any[],
    loading: false,
    sendMessage: async (..._args: any[]) => null,
    refetch: async () => {},
    isPreviewMode: false,
});

export const usePreview = () => ({
    isPreviewMode: false,
    cache: null as any,
    api: null as any,
    webSocket: null as any,
    debugLog: (..._args: any[]) => {},
    generateRandomData: () => {},
    clearCache: () => {},
    simulateMessage: (..._args: any[]) => {},
    simulateNotification: (..._args: any[]) => {},
});
