package routes

import (
	"net/http"

	"skillswap/api/handlers" // Reemplaza con tu módulo si es diferente

	"gorm.io/gorm"
)

// Middleware para habilitar CORS
func enableCORS(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Configura los orígenes permitidos. Para desarrollo, localhost:3000.
        // Para producción, reemplaza esto con el dominio de tu frontend.
        w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With") // Añade otros headers si los usas

        // Si es una solicitud OPTIONS (preflight), solo envía los headers y OK.
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }

        // Pasa a la siguiente función en la cadena.
        next.ServeHTTP(w, r)
    })
}

func SetupRoutes(db *gorm.DB) http.Handler { // Cambiado para devolver http.Handler
    router := http.NewServeMux()

    // Inicialización de handlers
    usersHandler := handlers.NewUserHandler(db)
    abilitiesHandler := handlers.NewAbilityHandler(db) // Asumiendo que tienes NewAbilityHandler
    userAbilitiesHandler := handlers.NewUserAbilitiesHandler(db)
    matchesHandler := handlers.NewMatchesHandler(db)
    postsHandler := handlers.NewPostsHandler(db)

    // Rutas para Usuarios
    router.HandleFunc("GET /users/", usersHandler.GetUsers) // Añadido trailing slash para consistencia
    router.HandleFunc("POST /users/", usersHandler.CreateUser)
    router.HandleFunc("GET /users/{id}", usersHandler.GetUser)
    router.HandleFunc("PUT /users/{id}", usersHandler.UpdateUser)
    router.HandleFunc("DELETE /users/{id}", usersHandler.DeleteUser)

    // Rutas para Habilidades
    router.HandleFunc("GET /abilities/", abilitiesHandler.GetAbilities) // Añadido trailing slash
    router.HandleFunc("POST /abilities/", abilitiesHandler.CreateAbility)
    router.HandleFunc("GET /abilities/{id}", abilitiesHandler.GetAbility)
    router.HandleFunc("PUT /abilities/{id}", abilitiesHandler.UpdateAbility)
    router.HandleFunc("DELETE /abilities/{id}", abilitiesHandler.DeleteAbility)

    // Rutas para UserAbilities
    router.HandleFunc("GET /userabilities/", userAbilitiesHandler.GetUserAbilities) // Añadido trailing slash
    router.HandleFunc("POST /userabilities/", userAbilitiesHandler.CreateUserAbilities)
    router.HandleFunc("GET /userabilities/{id}", userAbilitiesHandler.GetUserAbility)
    router.HandleFunc("PUT /userabilities/{id}", userAbilitiesHandler.UpdateUserAbility)
    router.HandleFunc("DELETE /userabilities/{id}", userAbilitiesHandler.DeleteUserAbility)
    router.HandleFunc("GET /userabilities/user/{id}", userAbilitiesHandler.GetUserAbilitiesByUserID) // Ruta específica

    // Rutas para Emparejamientos (Matches)
    router.HandleFunc("POST /matches/", matchesHandler.CreateMatch)
    router.HandleFunc("GET /matches/", matchesHandler.GetMatches) // Añadido trailing slash
    router.HandleFunc("GET /matches/{id}", matchesHandler.GetMatch)
    router.HandleFunc("PUT /matches/{id}", matchesHandler.UpdateMatch)
    router.HandleFunc("DELETE /matches/{id}", matchesHandler.DeleteMatch)
    router.HandleFunc("GET /users/{userID}/matches/", matchesHandler.GetMatchesByUserID)

    // Rutas para Posts
    router.HandleFunc("POST /posts/", postsHandler.CreatePost)
    router.HandleFunc("GET /posts/", postsHandler.GetPosts) // Añadido trailing slash
    router.HandleFunc("GET /posts/{id}", postsHandler.GetPost)
    router.HandleFunc("PUT /posts/{id}", postsHandler.UpdatePost)
    router.HandleFunc("DELETE /posts/{id}", postsHandler.DeletePost)
    router.HandleFunc("GET /users/{userID}/posts/", postsHandler.GetPostsByUserID)

    // Envuelve el router con el middleware CORS
    return enableCORS(router)
}
