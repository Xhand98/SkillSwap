/**
 * Servicio de API Mock para modo preview
 * Intercepta todas las llamadas a la API y devuelve datos simulados
 */

import { PreviewCache, generateRandomUser, generateRandomPost, type MockUser } from './preview-data';
import { PREVIEW_MODE, debugLog } from '../config/app-config';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export class PreviewApiService {
    private static instance: PreviewApiService;
    private cache: PreviewCache;

    private constructor() {
        this.cache = PreviewCache.getInstance();
    }

    static getInstance(): PreviewApiService {
        if (!PreviewApiService.instance) {
            PreviewApiService.instance = new PreviewApiService();
        }
        return PreviewApiService.instance;
    }

    // Simular delay de red
    private async simulateNetworkDelay(min: number = 200, max: number = 800): Promise<void> {
        const delay = Math.random() * (max - min) + min;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Autenticación
    async login(email: string, password: string): Promise<ApiResponse> {
        debugLog('Mock login attempt:', email);
        await this.simulateNetworkDelay();

        const user = this.cache.getUserByEmail(email);

        if (!user) {
            return {
                success: false,
                error: 'Usuario no encontrado'
            };
        }

        // En modo preview, cualquier contraseña es válida
        const token = `mock_token_${user.id}_${Date.now()}`;
        this.cache.setAuthToken(token);
        this.cache.setCurrentUser(user);

        // Guardar en localStorage para persistencia
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('currentUserId', user.id.toString());
            localStorage.setItem('user', JSON.stringify(user));
        }

        return {
            success: true,
            data: {
                token,
                user,
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
        };
    }

    async register(userData: any): Promise<ApiResponse> {
        debugLog('Mock register attempt:', userData.correo_electronico);
        await this.simulateNetworkDelay();

        // Verificar si el email ya existe
        const existingUser = this.cache.getUserByEmail(userData.correo_electronico);
        if (existingUser) {
            return {
                success: false,
                error: 'El correo electrónico ya está registrado'
            };
        }

        // Crear nuevo usuario
        const newUser: MockUser = {
            id: Date.now(),
            nombre_usuario: userData.nombre_usuario,
            primer_nombre: userData.primer_nombre,
            segundo_nombre: userData.segundo_nombre,
            primer_apellido: userData.primer_apellido,
            segundo_apellido: userData.segundo_apellido,
            correo_electronico: userData.correo_electronico,
            ciudad_trabajo: userData.ciudad_trabajo,
            rol: 'usuario',
            fecha_creacion: new Date().toISOString(),
            activo: true
        };

        this.cache.addUser(newUser);

        // Auto-login después del registro
        const token = `mock_token_${newUser.id}_${Date.now()}`;
        this.cache.setAuthToken(token);
        this.cache.setCurrentUser(newUser);

        // Guardar en localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('currentUserId', newUser.id.toString());
            localStorage.setItem('user', JSON.stringify(newUser));
        }

        return {
            success: true,
            data: {
                token,
                user: newUser,
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
        };
    }

    async logout(): Promise<ApiResponse> {
        debugLog('Mock logout');

        this.cache.setAuthToken(null);
        this.cache.setCurrentUser(null);

        // Limpiar localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('currentUserId');
            localStorage.removeItem('user');
        }

        return {
            success: true,
            message: 'Sesión cerrada correctamente'
        };
    }

    async checkSession(): Promise<ApiResponse> {
        const token = this.cache.getAuthToken();
        const user = this.cache.getCurrentUser();

        if (!token || !user) {
            // Intentar recuperar desde localStorage
            if (typeof window !== 'undefined') {
                const savedToken = localStorage.getItem('auth_token');
                const savedUser = localStorage.getItem('user');

                if (savedToken && savedUser) {
                    try {
                        const parsedUser = JSON.parse(savedUser);
                        this.cache.setAuthToken(savedToken);
                        this.cache.setCurrentUser(parsedUser);

                        return {
                            success: true,
                            data: { user: parsedUser, token: savedToken }
                        };
                    } catch (e) {
                        debugLog('Error parsing saved user:', e);
                    }
                }
            }

            return {
                success: false,
                error: 'No hay sesión activa'
            };
        }

        return {
            success: true,
            data: { user, token }
        };
    }

    // Usuarios
    async getUsers(): Promise<ApiResponse> {
        debugLog('Mock getUsers');
        await this.simulateNetworkDelay();

        return {
            success: true,
            data: this.cache.getUsers()
        };
    }

    async getUserById(id: number): Promise<ApiResponse> {
        debugLog('Mock getUserById:', id);
        await this.simulateNetworkDelay();

        const user = this.cache.getUserById(id);
        if (!user) {
            return {
                success: false,
                error: 'Usuario no encontrado'
            };
        }

        return {
            success: true,
            data: user
        };
    }

    async updateUser(id: number, updates: any): Promise<ApiResponse> {
        debugLog('Mock updateUser:', id, updates);
        await this.simulateNetworkDelay();

        const user = this.cache.getUserById(id);
        if (!user) {
            return {
                success: false,
                error: 'Usuario no encontrado'
            };
        }

        this.cache.updateUser(id, updates);
        const updatedUser = this.cache.getUserById(id);

        return {
            success: true,
            data: updatedUser
        };
    }

    // Posts
    async getPosts(): Promise<ApiResponse> {
        debugLog('Mock getPosts');
        await this.simulateNetworkDelay();

        return {
            success: true,
            data: this.cache.getPosts()
        };
    }

    async getPostById(id: number): Promise<ApiResponse> {
        debugLog('Mock getPostById:', id);
        await this.simulateNetworkDelay();

        const post = this.cache.getPostById(id);
        if (!post) {
            return {
                success: false,
                error: 'Publicación no encontrada'
            };
        }

        return {
            success: true,
            data: post
        };
    }

    async createPost(postData: any): Promise<ApiResponse> {
        debugLog('Mock createPost:', postData);
        await this.simulateNetworkDelay();

        const currentUser = this.cache.getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'No hay usuario autenticado'
            };
        }

        const newPost = {
            id: Date.now(),
            titulo: postData.titulo,
            descripcion: postData.descripcion,
            categoria: postData.categoria,
            usuario_id: currentUser.id,
            fecha_creacion: new Date().toISOString(),
            activo: true,
            ubicacion: postData.ubicacion || currentUser.ciudad_trabajo,
            tags: postData.tags || [],
            nivel_experiencia: postData.nivel_experiencia || 'Intermedio'
        };

        this.cache.addPost(newPost);

        return {
            success: true,
            data: newPost
        };
    }

    async updatePost(id: number, updates: any): Promise<ApiResponse> {
        debugLog('Mock updatePost:', id, updates);
        await this.simulateNetworkDelay();

        const post = this.cache.getPostById(id);
        if (!post) {
            return {
                success: false,
                error: 'Publicación no encontrada'
            };
        }

        this.cache.updatePost(id, updates);
        const updatedPost = this.cache.getPostById(id);

        return {
            success: true,
            data: updatedPost
        };
    }

    async deletePost(id: number): Promise<ApiResponse> {
        debugLog('Mock deletePost:', id);
        await this.simulateNetworkDelay();

        const post = this.cache.getPostById(id);
        if (!post) {
            return {
                success: false,
                error: 'Publicación no encontrada'
            };
        }

        this.cache.deletePost(id);

        return {
            success: true,
            message: 'Publicación eliminada correctamente'
        };
    }

    // Comentarios
    async getCommentsByPostId(postId: number): Promise<ApiResponse> {
        debugLog('Mock getCommentsByPostId:', postId);
        await this.simulateNetworkDelay();

        const comments = this.cache.getCommentsByPostId(postId);

        return {
            success: true,
            data: comments
        };
    }

    async createComment(commentData: any): Promise<ApiResponse> {
        debugLog('Mock createComment:', commentData);
        await this.simulateNetworkDelay();

        const currentUser = this.cache.getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'No hay usuario autenticado'
            };
        }

        const newComment = {
            id: Date.now(),
            contenido: commentData.contenido,
            usuario_id: currentUser.id,
            post_id: commentData.post_id,
            fecha_creacion: new Date().toISOString(),
            activo: true,
            likes: 0
        };

        this.cache.addComment(newComment);

        return {
            success: true,
            data: newComment
        };
    }

    async updateComment(id: number, updates: any): Promise<ApiResponse> {
        debugLog('Mock updateComment:', id, updates);
        await this.simulateNetworkDelay();

        const comment = this.cache.getComments().find(c => c.id === id);
        if (!comment) {
            return {
                success: false,
                error: 'Comentario no encontrado'
            };
        }

        this.cache.updateComment(id, updates);

        return {
            success: true,
            data: { ...comment, ...updates }
        };
    }

    async deleteComment(id: number): Promise<ApiResponse> {
        debugLog('Mock deleteComment:', id);
        await this.simulateNetworkDelay();

        this.cache.deleteComment(id);

        return {
            success: true,
            message: 'Comentario eliminado correctamente'
        };
    }

    // Matches
    async getMatches(): Promise<ApiResponse> {
        debugLog('Mock getMatches called');
        await this.simulateNetworkDelay();

        const currentUser = this.cache.getCurrentUser();
        if (!currentUser) {
            debugLog('No current user found for getMatches, using default user');
            // En modo preview, si no hay usuario autenticado, usar el usuario demo
            const defaultUser = this.cache.getUserById(1);
            if (defaultUser) {
                debugLog('Using default user:', defaultUser.id);
                this.cache.setCurrentUser(defaultUser);
                const matches = this.cache.getMatchesByUserId(defaultUser.id);
                debugLog('Found matches for default user:', matches);
                
                return {
                    success: true,
                    data: matches
                };
            } else {
                return {
                    success: false,
                    error: 'No hay usuario autenticado y no se encuentra el usuario por defecto'
                };
            }
        }

        debugLog('Getting matches for user:', currentUser.id);
        const matches = this.cache.getMatchesByUserId(currentUser.id);
        debugLog('Found matches:', matches);

        return {
            success: true,
            data: matches
        };
    }

    async createMatch(matchData: any): Promise<ApiResponse> {
        debugLog('Mock createMatch:', matchData);
        await this.simulateNetworkDelay();

        const currentUser = this.cache.getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'No hay usuario autenticado'
            };
        }

        const newMatch = {
            id: Date.now(),
            usuario1_id: currentUser.id,
            usuario2_id: matchData.usuario2_id,
            estado: 'pendiente' as const,
            fecha_creacion: new Date().toISOString(),
            post_relacionado_id: matchData.post_relacionado_id
        };

        this.cache.addMatch(newMatch);

        return {
            success: true,
            data: newMatch
        };
    }

    async updateMatch(id: number, updates: any): Promise<ApiResponse> {
        debugLog('Mock updateMatch:', id, updates);
        await this.simulateNetworkDelay();

        this.cache.updateMatch(id, updates);

        return {
            success: true,
            message: 'Match actualizado correctamente'
        };
    }

    // Mensajes
    async getMessages(userId?: number): Promise<ApiResponse> {
        debugLog('Mock getMessages:', userId);
        await this.simulateNetworkDelay();

        const currentUser = this.cache.getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'No hay usuario autenticado'
            };
        }

        let messages;
        if (userId) {
            messages = this.cache.getMessagesByUsers(currentUser.id, userId);
        } else {
            messages = this.cache.getMessages().filter(m =>
                m.emisor_id === currentUser.id || m.receptor_id === currentUser.id
            );
        }

        return {
            success: true,
            data: messages
        };
    }

    async sendMessage(messageData: any): Promise<ApiResponse> {
        debugLog('Mock sendMessage:', messageData);
        await this.simulateNetworkDelay();

        const currentUser = this.cache.getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'No hay usuario autenticado'
            };
        }

        const newMessage = {
            id: Date.now(),
            contenido: messageData.contenido,
            emisor_id: currentUser.id,
            receptor_id: messageData.receptor_id,
            fecha_envio: new Date().toISOString(),
            leido: false,
            match_id: messageData.match_id
        };

        this.cache.addMessage(newMessage);

        return {
            success: true,
            data: newMessage
        };
    }

    // Notificaciones
    async getNotifications(): Promise<ApiResponse> {
        debugLog('Mock getNotifications');
        await this.simulateNetworkDelay();

        const currentUser = this.cache.getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'No hay usuario autenticado'
            };
        }

        const notifications = this.cache.getNotificationsByUserId(currentUser.id);

        return {
            success: true,
            data: notifications
        };
    }

    async markNotificationAsRead(id: number): Promise<ApiResponse> {
        debugLog('Mock markNotificationAsRead:', id);
        await this.simulateNetworkDelay();

        this.cache.markNotificationAsRead(id);

        return {
            success: true,
            message: 'Notificación marcada como leída'
        };
    }

    // Health check
    async healthCheck(): Promise<ApiResponse> {
        debugLog('Mock healthCheck');

        return {
            success: true,
            data: {
                status: 'healthy',
                mode: 'preview',
                timestamp: new Date().toISOString(),
                message: 'API Mock funcionando correctamente'
            }
        };
    }

    // Utilidades para desarrollo
    generateRandomData(): void {
        debugLog('Generating random data...');

        // Añadir usuarios aleatorios
        for (let i = 0; i < 3; i++) {
            const randomUser = generateRandomUser();
            this.cache.addUser(randomUser);

            // Añadir posts para cada usuario nuevo
            const randomPost = generateRandomPost(randomUser.id);
            this.cache.addPost(randomPost);
        }
    }

    clearCache(): void {
        debugLog('Clearing cache...');
        this.cache.clear();
    }

    // Método de verificación para debugging
    async verifyData(): Promise<ApiResponse> {
        debugLog('Verifying preview data...');

        const cache = this.cache;
        const users = cache.getUsers();
        const posts = cache.getPosts();
        const matches = cache.getMatches();
        const comments = cache.getComments();
        const messages = cache.getMessages();
        const notifications = cache.getNotifications();

        const verification = {
            users: users.length,
            posts: posts.length,
            matches: matches.length,
            comments: comments.length,
            messages: messages.length,
            notifications: notifications.length,
            currentUser: cache.getCurrentUser()?.id || 'none'
        };

        debugLog('Preview data verification:', verification);

        return {
            success: true,
            data: verification
        };
    }

    // Inicializar datos de prueba
    initializeTestData(): void {
        debugLog('Initializing test data...');
        this.cache.clear();
        
        // Forzar recarga de datos mock
        const cache = PreviewCache.getInstance();
        cache.clear();
        
        debugLog('Test data initialized');
    }

    // Feed y estadísticas
    async getActivityFeed(limit: number = 10): Promise<ApiResponse> {
        debugLog('Mock getActivityFeed called');
        await this.simulateNetworkDelay();
        
        try {
            const feed = this.cache.getActivityFeed(limit);
            
            return {
                success: true,
                data: feed
            };
        } catch (error) {
            debugLog('Error generating activity feed:', error);
            return {
                success: false,
                error: 'Error al generar feed de actividad'
            };
        }
    }
    
    async getSystemStats(): Promise<ApiResponse> {
        debugLog('Mock getSystemStats called');
        await this.simulateNetworkDelay();
        
        try {
            const stats = this.cache.getSystemStats();
            
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            debugLog('Error getting system stats:', error);
            return {
                success: false,
                error: 'Error al obtener estadísticas del sistema'
            };
        }
    }
    
    async getRecommendedMatches(limit: number = 5): Promise<ApiResponse> {
        debugLog('Mock getRecommendedMatches called');
        await this.simulateNetworkDelay();
        
        const currentUser = this.cache.getCurrentUser();
        if (!currentUser) {
            debugLog('No current user found for getRecommendedMatches');
            // Usar un usuario por defecto
            const defaultUser = this.cache.getUserById(1);
            if (defaultUser) {
                const recommendations = this.cache.getRecommendedMatches(defaultUser.id, limit);
                return {
                    success: true,
                    data: recommendations
                };
            } else {
                return {
                    success: false,
                    error: 'No hay usuario autenticado'
                };
            }
        }
        
        debugLog('Getting recommended matches for user:', currentUser.id);
        const recommendations = this.cache.getRecommendedMatches(currentUser.id, limit);
        
        return {
            success: true,
            data: recommendations
        };
    }
    
    // Método para el feed de la página principal
    async getFeed(page: number = 1, limit: number = 10): Promise<ApiResponse> {
        debugLog(`Mock getFeed called (page ${page}, limit ${limit})`);
        await this.simulateNetworkDelay();
        
        try {
            // Obtener posts paginados
            const allPosts = this.cache.getPosts();
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const posts = allPosts.slice(startIndex, endIndex);
            
            // Añadir información del usuario a cada post
            const postsWithUserInfo = posts.map(post => {
                const user = this.cache.getUserById(post.usuario_id);
                const commentCount = this.cache.getCommentsByPostId(post.id).length;
                
                return {
                    ...post,
                    user: user ? {
                        id: user.id,
                        nombre_usuario: user.nombre_usuario,
                        nombre_completo: `${user.primer_nombre} ${user.primer_apellido}`,
                        ciudad: user.ciudad_trabajo
                    } : null,
                    comment_count: commentCount,
                    has_match: false // Por defecto
                };
            });
            
            return {
                success: true,
                data: {
                    items: postsWithUserInfo,
                    pagination: {
                        page,
                        limit,
                        total: allPosts.length,
                        has_more: endIndex < allPosts.length
                    }
                }
            };
        } catch (error) {
            debugLog('Error getting feed:', error);
            return {
                success: false,
                error: 'Error al obtener el feed'
            };
        }
    }
}

// Exportar instancia singleton
export const previewApi = PreviewApiService.getInstance();

// Función helper para verificar si estamos en modo preview
export const isPreviewMode = (): boolean => PREVIEW_MODE;

// Función para hacer llamadas condicionalmente
export const makeApiCall = async <T>(
    realApiCall: () => Promise<T>,
    mockApiCall: () => Promise<ApiResponse<T>>
): Promise<T> => {
    if (PREVIEW_MODE) {
        const result = await mockApiCall();
        if (!result.success) {
            throw new Error(result.error || 'Error en la API mock');
        }
        return result.data as T;
    }

    return realApiCall();
};
