// Preview API disabled; minimal stubs to satisfy imports.
// All calls should go to the real API. These stubs return safe defaults.

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export const previewApi = {
    // Health
    healthCheck: async (): Promise<ApiResponse> => ({ success: true, data: { status: 'ok', preview: false } }),

    // Users
    getUsers: async (): Promise<ApiResponse<any[]>> => ({ success: true, data: [] }),
    getUserById: async (_id: number): Promise<ApiResponse<any>> => ({ success: false, error: 'preview disabled' }),
    updateUser: async (_id: number, _data: any): Promise<ApiResponse<any>> => ({ success: false, error: 'preview disabled' }),

    // Posts
    getPosts: async (): Promise<ApiResponse<any[]>> => ({ success: true, data: [] }),
    getPostById: async (_id: number): Promise<ApiResponse<any>> => ({ success: false, error: 'preview disabled' }),
    createPost: async (_data: any): Promise<ApiResponse<any>> => ({ success: false, error: 'preview disabled' }),
    updatePost: async (_id: number, _data: any): Promise<ApiResponse> => ({ success: false, error: 'preview disabled' }),
    deletePost: async (_id: number): Promise<ApiResponse> => ({ success: false, error: 'preview disabled' }),

    // Comments
    getCommentsByPostId: async (_postId: number): Promise<ApiResponse<any[]>> => ({ success: true, data: [] }),
    createComment: async (_data: any): Promise<ApiResponse<any>> => ({ success: false, error: 'preview disabled' }),
    updateComment: async (_id: number, _data: any): Promise<ApiResponse> => ({ success: false, error: 'preview disabled' }),
    deleteComment: async (_id: number): Promise<ApiResponse> => ({ success: false, error: 'preview disabled' }),

    // Matches
    getMatches: async (): Promise<ApiResponse<any[]>> => ({ success: true, data: [] }),
    createMatch: async (_data: any): Promise<ApiResponse<any>> => ({ success: false, error: 'preview disabled' }),
    updateMatch: async (_id: number, _data: any): Promise<ApiResponse<any>> => ({ success: false, error: 'preview disabled' }),

    // Messages
    getMessages: async (_userId?: number): Promise<ApiResponse<any[]>> => ({ success: true, data: [] }),
    sendMessage: async (_data: any): Promise<ApiResponse<any>> => ({ success: false, error: 'preview disabled' }),

    // Notifications
    getNotifications: async (): Promise<ApiResponse<any[]>> => ({ success: true, data: [] }),
    markNotificationAsRead: async (_id: number): Promise<ApiResponse> => ({ success: false, error: 'preview disabled' }),
} as const;

export const isPreviewMode = (): boolean => false;

export async function makeApiCall<T>(
    realApiCall: () => Promise<T>,
    _previewApiCall: () => Promise<ApiResponse<T>>,
    _allowInPreview: boolean = true
): Promise<T> {
    // Always call real API now
    return await realApiCall();
}

export default previewApi;
