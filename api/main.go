package main

import (
	"log"
	"net/http"

	"skillswap/api/config" // Asegúrate que esta ruta coincide con tu go.mod
	"skillswap/api/routes" // Importar el paquete de rutas

	"github.com/joho/godotenv"
)

func main() {
	// Cargar variables de entorno desde .env
	if err := godotenv.Load(); err != nil {
		log.Println("Advertencia: No se pudo cargar el archivo .env:", err)
	}

	log.Println("Iniciando conexión a la base de datos...")
	db, err := config.ConnectDB(config.NewDBConfig())
	if err != nil {
		log.Fatalf("Error fatal al conectar con la base de datos: %v", err)
	}
	defer func() {
		if sqlDB, err := db.DB(); err == nil {
			sqlDB.Close()
		}
	}()

	// Configurar las rutas utilizando el paquete routes
	 router := routes.SetupRoutes(db) // SetupRoutes ahora devuelve http.Handler
	// 3. Configurar e iniciar el servidor
	server := &http.Server{
		Addr:    ":8000",
		Handler: router, // Usar el router configurado
	}

	log.Println("Servidor iniciado en http://localhost" + server.Addr) // Corregido para concatenar correctamente
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Error al iniciar el servidor: %v", err)
	}
}
