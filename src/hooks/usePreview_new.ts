/**
 * Hook unificado para el modo preview
 * Proporciona datos mock cuando está en modo preview, datos reales cuando no
 */

import { useState, useEffect, useMemo } from 'react';
import { PREVIEW_MODE, debugLog } from '../config/app-config';
import { PreviewCache } from '../lib/preview-data';
import { previewApi } from '../lib/preview-api';
import { previewWebSocket } from '../lib/preview-websocket';
import previewFetchInterceptor from '../lib/preview-fetch-interceptor';

// Hook para obtener el estado del modo preview
export const usePreviewMode = () => {
    useEffect(() => {
        if (PREVIEW_MODE) {
            // Instalar interceptor de fetch en modo preview
            previewFetchInterceptor.install();
            debugLog('🔧 Interceptor de fetch instalado para modo preview');
        }
    }, []);

    return {
        isPreviewMode: PREVIEW_MODE,
        debugLog: (message: string, ...args: any[]) => {
            if (PREVIEW_MODE) {
                debugLog(message, ...args);
            }
        }
    };
};

// Hook para datos de usuario
export const usePreviewUser = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (PREVIEW_MODE) {
            const cache = PreviewCache.getInstance();
            const currentUser = cache.getCurrentUser();

            if (currentUser) {
                setUser(currentUser);
            } else {
                // Si no hay usuario autenticado, intentar recuperar de localStorage
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    try {
                        const parsedUser = JSON.parse(savedUser);
                        cache.setCurrentUser(parsedUser);
                        setUser(parsedUser);
                    } catch (e) {
                        debugLog('Error parsing saved user in preview mode:', e);
                    }
                }
            }

            setLoading(false);
        }
    }, []);

    return { user, loading, error, isPreviewMode: PREVIEW_MODE };
};

// Hook para posts
export const usePreviewPosts = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = async () => {
        if (!PREVIEW_MODE) return;

        try {
            setLoading(true);
            const result = await previewApi.getPosts();

            if (result.success) {
                setPosts(result.data || []);
            } else {
                setError(result.error || 'Error desconocido');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (PREVIEW_MODE) {
            fetchPosts();
        }
    }, []);

    const createPost = async (postData: any) => {
        if (!PREVIEW_MODE) return null;

        try {
            const result = await previewApi.createPost(postData);
            if (result.success) {
                setPosts(prev => [result.data, ...prev]);
                return result.data;
            }
            throw new Error(result.error);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            return null;
        }
    };

    const updatePost = async (id: number, updates: any) => {
        if (!PREVIEW_MODE) return false;

        try {
            const result = await previewApi.updatePost(id, updates);
            if (result.success) {
                setPosts(prev => prev.map(post =>
                    post.id === id ? { ...post, ...updates } : post
                ));
                return true;
            }
            throw new Error(result.error);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            return false;
        }
    };

    const deletePost = async (id: number) => {
        if (!PREVIEW_MODE) return false;

        try {
            const result = await previewApi.deletePost(id);
            if (result.success) {
                setPosts(prev => prev.filter(post => post.id !== id));
                return true;
            }
            throw new Error(result.error);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            return false;
        }
    };

    return {
        posts,
        loading,
        error,
        createPost,
        updatePost,
        deletePost,
        refetch: fetchPosts,
        isPreviewMode: PREVIEW_MODE
    };
};

