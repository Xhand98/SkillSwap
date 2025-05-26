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

			// Crear tabla de sesiones si no existe (solo si tenemos conexión a la BD)
			tableSql := `
		IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Sesiones')
		BEGIN
			CREATE TABLE Sesiones (
				SesionID INT IDENTITY(1,1) PRIMARY KEY,
				EmparejamientoID INT NOT NULL,
				FechaHora DATETIME NOT NULL,
				Ubicacion NVARCHAR(255) NOT NULL,
				Notas NVARCHAR(500),
				Estado NVARCHAR(50) NOT NULL DEFAULT 'scheduled',
				FechaCreacion DATETIME DEFAULT GETDATE(),
				FechaActualizacion DATETIME DEFAULT GETDATE(),
				CONSTRAINT FK_Sesiones_Emparejamientos FOREIGN KEY (EmparejamientoID) REFERENCES Emparejamientos(EmparejamientoID)
			);
		END;

		IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_sesiones_emparejamiento')
		BEGIN
			CREATE INDEX idx_sesiones_emparejamiento ON Sesiones(EmparejamientoID);
		END;

		-- Crear tabla de notificaciones si no existe
		IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notificaciones')
		BEGIN
			CREATE TABLE Notificaciones (
				NotificacionID INT IDENTITY(1,1) PRIMARY KEY,
				UsuarioID INT NOT NULL,
				Tipo NVARCHAR(50) NOT NULL,
				Titulo NVARCHAR(100) NOT NULL,
				Contenido NVARCHAR(500) NOT NULL,
				ReferenciaID INT,
				FechaCreacion DATETIME DEFAULT GETDATE(),
				Leida BIT DEFAULT 0,
				FechaLectura DATETIME,
				CONSTRAINT FK_Notificaciones_Usuarios FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
			);
		END;

		IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_notificaciones_usuario')
		BEGIN
			CREATE INDEX idx_notificaciones_usuario ON Notificaciones(UsuarioID);
		END;

		IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_notificaciones_tipo')
		BEGIN
			CREATE INDEX idx_notificaciones_tipo ON Notificaciones(Tipo);
		END;	`

			if !testMode && db != nil {
				if err := db.Exec(tableSql).Error; err != nil {
					log.Printf("ADVERTENCIA: Error al crear tabla Sesiones: %v", err)
				} else {
					log.Println("✅ Tabla Sesiones verificada/creada correctamente")
				}
			}
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
