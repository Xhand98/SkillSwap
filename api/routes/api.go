package routes

import (
	"net/http"

	"skillswap/api/handlers" // Reemplaza con tu módulo

	"gorm.io/gorm"
)

func SetupRoutes(db *gorm.DB) *http.ServeMux {
	router := http.NewServeMux()
	itemHandler := handlers.NewUserHandler(db)

	// users routes
	router.HandleFunc("GET /users", itemHandler.GetUsers)
	router.HandleFunc("POST /users", itemHandler.CreateUser)
	router.HandleFunc("GET /users/{id}", itemHandler.GetUser)
	router.HandleFunc("PUT /users/{id}", itemHandler.UpdateUser)
	router.HandleFunc("DELETE /users/{id}", itemHandler.DeleteUser)

	return router
}
