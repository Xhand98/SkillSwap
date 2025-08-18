 /**
 * API Client para llamadas reales a la API (sin modo preview/mock)
 */
import { API_CONFIG } from './api-config';
import { debugLog } from '../config/app-config';
// Preview/mock eliminado

// Clase principal del cliente API
export class ApiClient {
    private static instance: ApiClient;
    private baseURL: string;

    private constructor() {
        this.baseURL = API_CONFIG.API_URL;
    }

    static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    // Helper para hacer requests HTTP reales
    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        debugLog(`Making real API request to: ${url}`);

        const token = localStorage.getItem('auth_token');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...((options.headers as Record<string, string>) || {}),
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    // Métodos de la API

    // Health check
    async healthCheck() {
        return this.makeRequest<any>('/health');
    }

    // Usuarios
    async getUsers() {
        return this.makeRequest<any>('/users');
    }

    async getUserById(id: number) {
        return this.makeRequest<any>(`/users/${id}`);
    }

    async updateUser(id: number, userData: any) {
        return this.makeRequest<any>(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    // Posts
    async getPosts() {
        return this.makeRequest<any>('/posts');
    }

    async getPostById(id: number) {
        return this.makeRequest<any>(`/posts/${id}`);
    }

    async createPost(postData: any) {
        return this.makeRequest<any>('/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    }

    async updatePost(id: number, postData: any) {
        return this.makeRequest<any>(`/posts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });
    }

    async deletePost(id: number) {
        return this.makeRequest<any>(`/posts/${id}`, {
            method: 'DELETE'
        });
    }

    // Comentarios
    async getCommentsByPostId(postId: number) {
        return this.makeRequest<any>(`/posts/${postId}/comments`);
    }

    async createComment(commentData: any) {
        return this.makeRequest<any>('/comments', {
            method: 'POST',
            body: JSON.stringify(commentData)
        });
    }

    async updateComment(id: number, commentData: any) {
        return this.makeRequest<any>(`/comments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(commentData)
        });
    }

    async deleteComment(id: number) {
        return this.makeRequest<any>(`/comments/${id}`, {
            method: 'DELETE'
        });
    }

    // Matches
    async getMatches() {
        return this.makeRequest<any>('/matches');
    }

    async createMatch(matchData: any) {
        return this.makeRequest<any>('/matches', {
            method: 'POST',
            body: JSON.stringify(matchData)
        });
    }

    async updateMatch(id: number, matchData: any) {
        return this.makeRequest<any>(`/matches/${id}`, {
            method: 'PUT',
            body: JSON.stringify(matchData)
        });
    }

    // Mensajes
    async getMessages(userId?: number) {
        return this.makeRequest<any>(userId ? `/messages?user=${userId}` : '/messages');
    }

    async sendMessage(messageData: any) {
        return this.makeRequest<any>('/messages', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    // Notificaciones
    async getNotifications() {
        return this.makeRequest<any>('/notifications');
    }

    async markNotificationAsRead(id: number) {
        return this.makeRequest<any>(`/notifications/${id}/read`, {
            method: 'PUT'
        });
    }

    // Métodos adicionales para compatibilidad con código existente

    // Dashboard stats
    async getUserMatches(userId: number) {
        return this.makeRequest<any>(`/users/${userId}/matches`);
    }

    // Sessions
    async getMatchSessions(matchId: number) {
        return this.makeRequest<any>(`/matches/${matchId}/sessions`);
    }

    // User abilities
    async getUserAbilities(userId: number) {
        return this.makeRequest<any>(`/userabilities/user/${userId}`);
    }

    // Abilities list
    async getAbilities() {
        return this.makeRequest<any>('/abilities');
    }

    // Notificaciones (método adicional)
    async getUserNotifications(userId: number) {
        return this.makeRequest<any>(`/notifications/user/${userId}`);
    }
}

// Exportar instancia singleton
export const apiClient = ApiClient.getInstance();

// Exportar también para compatibilidad
export default apiClient;
