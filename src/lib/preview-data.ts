/**
 * Datos mock para el modo preview
 * Este archivo contiene todos los datos simulados para que la aplicación funcione sin BD
 */

export interface MockUser {
    id: number;
    nombre_usuario: string;
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    correo_electronico: string;
    ciudad_trabajo: string;
    rol: string;
    fecha_creacion?: string;
    fecha_nacimiento?: string;
    activo?: boolean;
}

export interface MockPost {
    id: number;
    titulo: string;
    descripcion: string;
    categoria: string;
    usuario_id: number;
    fecha_creacion: string;
    activo: boolean;
    ubicacion?: string;
    tags?: string[];
    nivel_experiencia?: string;
}

export interface MockComment {
    id: number;
    contenido: string;
    usuario_id: number;
    post_id: number;
    fecha_creacion: string;
    activo: boolean;
    likes?: number;
}

export interface MockMatch {
    id: number;
    usuario1_id: number;
    usuario2_id: number;
    estado: 'pendiente' | 'aceptado' | 'rechazado';
    fecha_creacion: string;
    post_relacionado_id?: number;
}

export interface MockMessage {
    id: number;
    contenido: string;
    emisor_id: number;
    receptor_id: number;
    fecha_envio: string;
    leido: boolean;
    match_id?: number;
}

export interface MockNotification {
    id: number;
    usuario_id: number;
    titulo: string;
    mensaje: string;
    tipo: string;
    fecha_creacion: string;
    leido: boolean;
}

// Datos mock base
export const MOCK_USERS: MockUser[] = [
    {
        id: 1,
        nombre_usuario: "demo_user",
        primer_nombre: "Demo",
        primer_apellido: "User",
        correo_electronico: "demo@example.com",
        ciudad_trabajo: "Madrid",
        rol: "usuario",
        fecha_creacion: "2024-01-01T00:00:00Z",
        activo: true
    },
    {
        id: 2,
        nombre_usuario: "maria_dev",
        primer_nombre: "María",
        primer_apellido: "García",
        correo_electronico: "maria@example.com",
        ciudad_trabajo: "Barcelona",
        rol: "usuario",
        fecha_creacion: "2024-01-02T00:00:00Z",
        activo: true
    },
    {
        id: 3,
        nombre_usuario: "carlos_designer",
        primer_nombre: "Carlos",
        primer_apellido: "López",
        correo_electronico: "carlos@example.com",
        ciudad_trabajo: "Valencia",
        rol: "usuario",
        fecha_creacion: "2024-01-03T00:00:00Z",
        activo: true
    },
    {
        id: 4,
        nombre_usuario: "ana_marketing",
        primer_nombre: "Ana",
        primer_apellido: "Martínez",
        correo_electronico: "ana@example.com",
        ciudad_trabajo: "Sevilla",
        rol: "usuario",
        fecha_creacion: "2024-01-04T00:00:00Z",
        activo: true
    }
];

export const MOCK_POSTS: MockPost[] = [
    {
        id: 1,
        titulo: "Busco desarrollador React para proyecto personal",
        descripcion: "Necesito ayuda con un proyecto en React. Puedo enseñar diseño UX/UI a cambio.",
        categoria: "Desarrollo Web",
        usuario_id: 2,
        fecha_creacion: new Date(Date.now() - 86400000).toISOString(),
        activo: true,
        ubicacion: "Barcelona",
        tags: ["React", "JavaScript", "Frontend"],
        nivel_experiencia: "Intermedio"
    },
    {
        id: 2,
        titulo: "Intercambio: Marketing Digital por Desarrollo Backend",
        descripcion: "Soy experta en marketing digital y redes sociales. Busco aprender Node.js y bases de datos.",
        categoria: "Marketing",
        usuario_id: 4,
        fecha_creacion: new Date(Date.now() - 172800000).toISOString(),
        activo: true,
        ubicacion: "Sevilla",
        tags: ["Marketing", "Node.js", "SQL"],
        nivel_experiencia: "Principiante"
    },
    {
        id: 3,
        titulo: "Clases de diseño gráfico por Python",
        descripcion: "Tengo experiencia en Photoshop, Illustrator y Figma. Me gustaría aprender Python para automatización.",
        categoria: "Diseño",
        usuario_id: 3,
        fecha_creacion: new Date(Date.now() - 259200000).toISOString(),
        activo: true,
        ubicacion: "Valencia",
        tags: ["Photoshop", "Python", "Automatización"],
        nivel_experiencia: "Intermedio"
    },
    {
        id: 4,
        titulo: "Vue.js por diseño web",
        descripcion: "Intercambio conocimientos de Vue.js por diseño web responsive. Tengo 4 años de experiencia frontend.",
        categoria: "Desarrollo Web",
        usuario_id: 1,
        fecha_creacion: '2025-07-01T08:00:00.000Z',
        activo: true,
        ubicacion: "Madrid",
        tags: ["Vue.js", "Frontend", "Responsive"],
        nivel_experiencia: "Avanzado"
    },
    {
        id: 5,
        titulo: "Docker/Kubernetes por Git avanzado",
        descripcion: "DevOps con experiencia en contenedores busca profundizar en Git, workflows y CI/CD.",
        categoria: "DevOps",
        usuario_id: 3,
        fecha_creacion: '2025-06-30T15:30:00.000Z',
        activo: true,
        ubicacion: "Valencia",
        tags: ["Docker", "Kubernetes", "Git", "CI/CD"],
        nivel_experiencia: "Avanzado"
    }
];

