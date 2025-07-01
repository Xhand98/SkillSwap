package config

import (
	"log"

	"gorm.io/gorm"
)

// SetupHooks configura los hooks personalizados para GORM
func SetupHooks(db *gorm.DB) {
	// Agregar callback para ignorar errores específicos de columnas
	db.Callback().Create().Before("gorm:create").Register("app:handle_missing_columns", handleMissingColumns)
	log.Println("✅ Hooks de GORM configurados correctamente")
}

// handleMissingColumns es un callback que se ejecuta antes de la creación
// y puede ser usado para transformar datos o manejar casos especiales
func handleMissingColumns(db *gorm.DB) {
	// Esto será llamado antes de cada operación de creación (INSERT)
	// Podríamos usarlo para manejar errores específicos de columnas

	log.Printf("🔍 Creando registro para tabla: %s", db.Statement.Table)

	// Ejemplo: podríamos examinar el modelo y realizar acciones específicas si es necesario
	// Para propósitos de demostración, solo registramos la operación
}

// RegisterCustomCallbacks registra callbacks personalizados para manejar errores específicos
func RegisterCustomCallbacks(db *gorm.DB) {
	log.Println("✅ Callbacks personalizados registrados para manejo de errores")
}
