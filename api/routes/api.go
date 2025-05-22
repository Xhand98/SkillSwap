package routes

import (
	"log"
	"net/http"

	"skillswap/api/handlers" // Reemplaza con tu módulo si es diferente

	"gorm.io/gorm"
)

// Middleware para habilitar CORS
func enableCORS(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Configura los orígenes permitidos. Para desarrollo, permitimos cualquier origen.
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        w.Header().Set("Content-Type", "application/json")

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

func SetupRoutes(db *gorm.DB) http.Handler { // Cambiado para devolver http.Handler
    router := http.NewServeMux()

    // Inicialización de handlers
    usersHandler := handlers.NewUserHandler(db)
    abilitiesHandler := handlers.NewAbilityHandler(db) // Asumiendo que tienes NewAbilityHandler
    userAbilitiesHandler := handlers.NewUserAbilitiesHandler(db)
    matchesHandler := handlers.NewMatchesHandler(db)
    postsHandler := handlers.NewPostsHandler(db)    // Rutas para Usuarios
    // Para las solicitudes GET, definimos la ruta con y sin trailing slash
    router.HandleFunc("GET /users", usersHandler.GetUsers)
    router.HandleFunc("GET /users/", usersHandler.GetUsers)
    // Para las solicitudes POST, también definimos la ruta con y sin trailing slash
    router.HandleFunc("POST /users", usersHandler.CreateUser)
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
    router.HandleFunc("GET /userabilities/user/{id}", userAbilitiesHandler.GetUserAbilitiesByUserID) // Ruta específica    // Rutas para Emparejamientos (Matches)



	// Rutas para matches
	router.HandleFunc("POST /matches/", matchesHandler.CreateMatch)
    router.HandleFunc("GET /matches/", matchesHandler.GetMatches) // Añadido trailing slash
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
    router.HandleFunc("GET /posts/", postsHandler.GetPosts)
    router.HandleFunc("GET /posts/{id}", postsHandler.GetPost)
    router.HandleFunc("PUT /posts/{id}", postsHandler.UpdatePost)
    router.HandleFunc("DELETE /posts/{id}", postsHandler.DeletePost)
    router.HandleFunc("GET /users/{userID}/posts/", postsHandler.GetPostsByUserID)

    // Envuelve el router con el middleware CORS
    return enableCORS(loggingMiddleware(router))
}