export const MOCK_COMMENTS: MockComment[] = [
    {
        id: 1,
        contenido: "¡Me interesa mucho! Tengo experiencia en React y me gustaría aprender UX/UI.",
        usuario_id: 1,
        post_id: 1,
        fecha_creacion: new Date(Date.now() - 43200000).toISOString(),
        activo: true,
        likes: 2
    },
    {
        id: 2,
        contenido: "Perfecto, ¿podríamos hacer videollamadas para las sesiones?",
        usuario_id: 2,
        post_id: 1,
        fecha_creacion: new Date(Date.now() - 21600000).toISOString(),
        activo: true,
        likes: 1
    },
    {
        id: 3,
        contenido: "Hola Ana, soy desarrollador backend con Node.js. ¿Te interesaría intercambiar conocimientos?",
        usuario_id: 1,
        post_id: 2,
        fecha_creacion: new Date(Date.now() - 10800000).toISOString(),
        activo: true,
        likes: 3
    }
];

export const MOCK_MATCHES: MockMatch[] = [
    {
        id: 1,
        usuario1_id: 1,
        usuario2_id: 2,
        estado: 'aceptado',
        fecha_creacion: new Date(Date.now() - 86400000).toISOString(),
        post_relacionado_id: 1
    },
    {
        id: 2,
        usuario1_id: 1,
        usuario2_id: 4,
        estado: 'pendiente',
        fecha_creacion: new Date(Date.now() - 43200000).toISOString(),
        post_relacionado_id: 2
    },
    {
        id: 3,
        usuario1_id: 2,
        usuario2_id: 3,
        estado: 'aceptado',
        fecha_creacion: new Date(Date.now() - 172800000).toISOString(),
        post_relacionado_id: 3
    },
    {
        id: 4,
        usuario1_id: 3,
        usuario2_id: 1,
        estado: 'pendiente',
        fecha_creacion: new Date(Date.now() - 21600000).toISOString(),
        post_relacionado_id: 1
    },
    {
        id: 5,
        usuario1_id: 4,
        usuario2_id: 2,
        estado: 'rechazado',
        fecha_creacion: new Date(Date.now() - 259200000).toISOString(),
        post_relacionado_id: 2
    },
    {
        id: 6,
        usuario1_id: 1,
        usuario2_id: 3,
        estado: 'aceptado',
        fecha_creacion: '2025-07-01T08:30:00.000Z',
        post_relacionado_id: 3
    },
    {
        id: 7,
        usuario1_id: 2,
        usuario2_id: 4,
        estado: 'pendiente',
        fecha_creacion: '2025-07-01T11:15:00.000Z',
        post_relacionado_id: 2
    },
    {
        id: 8,
        usuario1_id: 3,
        usuario2_id: 4,
        estado: 'aceptado',
        fecha_creacion: '2025-06-30T19:45:00.000Z',
        post_relacionado_id: 1
    }
];

