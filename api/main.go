package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"skillswap/api/config"
	"skillswap/api/routes" // Importar el paquete de rutas

	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func main() {
	// Cargar variables de entorno desde .env
	if err := godotenv.Load(); err != nil {
		log.Println("Advertencia: No se pudo cargar el archivo .env:", err)
	}

	var db *gorm.DB
	// Conectar a la base de datos PostgreSQL
	dbCfg := config.NewDBConfig()
	connectedDB, err := config.ConnectDB(dbCfg)
	if err != nil {
		log.Printf("❌ No se pudo conectar a la base de datos: %v", err)
	} else {
		db = connectedDB
		log.Println("✅ Conexión a PostgreSQL establecida")
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
