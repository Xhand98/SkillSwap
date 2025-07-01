/**
 * API Client que maneja automáticamente el modo PREVIEW
 * Cuando PREVIEW_MODE=true, usa el servicio mock en lugar de hacer llamadas reales
 */
import { API_CONFIG } from './api-config';
import { debugLog } from '../config/app-config';
import { previewApi, makeApiCall } from './preview-api';

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
        return makeApiCall(
            () => this.makeRequest<any>('/health'),
            () => previewApi.healthCheck()
        );
    }

    // Usuarios
    async getUsers() {
        return makeApiCall(
            () => this.makeRequest<any>('/users'),
            () => previewApi.getUsers()
        );
    }

    async getUserById(id: number) {
        return makeApiCall(
            () => this.makeRequest<any>(`/users/${id}`),
            () => previewApi.getUserById(id)
        );
    }

    async updateUser(id: number, userData: any) {
        return makeApiCall(
            () => this.makeRequest<any>(`/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            }),
            () => previewApi.updateUser(id, userData)
        );
    }

    // Posts
    async getPosts() {
        return makeApiCall(
            () => this.makeRequest<any>('/posts'),
            () => previewApi.getPosts()
        );
    }

    async getPostById(id: number) {
        return makeApiCall(
            () => this.makeRequest<any>(`/posts/${id}`),
            () => previewApi.getPostById(id)
        );
    }

    async createPost(postData: any) {
        return makeApiCall(
            () => this.makeRequest<any>('/posts', {
                method: 'POST',
                body: JSON.stringify(postData)
            }),
            () => previewApi.createPost(postData)
        );
    }

    async updatePost(id: number, postData: any) {
        return makeApiCall(
            () => this.makeRequest<any>(`/posts/${id}`, {
                method: 'PUT',
                body: JSON.stringify(postData)
            }),
            () => previewApi.updatePost(id, postData)
        );
    }

    async deletePost(id: number) {
        return makeApiCall(
            () => this.makeRequest<any>(`/posts/${id}`, {
                method: 'DELETE'
            }),
            () => previewApi.deletePost(id)
        );
    }

    // Comentarios
    async getCommentsByPostId(postId: number) {
        return makeApiCall(
            () => this.makeRequest<any>(`/posts/${postId}/comments`),
            () => previewApi.getCommentsByPostId(postId)
        );
    }

    async createComment(commentData: any) {
        return makeApiCall(
            () => this.makeRequest<any>('/comments', {
                method: 'POST',
                body: JSON.stringify(commentData)
            }),
            () => previewApi.createComment(commentData)
        );
    }

    async updateComment(id: number, commentData: any) {
        return makeApiCall(
            () => this.makeRequest<any>(`/comments/${id}`, {
                method: 'PUT',
                body: JSON.stringify(commentData)
            }),
            () => previewApi.updateComment(id, commentData)
        );
    }

    async deleteComment(id: number) {
        return makeApiCall(
            () => this.makeRequest<any>(`/comments/${id}`, {
                method: 'DELETE'
            }),
            () => previewApi.deleteComment(id)
        );
    }

    // Matches
    async getMatches() {
        return makeApiCall(
            () => this.makeRequest<any>('/matches'),
            () => previewApi.getMatches()
        );
    }

    async createMatch(matchData: any) {
        return makeApiCall(
            () => this.makeRequest<any>('/matches', {
                method: 'POST',
                body: JSON.stringify(matchData)
            }),
            () => previewApi.createMatch(matchData)
        );
    }

    async updateMatch(id: number, matchData: any) {
        return makeApiCall(
            () => this.makeRequest<any>(`/matches/${id}`, {
                method: 'PUT',
                body: JSON.stringify(matchData)
            }),
            () => previewApi.updateMatch(id, matchData)
        );
    }

    // Mensajes
    async getMessages(userId?: number) {
        return makeApiCall(
            () => this.makeRequest<any>(userId ? `/messages?user=${userId}` : '/messages'),
            () => previewApi.getMessages(userId)
        );
    }

    async sendMessage(messageData: any) {
        return makeApiCall(
            () => this.makeRequest<any>('/messages', {
                method: 'POST',
                body: JSON.stringify(messageData)
            }),
            () => previewApi.sendMessage(messageData)
        );
    }

    // Notificaciones
    async getNotifications() {
        return makeApiCall(
            () => this.makeRequest<any>('/notifications'),
            () => previewApi.getNotifications()
        );
    }

    async markNotificationAsRead(id: number) {
        return makeApiCall(
            () => this.makeRequest<any>(`/notifications/${id}/read`, {
                method: 'PUT'
            }),
            () => previewApi.markNotificationAsRead(id)
        );
    }

    // Métodos adicionales para compatibilidad con código existente

    // Dashboard stats
    async getUserMatches(userId: number) {
        return makeApiCall(
            () => this.makeRequest<any>(`/users/${userId}/matches`),
            async () => ({
                success: true,
                data: [
                    { id: 1, user1_id: 1, user2_id: 2, status: 'active', created_at: '2025-06-01' },
                    { id: 2, user1_id: 1, user2_id: 3, status: 'active', created_at: '2025-06-02' },
                    { id: 3, user1_id: 1, user2_id: 4, status: 'pending', created_at: '2025-06-03' }
                ]
            })
        );
    }

    // Sessions
    async getMatchSessions(matchId: number) {
        return makeApiCall(
            () => this.makeRequest<any>(`/matches/${matchId}/sessions`),
            async () => ({
                success: true,
                data: [
                    { id: 1, match_id: matchId, status: 'completed', date: '2025-06-01', duration: 60 },
                    { id: 2, match_id: matchId, status: 'pending', date: '2025-06-15', duration: 45 }
                ]
            })
        );
    }

    // User abilities
    async getUserAbilities(userId: number) {
        return makeApiCall(
            () => this.makeRequest<any>(`/userabilities/user/${userId}`),
            async () => ({
                success: true,
                data: [
                    { id: 1, user_id: userId, ability_id: 1, type: 'Ofrece', level: 'Experto', ability: { name: 'JavaScript', category: 'Tecnología' } },
                    { id: 2, user_id: userId, ability_id: 2, type: 'Busca', level: 'Principiante', ability: { name: 'Python', category: 'Tecnología' } },
                    { id: 3, user_id: userId, ability_id: 3, type: 'Ofrece', level: 'Intermedio', ability: { name: 'React', category: 'Tecnología' } }
                ]
            })
        );
    }

    // Abilities list
    async getAbilities() {
        return makeApiCall(
            () => this.makeRequest<any>('/abilities'),
            async () => ({
                success: true,
                data: [
                    { id: 1, name: 'JavaScript', category: 'Tecnología', description: 'Lenguaje de programación' },
                    { id: 2, name: 'Python', category: 'Tecnología', description: 'Lenguaje de programación' },
                    { id: 3, name: 'React', category: 'Tecnología', description: 'Framework de JavaScript' },
                    { id: 4, name: 'Cocina Italiana', category: 'Gastronomía', description: 'Arte culinario italiano' },
                    { id: 5, name: 'Guitarra', category: 'Artes', description: 'Instrumento musical' }
                ]
            })
        );
    }

    // Notificaciones (método adicional)
    async getUserNotifications(userId: number) {
        return makeApiCall(
            () => this.makeRequest<any>(`/notifications/user/${userId}`),
            async () => ({
                success: true,
                data: [
                    { id: 1, type: 'match', title: 'Nuevo match', message: 'Tienes un nuevo match con Juan', read: false, created_at: '2025-06-03T10:00:00Z' },
                    { id: 2, type: 'session', title: 'Sesión programada', message: 'Tu sesión con María es mañana', read: true, created_at: '2025-06-02T15:30:00Z' }
                ]
            })
        );
    }
}

// Exportar instancia singleton
export const apiClient = ApiClient.getInstance();

// Exportar también para compatibilidad
export default apiClient;
