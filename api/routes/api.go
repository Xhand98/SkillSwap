package routes

import (
	"log"
	"net/http"
	"os"

	"skillswap/api/handlers" // Reemplaza con tu módulo si es diferente
	"skillswap/api/middleware"

	"gorm.io/gorm"
)

// Middleware para habilitar CORS
func enableCORS(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // En producción, debes especificar exactamente los orígenes permitidos
        // Obtener dominio permitido desde variables de entorno o usar valor por defecto
        allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
        if allowedOrigin == "" {
            // Si no está configurado, permitimos cualquier origen (para desarrollo)
            allowedOrigin = "*"
        }

        // Debug de CORS
        log.Printf("CORS configurado con origen permitido: %s", allowedOrigin)

        w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

        // No configurar Content-Type para conexiones WebSocket
        if r.Header.Get("Upgrade") != "websocket" {
            w.Header().Set("Content-Type", "application/json")
        }

        // Si es una solicitud OPTIONS (preflight), solo envía los headers y OK.
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }

        // Pasa a la siguiente función en la cadena.
        next.ServeHTTP(w, r)
    })
}

// Middleware para registrar las solicitudes HTTP
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Printf("Solicitud recibida: %s %s desde %s", r.Method, r.URL.Path, r.RemoteAddr)
        for key, values := range r.Header {
            log.Printf("Header[%s] = %v", key, values)
        }

        // Si es POST, obtener el tamaño del cuerpo
        if r.Method == http.MethodPost {
            log.Printf("Content-Length: %d", r.ContentLength)
        }

        next.ServeHTTP(w, r)
    })
}

// Middleware específico para WebSocket que maneja CORS sin interferir con el upgrade
func webSocketCORS(next http.HandlerFunc) http.HandlerFunc {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Obtener dominio permitido desde variables de entorno o usar valor por defecto
        allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
        if allowedOrigin == "" {
            allowedOrigin = "*"
        }

        // Headers de CORS específicos para WebSocket
        w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Sec-WebSocket-Key, Sec-WebSocket-Version, Sec-WebSocket-Extensions, Sec-WebSocket-Protocol")

        // Si es una solicitud OPTIONS (preflight), solo envía los headers y OK.
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }

        // Log específico para WebSocket
        log.Printf("WebSocket request: %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)

        next.ServeHTTP(w, r)
    })
}