export const MOCK_MESSAGES: MockMessage[] = [
    {
        id: 1,
        contenido: "¡Hola! Me interesa tu propuesta de intercambio React por UX/UI",
        emisor_id: 1,
        receptor_id: 2,
        fecha_envio: new Date(Date.now() - 3600000).toISOString(),
        leido: true,
        match_id: 1
    },
    {
        id: 2,
        contenido: "¡Perfecto! ¿Cuándo podríamos empezar?",
        emisor_id: 2,
        receptor_id: 1,
        fecha_envio: new Date(Date.now() - 1800000).toISOString(),
        leido: false,
        match_id: 1
    },
    {
        id: 3,
        contenido: "Podríamos programar una videollamada esta semana para discutir cómo organizarnos",
        emisor_id: 1,
        receptor_id: 2,
        fecha_envio: new Date(Date.now() - 1500000).toISOString(),
        leido: false,
        match_id: 1
    },
    {
        id: 4,
        contenido: "Hola Carlos, vi tu perfil y me interesa mucho aprender Python. ¿Podríamos intercambiar conocimientos?",
        emisor_id: 1,
        receptor_id: 3,
        fecha_envio: new Date(Date.now() - 259000000).toISOString(),
        leido: true,
        match_id: 6
    },
    {
        id: 5,
        contenido: "Claro que sí, ¿qué te gustaría aprender específicamente?",
        emisor_id: 3,
        receptor_id: 1,
        fecha_envio: new Date(Date.now() - 258000000).toISOString(),
        leido: true,
        match_id: 6
    },
    {
        id: 6,
        contenido: "Hola Ana, tengo experiencia en Node.js. ¿Todavía estás interesada en aprender?",
        emisor_id: 1,
        receptor_id: 4,
        fecha_envio: new Date(Date.now() - 86000000).toISOString(),
        leido: true,
        match_id: 2
    },
    {
        id: 7,
        contenido: "Necesito ayuda con un módulo en específico para un proyecto que estoy desarrollando",
        emisor_id: 2,
        receptor_id: 3,
        fecha_envio: new Date(Date.now() - 172000000).toISOString(),
        leido: false,
        match_id: 3
    },
    {
        id: 8,
        contenido: "¿Qué tipo de proyecto estás trabajando? Quizás pueda darte algunas ideas",
        emisor_id: 3,
        receptor_id: 2,
        fecha_envio: new Date(Date.now() - 171000000).toISOString(),
        leido: false,
        match_id: 3
    }
];

export const MOCK_NOTIFICATIONS: MockNotification[] = [
    {
        id: 1,
        usuario_id: 1,
        titulo: "Nuevo match",
        mensaje: "María García ha aceptado tu solicitud de intercambio",
        tipo: "match",
        fecha_creacion: new Date(Date.now() - 3600000).toISOString(),
        leido: false
    },
    {
        id: 2,
        usuario_id: 1,
        titulo: "Nuevo comentario",
        mensaje: "Tienes un nuevo comentario en tu publicación",
        tipo: "comment",
        fecha_creacion: new Date(Date.now() - 7200000).toISOString(),
        leido: true
    },
    {
        id: 3,
        usuario_id: 1,
        titulo: "Nuevo mensaje",
        mensaje: "Has recibido un nuevo mensaje de María García",
        tipo: "message",
        fecha_creacion: new Date(Date.now() - 1800000).toISOString(),
        leido: false
    },
    {
        id: 4,
        usuario_id: 2,
        titulo: "Nueva solicitud de match",
        mensaje: "Demo User quiere intercambiar habilidades contigo",
        tipo: "match_request",
        fecha_creacion: new Date(Date.now() - 86400000).toISOString(),
        leido: true
    },
    {
        id: 5,
        usuario_id: 3,
        titulo: "Nuevo match",
        mensaje: "Demo User ha aceptado tu solicitud de intercambio",
        tipo: "match",
        fecha_creacion: new Date(Date.now() - 259000000).toISOString(),
        leido: true
    },
    {
        id: 6,
        usuario_id: 1,
        titulo: "Publicación popular",
        mensaje: "Tu publicación 'Vue.js por diseño web' está recibiendo mucha atención",
        tipo: "system",
        fecha_creacion: new Date(Date.now() - 43000000).toISOString(),
        leido: false
    }
];