// Hook para comentarios
export const usePreviewComments = (postId: number) => {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchComments = async () => {
        if (!PREVIEW_MODE || !postId) return;

        try {
            setLoading(true);
            const result = await previewApi.getCommentsByPostId(postId);

            if (result.success) {
                setComments(result.data || []);
            } else {
                setError(result.error || 'Error desconocido');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (PREVIEW_MODE && postId) {
            fetchComments();
        }
    }, [postId]);

    const addComment = async (content: string) => {
        if (!PREVIEW_MODE) return null;

        try {
            const result = await previewApi.createComment({
                contenido: content,
                post_id: postId
            });

            if (result.success) {
                setComments(prev => [...prev, result.data]);
                return result.data;
            }
            throw new Error(result.error);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            return null;
        }
    };

    const updateComment = async (id: number, content: string) => {
        if (!PREVIEW_MODE) return false;

        try {
            const result = await previewApi.updateComment(id, { contenido: content });
            if (result.success) {
                setComments(prev => prev.map(comment =>
                    comment.id === id ? { ...comment, contenido: content } : comment
                ));
                return true;
            }
            throw new Error(result.error);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            return false;
        }
    };

    const deleteComment = async (id: number) => {
        if (!PREVIEW_MODE) return false;

        try {
            const result = await previewApi.deleteComment(id);
            if (result.success) {
                setComments(prev => prev.filter(comment => comment.id !== id));
                return true;
            }
            throw new Error(result.error);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            return false;
        }
    };

    return {
        comments,
        loading,
        error,
        addComment,
        updateComment,
        deleteComment,
        refetch: fetchComments,
        isPreviewMode: PREVIEW_MODE
    };
};

// Hook para WebSocket
export const usePreviewWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any>(null);

    useEffect(() => {
        if (!PREVIEW_MODE) return;

        // Configurar event listeners
        previewWebSocket.on('connect', () => {
            setIsConnected(true);
            debugLog('Preview WebSocket connected');
        });

        previewWebSocket.on('disconnect', () => {
            setIsConnected(false);
            debugLog('Preview WebSocket disconnected');
        });

        previewWebSocket.on('new_message', (message: any) => {
            setLastMessage(message);
            debugLog('New message received:', message);
        });

        previewWebSocket.on('new_notification', (notification: any) => {
            debugLog('New notification received:', notification);
        });

        // Conectar automáticamente
        previewWebSocket.connect();

        // Cleanup
        return () => {
            previewWebSocket.disconnect();
            previewWebSocket.clearAllHandlers();
        };
    }, []);

    const sendMessage = (recipientId: number, content: string, matchId?: number) => {
        if (PREVIEW_MODE) {
            previewWebSocket.send('send_message', {
                recipientId,
                message: content,
                matchId
            });
        }
    };

    const joinRoom = (roomId: string) => {
        if (PREVIEW_MODE) {
            previewWebSocket.send('join_room', { room: roomId });
        }
    };

    const leaveRoom = (roomId: string) => {
        if (PREVIEW_MODE) {
            previewWebSocket.send('leave_room', { room: roomId });
        }
    };

    return {
        isConnected,
        lastMessage,
        sendMessage,
        joinRoom,
        leaveRoom,
        simulateMessage: (fromUserId: number, content: string, matchId?: number) => {
            if (PREVIEW_MODE) {
                previewWebSocket.simulateIncomingMessage(fromUserId, content, matchId);
            }
        },
        simulateNotification: (title: string, message: string, type?: string) => {
            if (PREVIEW_MODE) {
                previewWebSocket.simulateNotification(title, message, type);
            }
        },
        isPreviewMode: PREVIEW_MODE
    };
};

// Hook para notificaciones
export const usePreviewNotifications = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!PREVIEW_MODE) return;

        try {
            setLoading(true);
            const result = await previewApi.getNotifications();

            if (result.success) {
                const notifs = result.data || [];
                setNotifications(notifs);
                setUnreadCount(notifs.filter((n: any) => !n.leido).length);
            }
        } catch (err) {
            debugLog('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (PREVIEW_MODE) {
            fetchNotifications();
        }
    }, []);

    const markAsRead = async (id: number) => {
        if (!PREVIEW_MODE) return false;

        try {
            const result = await previewApi.markNotificationAsRead(id);
            if (result.success) {
                setNotifications(prev => prev.map(notif =>
                    notif.id === id ? { ...notif, leido: true } : notif
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
                return true;
            }
        } catch (err) {
            debugLog('Error marking notification as read:', err);
        }
        return false;
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        refetch: fetchNotifications,
        isPreviewMode: PREVIEW_MODE
    };
};

// Hook para matches
export const usePreviewMatches = () => {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMatches = async () => {
        if (!PREVIEW_MODE) {
            debugLog('Not in preview mode, skipping fetchMatches');
            return;
        }

        try {
            debugLog('Starting fetchMatches...');
            setLoading(true);
            setError(null);
            
            const result = await previewApi.getMatches();
            debugLog('getMatches result:', result);

            if (result.success) {
                setMatches(result.data || []);
                debugLog('Matches set successfully:', result.data);
            } else {
                const errorMsg = result.error || 'Error desconocido al obtener matches';
                setError(errorMsg);
                debugLog('Error in getMatches:', errorMsg);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMsg);
            debugLog('Exception in fetchMatches:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (PREVIEW_MODE) {
            fetchMatches();
        }
    }, []);

    const createMatch = async (usuario2_id: number, post_relacionado_id?: number) => {
        if (!PREVIEW_MODE) return null;

        try {
            const result = await previewApi.createMatch({
                usuario2_id,
                post_relacionado_id
            });

            if (result.success) {
                setMatches(prev => [...prev, result.data]);
                return result.data;
            }
        } catch (err) {
            debugLog('Error creating match:', err);
        }
        return null;
    };

    const updateMatch = async (id: number, estado: string) => {
        if (!PREVIEW_MODE) return false;

        try {
            const result = await previewApi.updateMatch(id, { estado });
            if (result.success) {
                setMatches(prev => prev.map(match =>
                    match.id === id ? { ...match, estado } : match
                ));
                return true;
            }
        } catch (err) {
            debugLog('Error updating match:', err);
        }
        return false;
    };

    return {
        matches,
        loading,
        error,
        createMatch,
        updateMatch,
        refetch: fetchMatches,
        isPreviewMode: PREVIEW_MODE
    };
};

// Hook para mensajes
export const usePreviewMessages = (userId?: number) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        if (!PREVIEW_MODE) return;

        try {
            setLoading(true);
            const result = await previewApi.getMessages(userId);

            if (result.success) {
                setMessages(result.data || []);
            }
        } catch (err) {
            debugLog('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (PREVIEW_MODE) {
            fetchMessages();
        }
    }, [userId]);

    const sendMessage = async (content: string, receptorId: number, matchId?: number) => {
        if (!PREVIEW_MODE) return null;

        try {
            const result = await previewApi.sendMessage({
                contenido: content,
                receptor_id: receptorId,
                match_id: matchId
            });

            if (result.success) {
                setMessages(prev => [...prev, result.data]);
                return result.data;
            }
        } catch (err) {
            debugLog('Error sending message:', err);
        }
        return null;
    };

    return {
        messages,
        loading,
        sendMessage,
        refetch: fetchMessages,
        isPreviewMode: PREVIEW_MODE
    };
};

