package routes

import (
	"net/http"

	"skillswap/api/handlers" // Reemplaza con tu módulo

	"gorm.io/gorm"
)

func SetupRoutes(db *gorm.DB) *http.ServeMux {
	router := http.NewServeMux()
	usersHandler := handlers.NewUserHandler(db)
	abilitiesHandler := handlers.NewAbilityHandler(db)
	userAbilitiesHandler := handlers.NewUserAbilitiesHandler(db)
	matchesHandler := handlers.NewMatchesHandler(db) // Nuevo handler para Emparejamientos
	postsHandler := handlers.NewPostsHandler(db)     // Nuevo handler para Posts

	// users routes
	router.HandleFunc("GET /users", usersHandler.GetUsers)
	router.HandleFunc("POST /users", usersHandler.CreateUser)
	router.HandleFunc("GET /users/{id}", usersHandler.GetUser)
	router.HandleFunc("PUT /users/{id}", usersHandler.UpdateUser)
	router.HandleFunc("DELETE /users/{id}", usersHandler.DeleteUser)

	// abilities routes
	router.HandleFunc("GET /abilities", abilitiesHandler.GetAbilities)
	router.HandleFunc("POST /abilities", abilitiesHandler.CreateAbility)
	router.HandleFunc("GET /abilities/{id}", abilitiesHandler.GetAbility)
	router.HandleFunc("PUT /abilities/{id}", abilitiesHandler.UpdateAbility)
	router.HandleFunc("DELETE /abilities/{id}", abilitiesHandler.DeleteAbility)

	// user abilities routes
	router.HandleFunc("GET /userabilities", userAbilitiesHandler.GetUserAbilities)
	router.HandleFunc("POST /userabilities", userAbilitiesHandler.CreateUserAbilities)
	router.HandleFunc("GET /userabilities/{id}", userAbilitiesHandler.GetUserAbility)
	router.HandleFunc("PUT /userabilities/{id}", userAbilitiesHandler.UpdateUserAbility)
	router.HandleFunc("DELETE /userabilities/{id}", userAbilitiesHandler.DeleteUserAbility)

	// Rutas para Emparejamientos (Matches)
	router.HandleFunc("POST /matches/", matchesHandler.CreateMatch)
	router.HandleFunc("GET /matches/", matchesHandler.GetMatches)
	router.HandleFunc("GET /matches/{id}", matchesHandler.GetMatch)
	router.HandleFunc("PUT /matches/{id}", matchesHandler.UpdateMatch)
	router.HandleFunc("DELETE /matches/{id}", matchesHandler.DeleteMatch)
	router.HandleFunc("GET /users/{userID}/matches/", matchesHandler.GetMatchesByUserID) // Obtener emparejamientos de un usuario

	// Rutas para Posts
	router.HandleFunc("POST /posts/", postsHandler.CreatePost)
	router.HandleFunc("GET /posts/", postsHandler.GetPosts)
	router.HandleFunc("GET /posts/{id}", postsHandler.GetPost)
	router.HandleFunc("PUT /posts/{id}", postsHandler.UpdatePost)
	router.HandleFunc("DELETE /posts/{id}", postsHandler.DeletePost)
	router.HandleFunc("GET /users/{userID}/posts/", postsHandler.GetPostsByUserID) // Obtener publicaciones de un usuario

	return router
}