// Funciones helper para generar datos aleatorios
export const generateRandomUser = (): MockUser => {
    const nombres = ["Ana", "Carlos", "María", "David", "Laura", "Miguel", "Sara", "Javier"];
    const apellidos = ["García", "López", "Martínez", "González", "Pérez", "Rodríguez", "Sánchez"];
    const ciudades = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao", "Málaga", "Zaragoza"];

    const id = Date.now() + Math.floor(Math.random() * 1000);
    const primerNombre = nombres[Math.floor(Math.random() * nombres.length)];
    const primerApellido = apellidos[Math.floor(Math.random() * apellidos.length)];
    const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)];

    return {
        id,
        nombre_usuario: `${primerNombre.toLowerCase()}_${id}`,
        primer_nombre: primerNombre,
        primer_apellido: primerApellido,
        correo_electronico: `${primerNombre.toLowerCase()}${id}@example.com`,
        ciudad_trabajo: ciudad,
        rol: "usuario",
        fecha_creacion: new Date().toISOString(),
        activo: true
    };
};

export const generateRandomPost = (userId: number): MockPost => {
    const titulos = [
        "Busco mentor en desarrollo web",
        "Intercambio diseño por programación",
        "Clases de marketing digital",
        "Aprende Python conmigo",
        "Necesito ayuda con React",
        "Enseño Photoshop"
    ];

    const categorias = ["Desarrollo Web", "Diseño", "Marketing", "Programación", "UX/UI"];

    return {
        id: Date.now() + Math.floor(Math.random() * 1000),
        titulo: titulos[Math.floor(Math.random() * titulos.length)],
        descripcion: "Descripción detallada del intercambio de habilidades que estoy buscando.",
        categoria: categorias[Math.floor(Math.random() * categorias.length)],
        usuario_id: userId,
        fecha_creacion: new Date().toISOString(),
        activo: true,
        ubicacion: MOCK_USERS.find(u => u.id === userId)?.ciudad_trabajo || "Madrid",
        tags: ["skill1", "skill2"],
        nivel_experiencia: "Intermedio"
    };
};

// Generar un feed de actividad reciente
export const generateActivityFeed = (numItems: number = 10): Array<any> => {
    const activityTypes = ['post_new', 'post_comment', 'match_created', 'match_accepted', 'user_joined'];
    const users = [...MOCK_USERS];
    const posts = [...MOCK_POSTS];
    
    return Array.from({ length: numItems }, (_, i) => {
        const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        const timestamp = new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)).toISOString();
        
        let activity: any = {
            id: Date.now() + i,
            type,
            user_id: user.id,
            user_name: `${user.primer_nombre} ${user.primer_apellido}`,
            timestamp
        };
        
        switch (type) {
            case 'post_new':
                const post = posts[Math.floor(Math.random() * posts.length)];
                activity.post_id = post.id;
                activity.post_title = post.titulo;
                activity.description = `${user.primer_nombre} ha publicado una nueva solicitud de intercambio: "${post.titulo}"`;
                break;
            case 'post_comment':
                const commentPost = posts[Math.floor(Math.random() * posts.length)];
                activity.post_id = commentPost.id;
                activity.post_title = commentPost.titulo;
                activity.description = `${user.primer_nombre} ha comentado en "${commentPost.titulo}"`;
                break;
            case 'match_created':
                const otherUser = users.filter(u => u.id !== user.id)[0];
                activity.target_user_id = otherUser.id;
                activity.target_user_name = `${otherUser.primer_nombre} ${otherUser.primer_apellido}`;
                activity.description = `${user.primer_nombre} ha solicitado un intercambio con ${otherUser.primer_nombre}`;
                break;
            case 'match_accepted':
                const matchUser = users.filter(u => u.id !== user.id)[0];
                activity.target_user_id = matchUser.id;
                activity.target_user_name = `${matchUser.primer_nombre} ${matchUser.primer_apellido}`;
                activity.description = `${user.primer_nombre} ha aceptado un intercambio con ${matchUser.primer_nombre}`;
                break;
            case 'user_joined':
                activity.description = `${user.primer_nombre} se ha unido a SkillSwap`;
                break;
        }
        
        return activity;
    });
};

// Generar estadísticas generales para dashboard
export const generateSystemStats = (): Record<string, any> => {
    return {
        total_users: MOCK_USERS.length,
        total_posts: MOCK_POSTS.length,
        total_matches: MOCK_MATCHES.length,
        total_active_users: MOCK_USERS.filter(u => u.activo).length,
        total_active_posts: MOCK_POSTS.filter(p => p.activo).length,
        matches_by_status: {
            accepted: MOCK_MATCHES.filter(m => m.estado === 'aceptado').length,
            pending: MOCK_MATCHES.filter(m => m.estado === 'pendiente').length,
            rejected: MOCK_MATCHES.filter(m => m.estado === 'rechazado').length,
        },
        popular_categories: [
            { name: "Desarrollo Web", count: 3 },
            { name: "Diseño", count: 2 },
            { name: "Marketing", count: 1 },
            { name: "DevOps", count: 1 },
        ],
        recent_activity: generateActivityFeed(5),
    };
};