// Hook de debugging para verificar datos mock
export const usePreviewDebug = () => {
    const verifyData = async () => {
        if (!PREVIEW_MODE) {
            debugLog('Not in preview mode');
            return null;
        }

        try {
            const result = await previewApi.verifyData();
            debugLog('Data verification result:', result);
            return result.data;
        } catch (err) {
            debugLog('Error verifying data:', err);
            return null;
        }
    };

    const initializeTestData = () => {
        if (!PREVIEW_MODE) return;
        
        previewApi.initializeTestData();
        debugLog('Test data reinitialized');
    };

    const testMatches = async () => {
        if (!PREVIEW_MODE) return null;

        try {
            const cache = PreviewCache.getInstance();
            const allMatches = cache.getMatches();
            debugLog('All matches in cache:', allMatches);

            const currentUser = cache.getCurrentUser();
            if (currentUser) {
                const userMatches = cache.getMatchesByUserId(currentUser.id);
                debugLog('Matches for current user:', userMatches);
                return userMatches;
            }
            
            return allMatches;
        } catch (err) {
            debugLog('Error testing matches:', err);
            return null;
        }
    };

    return {
        verifyData,
        initializeTestData,
        testMatches,
        isPreviewMode: PREVIEW_MODE
    };
};

// Hook principal que agrupa toda la funcionalidad
export const usePreview = () => {
    const cache = useMemo(() => PREVIEW_MODE ? PreviewCache.getInstance() : null, []);

    return {
        isPreviewMode: PREVIEW_MODE,
        cache,
        api: PREVIEW_MODE ? previewApi : null,
        webSocket: PREVIEW_MODE ? previewWebSocket : null,
        debugLog: PREVIEW_MODE ? debugLog : () => { },

        // Métodos de utilidad
        generateRandomData: () => {
            if (PREVIEW_MODE && previewApi) {
                previewApi.generateRandomData();
            }
        },

        clearCache: () => {
            if (PREVIEW_MODE && cache) {
                cache.clear();
            }
        },

        // Métodos de debugging
        verifyData: async () => {
            if (PREVIEW_MODE && previewApi) {
                return await previewApi.verifyData();
            }
            return null;
        },

        initializeTestData: () => {
            if (PREVIEW_MODE && previewApi) {
                previewApi.initializeTestData();
            }
        },

        // Simulaciones para testing
        simulateMessage: (fromUserId: number, content: string, matchId?: number) => {
            if (PREVIEW_MODE) {
                previewWebSocket.simulateIncomingMessage(fromUserId, content, matchId);
            }
        },

        simulateNotification: (title: string, message: string, type?: string) => {
            if (PREVIEW_MODE) {
                previewWebSocket.simulateNotification(title, message, type);
            }
        }
    };
};