func SetupRoutes(db *gorm.DB) http.Handler { // Cambiado para devolver http.Handler
    router := http.NewServeMux()

    // Verificar si estamos en modo de prueba
    testMode := os.Getenv("TEST_MODE") == "true"    // Si estamos en modo de prueba, usar handlers mock para datos de ejemplo
    if testMode {
        log.Println("Iniciando en modo TEST_MODE: usando datos de prueba")
        mockHandler := handlers.NewMockDataHandler()

        // Rutas para datos mock
        router.HandleFunc("GET /posts/", mockHandler.GetMockPosts)
        router.HandleFunc("GET /posts", mockHandler.GetMockPosts)
        router.HandleFunc("GET /users/", mockHandler.GetMockUsers)
        router.HandleFunc("GET /users", mockHandler.GetMockUsers)
        router.HandleFunc("POST /users/", mockHandler.CreateMockUser)
        router.HandleFunc("POST /users", mockHandler.CreateMockUser)

        // Rutas para autenticación mock
        router.HandleFunc("POST /auth/login", mockHandler.MockLogin)
        router.HandleFunc("GET /auth/validate", mockHandler.MockValidateToken)

        // Ruta para health check
        router.HandleFunc("GET /health", handlers.HealthCheckHandler)

        return enableCORS(loggingMiddleware(router))
    }    // Inicialización de handlers normales cuando no estamos en modo de prueba
    usersHandler := handlers.NewUserHandler(db)
    abilitiesHandler := handlers.NewAbilityHandler(db)
    userAbilitiesHandler := handlers.NewUserAbilitiesHandler(db)
    matchesHandler := handlers.NewMatchesHandler(db)
    postsHandler := handlers.NewPostsHandler(db)
    authHandler := handlers.NewAuthHandler(db)
    auditHandler := handlers.NewAuditHandler(db)
    messagesHandler := handlers.NewMessagesHandler(db)
    commentsHandler := handlers.NewCommentHandler(db)    // Inicializar WebSocket hub y handler
    wsHub := handlers.NewHub(db)
    go wsHub.Run() // Ejecutar el hub en una goroutine separada
    wsHandler := handlers.NewWebSocketHandler(db, wsHub)
      // Configurar la conexión WebSocket en los handlers que la necesiten
    messagesHandler.SetWebSocketHandler(wsHandler)
    commentsHandler.SetWebSocketHandler(wsHandler)

    // Inicializar handler de pruebas Socket.IO
    socketIOTestHandler := handlers.NewSocketIOTestHandler()

    // Rutas para Usuarios
    // Para las solicitudes GET, definimos la ruta con y sin trailing slash
    router.HandleFunc("GET /users", usersHandler.GetUsers)
    router.HandleFunc("GET /users/", usersHandler.GetUsers)
    // Para las solicitudes POST, también definimos la ruta con y sin trailing slash
    router.HandleFunc("POST /users", usersHandler.CreateUser)
    router.HandleFunc("POST /users/", usersHandler.CreateUser)
    router.HandleFunc("GET /users/{id}", usersHandler.GetUser)
    router.HandleFunc("PUT /users/{id}", usersHandler.UpdateUser)
    router.HandleFunc("DELETE /users/{id}", usersHandler.DeleteUser)
    router.HandleFunc("GET /users/actions/ban/{id}", usersHandler.BanUser)

    // Rutas para Habilidades
    router.HandleFunc("GET /abilities/", abilitiesHandler.GetAbilities)
    router.HandleFunc("POST /abilities/", abilitiesHandler.CreateAbility)
    router.HandleFunc("GET /abilities/{id}", abilitiesHandler.GetAbility)
    router.HandleFunc("PUT /abilities/{id}", abilitiesHandler.UpdateAbility)
    router.HandleFunc("DELETE /abilities/{id}", abilitiesHandler.DeleteAbility)

    // Rutas para UserAbilities
    router.HandleFunc("GET /userabilities/", userAbilitiesHandler.GetUserAbilities)
    router.HandleFunc("POST /userabilities/", userAbilitiesHandler.CreateUserAbilities)
    router.HandleFunc("GET /userabilities/{id}", userAbilitiesHandler.GetUserAbility)
    router.HandleFunc("PUT /userabilities/{id}", userAbilitiesHandler.UpdateUserAbility)
    router.HandleFunc("DELETE /userabilities/{id}", userAbilitiesHandler.DeleteUserAbility)
    router.HandleFunc("GET /userabilities/user/{id}", userAbilitiesHandler.GetUserAbilitiesByUserID)

    // Rutas para matches
    router.HandleFunc("POST /matches/", matchesHandler.CreateMatch)
    router.HandleFunc("GET /matches/", matchesHandler.GetMatches)
    router.HandleFunc("GET /matches/check", matchesHandler.CheckMatchJSON)
    router.HandleFunc("GET /matches/{id}", matchesHandler.GetMatch)
    router.HandleFunc("PUT /matches/{id}", matchesHandler.UpdateMatch)
    router.HandleFunc("DELETE /matches/{id}", matchesHandler.DeleteMatch)
    router.HandleFunc("GET /users/{userID}/matches/", matchesHandler.GetMatchesByUserID)
    router.HandleFunc("GET /userabilities/matches/potential", matchesHandler.GetPotentialMatches)

    // Rutas para Posts
    // Para las solicitudes POST, definimos la ruta con y sin trailing slash
    router.HandleFunc("POST /posts", postsHandler.CreatePost)
    router.HandleFunc("POST /posts/", postsHandler.CreatePost)
    // Para las solicitudes GET, también definimos la ruta con y sin trailing slash
    router.HandleFunc("GET /posts", postsHandler.GetPosts)
    router.HandleFunc("GET /posts/", postsHandler.GetPosts)    // Rutas para autenticación
    router.HandleFunc("POST /auth/login", authHandler.Login)
    router.HandleFunc("GET /auth/validate", authHandler.ValidateToken)

    // Rutas para auditoría
    router.HandleFunc("GET /audit", auditHandler.GetAuditRecords)
    router.HandleFunc("GET /audit/", auditHandler.GetAuditRecords)
    router.HandleFunc("GET /posts/{id}", postsHandler.GetPost)
    router.HandleFunc("PUT /posts/{id}", postsHandler.UpdatePost)
    router.HandleFunc("DELETE /posts/{id}", postsHandler.DeletePost)
    router.HandleFunc("GET /users/{userID}/posts/", postsHandler.GetPostsByUserID)

    // Inicialización del handler de sesiones
    sessionsHandler := handlers.NewSessionsHandler(db)

    // Rutas para Sesiones
    router.HandleFunc("POST /sessions/", sessionsHandler.CreateSession)
    router.HandleFunc("GET /sessions/", sessionsHandler.GetSessions)
    router.HandleFunc("GET /sessions/{id}", sessionsHandler.GetSession)
    router.HandleFunc("PUT /sessions/{id}", sessionsHandler.UpdateSession)
    router.HandleFunc("DELETE /sessions/{id}", sessionsHandler.DeleteSession)
    router.HandleFunc("GET /matches/{matchID}/sessions/", sessionsHandler.GetSessionsByMatchID)

    // Inicialización del handler de notificaciones
    notificationsHandler := handlers.NewNotificationsHandler(db)    // Rutas para Notificaciones
    router.HandleFunc("GET /users/{userID}/notifications", notificationsHandler.GetUserNotifications)
    router.HandleFunc("PUT /notifications/{id}", notificationsHandler.MarkNotificationAsRead)
    router.HandleFunc("POST /sessions/{sessionID}/send-reminder", notificationsHandler.SendSessionReminder)
    router.HandleFunc("GET /system/upcoming-session-reminders", notificationsHandler.GetUpcomingSessionsReminders)

    // Rutas para Mensajería
    router.HandleFunc("POST /conversations", messagesHandler.CreateConversation)
    router.HandleFunc("POST /conversations/", messagesHandler.CreateConversation)
    router.HandleFunc("GET /users/{userID}/conversations", messagesHandler.GetUserConversations)
    router.HandleFunc("GET /conversations/{conversationID}", messagesHandler.GetConversation)
    router.HandleFunc("GET /conversations/{conversationID}/messages", messagesHandler.GetConversationMessages)
    router.HandleFunc("POST /conversations/{conversationID}/messages", messagesHandler.SendMessage)
    router.HandleFunc("PUT /messages/{messageID}/read", messagesHandler.MarkMessageAsRead)
    router.HandleFunc("PUT /conversations/{conversationID}/read", messagesHandler.MarkConversationAsRead)    // Rutas para Comentarios
    // GET no requiere autenticación, los demás sí
    router.HandleFunc("GET /posts/{postId}/comments", commentsHandler.GetPostComments)
    router.HandleFunc("GET /comments/{comentarioId}/replies", commentsHandler.GetCommentReplies)
    router.HandleFunc("GET /posts/{postId}/comments/stats", commentsHandler.GetPostCommentStats)

    // Rutas que requieren autenticación
    router.Handle("POST /posts/{postId}/comments", middleware.RequireAuthWrapper(commentsHandler.CreateComment))
    router.Handle("PUT /comments/{comentarioId}", middleware.RequireAuthWrapper(commentsHandler.UpdateComment))
    router.Handle("DELETE /comments/{comentarioId}", middleware.RequireAuthWrapper(commentsHandler.DeleteComment))
    router.Handle("POST /comments/{comentarioId}/like", middleware.RequireAuthWrapper(commentsHandler.LikeComment))    // Rutas para WebSocket con middleware específico
    router.HandleFunc("GET /ws", webSocketCORS(wsHandler.ServeWS))
    router.HandleFunc("GET /ws/status", wsHandler.GetWebSocketStatus)
    router.HandleFunc("GET /ws/clients", wsHandler.GetConnectedClients)

    // Rutas de prueba para Socket.IO
    router.HandleFunc("POST /api/test/socketio/message", socketIOTestHandler.TestSocketIOConnection)
    router.HandleFunc("POST /api/test/socketio/comment", socketIOTestHandler.TestSocketIOComment)
    router.HandleFunc("POST /api/test/socketio/typing", socketIOTestHandler.TestSocketIOTyping)
    router.HandleFunc("POST /api/test/socketio/custom", socketIOTestHandler.TestSocketIOCustomMessage)
    router.HandleFunc("GET /api/test/socketio/status", socketIOTestHandler.GetSocketIOStatus)

    // Ruta para health check
    router.HandleFunc("GET /health", handlers.HealthCheckHandler)

    // Envuelve el router con el middleware CORS
    return enableCORS(loggingMiddleware(router))
}