// Cache en memoria para el modo preview
export class PreviewCache {
    private static instance: PreviewCache;
    private users: MockUser[] = [...MOCK_USERS];
    private posts: MockPost[] = [...MOCK_POSTS];
    private comments: MockComment[] = [...MOCK_COMMENTS];
    private matches: MockMatch[] = [...MOCK_MATCHES];
    private messages: MockMessage[] = [...MOCK_MESSAGES];
    private notifications: MockNotification[] = [...MOCK_NOTIFICATIONS];
    private currentUser: MockUser | null = null;
    private authToken: string | null = null;

    private constructor() { 
        this.initializeData();
    }

    private initializeData(): void {
        // Asegurar que tenemos datos mock iniciales
        if (this.users.length === 0) {
            this.users = [...MOCK_USERS];
        }
        if (this.posts.length === 0) {
            this.posts = [...MOCK_POSTS];
        }
        if (this.comments.length === 0) {
            this.comments = [...MOCK_COMMENTS];
        }
        if (this.matches.length === 0) {
            this.matches = [...MOCK_MATCHES];
        }
        if (this.messages.length === 0) {
            this.messages = [...MOCK_MESSAGES];
        }
        if (this.notifications.length === 0) {
            this.notifications = [...MOCK_NOTIFICATIONS];
        }
        
        console.log('[PREVIEW DATA] Initialized with:', {
            users: this.users.length,
            posts: this.posts.length,
            comments: this.comments.length,
            matches: this.matches.length,
            messages: this.messages.length,
            notifications: this.notifications.length
        });
    }

    static getInstance(): PreviewCache {
        if (!PreviewCache.instance) {
            PreviewCache.instance = new PreviewCache();
        }
        return PreviewCache.instance;
    }

    // Usuarios
    getUsers(): MockUser[] {
        return [...this.users];
    }

    getUserById(id: number): MockUser | undefined {
        return this.users.find(u => u.id === id);
    }

    getUserByEmail(email: string): MockUser | undefined {
        return this.users.find(u => u.correo_electronico === email);
    }

    addUser(user: MockUser): void {
        this.users.push(user);
    }

