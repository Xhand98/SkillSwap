package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"skillswap/api/config" // Asegúrate que esta ruta coincide con tu go.mod
	"skillswap/api/routes" // Importar el paquete de rutas

	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func main() {
	// Cargar variables de entorno desde .env
	if err := godotenv.Load(); err != nil {
		log.Println("Advertencia: No se pudo cargar el archivo .env:", err)
	}

	// Verificar si estamos en modo de prueba sin DB
	testMode := os.Getenv("TEST_MODE") == "true"

	var db *gorm.DB
	var err error

	if !testMode {
		log.Println("Iniciando conexión a la base de datos...")
		db, err = config.ConnectDB(config.NewDBConfig())
		if err != nil {
			log.Printf("Error al conectar con la base de datos: %v", err)
			log.Println("Iniciando en modo de prueba sin base de datos...")
			testMode = true
			// Actualizar la variable de entorno para consistencia
			os.Setenv("TEST_MODE", "true")
		} else {
			defer func() {
				if sqlDB, err := db.DB(); err == nil {
					sqlDB.Close()
				}
			}()


		}
	}

	// Configurar las rutas utilizando el paquete routes
	router := routes.SetupRoutes(db)

	// 3. Configurar e iniciar el servidor
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000" // Puerto predeterminado si no se especifica
	}

	server := &http.Server{
		Addr:    ":" + port,
		Handler: router, // Usar el router configurado
	}

	fmt.Println("==============================")
	fmt.Println("API de SkillSwap iniciada")
	fmt.Printf("Servidor escuchando en http://localhost:%s\n", port)
	fmt.Println("CORS configurado para permitir cualquier origen")
	fmt.Println("Métodos permitidos: GET, POST, PUT, DELETE, OPTIONS")
	fmt.Println("==============================")

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Error al iniciar el servidor: %v", err)
	}
}