    updateUser(id: number, updates: Partial<MockUser>): void {
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updates };
        }
    }

    // Posts
    getPosts(): MockPost[] {
        return [...this.posts].sort((a, b) =>
            new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
        );
    }

    getPostById(id: number): MockPost | undefined {
        return this.posts.find(p => p.id === id);
    }

    getPostsByUserId(userId: number): MockPost[] {
        return this.posts.filter(p => p.usuario_id === userId);
    }

    addPost(post: MockPost): void {
        this.posts.push(post);
    }

    updatePost(id: number, updates: Partial<MockPost>): void {
        const index = this.posts.findIndex(p => p.id === id);
        if (index !== -1) {
            this.posts[index] = { ...this.posts[index], ...updates };
        }
    }

    deletePost(id: number): void {
        this.posts = this.posts.filter(p => p.id !== id);
    }

    // Comentarios
    getComments(): MockComment[] {
        return [...this.comments];
    }

    getCommentsByPostId(postId: number): MockComment[] {
        return this.comments.filter(c => c.post_id === postId);
    }

    addComment(comment: MockComment): void {
        this.comments.push(comment);
    }

    updateComment(id: number, updates: Partial<MockComment>): void {
        const index = this.comments.findIndex(c => c.id === id);
        if (index !== -1) {
            this.comments[index] = { ...this.comments[index], ...updates };
        }
    }

    deleteComment(id: number): void {
        this.comments = this.comments.filter(c => c.id !== id);
    }

    // Matches
    getMatches(): MockMatch[] {
        return [...this.matches];
    }

    getMatchesByUserId(userId: number): MockMatch[] {
        const userMatches = this.matches.filter(m => m.usuario1_id === userId || m.usuario2_id === userId);
        
        // Agregar información de depuración
        console.log(`[PREVIEW DATA] getMatchesByUserId(${userId}): encontrados ${userMatches.length} matches`);
        
        // Si no hay matches para este usuario y es un usuario mock conocido, crear algunos
        if (userMatches.length === 0 && this.getUserById(userId)) {
            console.log(`[PREVIEW DATA] Creando matches predeterminados para usuario ${userId}`);
            
            // Crear algunos matches predeterminados para este usuario
            const otherUsers = this.users.filter(u => u.id !== userId).slice(0, 2);
            
            otherUsers.forEach((otherUser, index) => {
                const newMatch: MockMatch = {
                    id: Date.now() + index,
                    usuario1_id: userId,
                    usuario2_id: otherUser.id,
                    estado: index === 0 ? 'aceptado' : 'pendiente',
                    fecha_creacion: new Date().toISOString(),
                    post_relacionado_id: (index + 1)
                };
                
                this.addMatch(newMatch);
                userMatches.push(newMatch);
            });
        }
        
        return userMatches;
    }

    addMatch(match: MockMatch): void {
        this.matches.push(match);
    }

    updateMatch(id: number, updates: Partial<MockMatch>): void {
        const index = this.matches.findIndex(m => m.id === id);
        if (index !== -1) {
            this.matches[index] = { ...this.matches[index], ...updates };
        }
    }

    // Mensajes
    getMessages(): MockMessage[] {
        return [...this.messages];
    }

    getMessagesByUsers(user1Id: number, user2Id: number): MockMessage[] {
        const messages = this.messages.filter(m =>
            (m.emisor_id === user1Id && m.receptor_id === user2Id) ||
            (m.emisor_id === user2Id && m.receptor_id === user1Id)
        );
        
        console.log(`[PREVIEW DATA] getMessagesByUsers(${user1Id}, ${user2Id}): encontrados ${messages.length} mensajes`);
        
        // Si no hay mensajes entre estos usuarios, crear algunos de ejemplo
        if (messages.length === 0) {
            console.log(`[PREVIEW DATA] Creando mensajes predeterminados entre usuarios ${user1Id} y ${user2Id}`);
            
            // Buscar si hay un match entre estos usuarios
            const match = this.matches.find(m => 
                (m.usuario1_id === user1Id && m.usuario2_id === user2Id) ||
                (m.usuario1_id === user2Id && m.usuario2_id === user1Id)
            );
            
            const matchId = match?.id;
            const user1 = this.getUserById(user1Id);
            const user2 = this.getUserById(user2Id);
            
            if (user1 && user2) {
                const newMessages = [
                    {
                        id: Date.now(),
                        contenido: `Hola ${user2.primer_nombre}, me interesa intercambiar habilidades contigo.`,
                        emisor_id: user1Id,
                        receptor_id: user2Id,
                        fecha_envio: new Date(Date.now() - 3600000).toISOString(),
                        leido: true,
                        match_id: matchId
                    },
                    {
                        id: Date.now() + 1,
                        contenido: `¡Hola ${user1.primer_nombre}! Claro, me encantaría. ¿Qué te gustaría aprender?`,
                        emisor_id: user2Id,
                        receptor_id: user1Id,
                        fecha_envio: new Date(Date.now() - 3500000).toISOString(),
                        leido: true,
                        match_id: matchId
                    },
                    {
                        id: Date.now() + 2,
                        contenido: "Podríamos organizar una videollamada para discutir los detalles.",
                        emisor_id: user1Id,
                        receptor_id: user2Id,
                        fecha_envio: new Date(Date.now() - 3400000).toISOString(),
                        leido: false,
                        match_id: matchId
                    }
                ];
                
                // Añadir los mensajes generados
                for (const message of newMessages) {
                    this.addMessage(message);
                    messages.push(message);
                }
            }
        }
        
        return messages;
    }

    addMessage(message: MockMessage): void {
        this.messages.push(message);
    }

    markMessageAsRead(id: number): void {
        const message = this.messages.find(m => m.id === id);
        if (message) {
            message.leido = true;
        }
    }

    // Notificaciones
    getNotifications(): MockNotification[] {
        return [...this.notifications];
    }

    getNotificationsByUserId(userId: number): MockNotification[] {
        const userNotifications = this.notifications.filter(n => n.usuario_id === userId);
        
        console.log(`[PREVIEW DATA] getNotificationsByUserId(${userId}): encontradas ${userNotifications.length} notificaciones`);
        
        // Si no hay notificaciones para este usuario, crear algunas de ejemplo
        if (userNotifications.length === 0 && this.getUserById(userId)) {
            console.log(`[PREVIEW DATA] Creando notificaciones predeterminadas para usuario ${userId}`);
            
            // Obtener matches del usuario para crear notificaciones contextuales
            const userMatches = this.getMatchesByUserId(userId);
            
            // Crear notificaciones predeterminadas
            const newNotifications = [
                {
                    id: Date.now(),
                    usuario_id: userId,
                    titulo: "Bienvenido a SkillSwap",
                    mensaje: "Gracias por unirte a nuestra plataforma. ¡Comienza a intercambiar habilidades!",
                    tipo: "system",
                    fecha_creacion: new Date(Date.now() - 86400000).toISOString(),
                    leido: true
                },
                {
                    id: Date.now() + 1,
                    usuario_id: userId,
                    titulo: "Completa tu perfil",
                    mensaje: "Añade tus habilidades y experiencia para mejorar tus posibilidades de match",
                    tipo: "system",
                    fecha_creacion: new Date(Date.now() - 43200000).toISOString(),
                    leido: false
                }
            ];
            
            // Añadir notificaciones de match si hay matches
            if (userMatches.length > 0) {
                const matchNotification = {
                    id: Date.now() + 2,
                    usuario_id: userId,
                    titulo: "Nuevo match potencial",
                    mensaje: "Hemos encontrado usuarios con habilidades complementarias a las tuyas",
                    tipo: "match_suggestion",
                    fecha_creacion: new Date(Date.now() - 21600000).toISOString(),
                    leido: false
                };
                newNotifications.push(matchNotification);
            }
            
            // Añadir las notificaciones generadas
            for (const notification of newNotifications) {
                this.addNotification(notification);
                userNotifications.push(notification);
            }
        }
        
        return userNotifications;
    }

    addNotification(notification: MockNotification): void {
        this.notifications.push(notification);
    }

    markNotificationAsRead(id: number): void {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.leido = true;
        }
    }

    // Autenticación
    setCurrentUser(user: MockUser | null): void {
        this.currentUser = user;
    }

    getCurrentUser(): MockUser | null {
        return this.currentUser;
    }

    setAuthToken(token: string | null): void {
        this.authToken = token;
    }

    getAuthToken(): string | null {
        return this.authToken;
    }

    // Utilidades
    clear(): void {
        this.users = [...MOCK_USERS];
        this.posts = [...MOCK_POSTS];
        this.comments = [...MOCK_COMMENTS];
        this.matches = [...MOCK_MATCHES];
        this.messages = [...MOCK_MESSAGES];
        this.notifications = [...MOCK_NOTIFICATIONS];
        this.currentUser = null;
        this.authToken = null;
    }
    
    // Feed y estadísticas
    getActivityFeed(numItems: number = 10): Array<any> {
        return generateActivityFeed(numItems);
    }
    
    getSystemStats(): Record<string, any> {
        return generateSystemStats();
    }
    
    // Recomendaciones de matches potenciales para un usuario
    getRecommendedMatches(userId: number, limit: number = 5): Array<any> {
        const user = this.getUserById(userId);
        if (!user) return [];
        
        // Obtener usuarios que no tienen match con el usuario actual
        const existingMatchUserIds = this.getMatchesByUserId(userId).flatMap(m => 
            [m.usuario1_id, m.usuario2_id]
        );
        
        const potentialMatches = this.users.filter(u => 
            u.id !== userId && !existingMatchUserIds.includes(u.id)
        );
        
        // Si no hay suficientes usuarios, generar algunos aleatorios
        if (potentialMatches.length < limit) {
            const neededUsers = limit - potentialMatches.length;
            for (let i = 0; i < neededUsers; i++) {
                const newUser = generateRandomUser();
                this.addUser(newUser);
                potentialMatches.push(newUser);
            }
        }
        
        // Limitar al número solicitado y añadir información de compatibilidad
        return potentialMatches.slice(0, limit).map(u => {
            // Simular porcentaje de compatibilidad
            const compatibilityScore = Math.floor(Math.random() * 41) + 60; // 60-100%
            
            return {
                user: u,
                compatibility: compatibilityScore,
                common_interests: ["JavaScript", "Diseño Web", "React"].slice(0, Math.floor(Math.random() * 3) + 1)
            };
        });
    }
}
