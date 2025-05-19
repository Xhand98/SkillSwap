package config

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/sqlserver"
	"gorm.io/gorm"
)

type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	ErrHost  string
}

func NewDBConfig() *DBConfig {
	return &DBConfig{
		Host:     os.Getenv("DB_HOST"),
		Port:     os.Getenv("DB_PORT"),
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		DBName:   os.Getenv("DB_NAME"),
		ErrHost:  os.Getenv("ERR_HOST"),
	}
}

func ConnectionString(c *DBConfig) []string {
	// Validar que tengamos la información mínima necesaria
	if c.User == "" || c.Password == "" || c.DBName == "" {
		log.Printf("⚠️ Advertencia: Configuración de BD incompleta (usuario, contraseña o nombre de BD faltantes)")
	}

	// Formato para SQL Server: sqlserver://username:password@host:port?database=dbname&param=value
	primary := fmt.Sprintf("sqlserver://%s:%s@%s:%s?database=%s&trustServerCertificate=true&connection+timeout=3",
		c.User, c.Password, c.Host, c.Port, c.DBName)

	// Para el servidor secundario, usamos localhost si no está especificado ErrHost
	secondary := fmt.Sprintf("sqlserver://%s:%s@%s:%s?database=%s&trustServerCertificate=true&connection+timeout=5",
		c.User, c.Password, c.ErrHost, c.Port, c.DBName)

	// Loguear versiones ofuscadas de las cadenas de conexión para depuración
	log.Printf("📌 Cadena de conexión principal: sqlserver://%s:****@%s:%s?database=%s",
		c.User, c.Host, c.Port, c.DBName)
	log.Printf("📌 Cadena de conexión secundaria: sqlserver://%s:****@%s:%s?database=%s",
		c.User, c.ErrHost, c.Port, c.DBName)

	return []string{primary, secondary}
}

func ConnectDB(config *DBConfig) (*gorm.DB, error) {
	var lastErr error // Para guardar el error del intento principal si falla

	// Función para verificar conexión REAL
	verifyConnection := func(db *gorm.DB) error {
		// Obtener la conexión SQL subyacente con un timeout corto
		sqlDB, err := db.DB()
		if err != nil {
			return fmt.Errorf("error al obtener conexión subyacente: %w", err)
		}

		// Configurar tiempos de espera más cortos para la conexión SQL
		sqlDB.SetConnMaxLifetime(time.Minute * 3)
		sqlDB.SetConnMaxIdleTime(time.Minute * 1)
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(100)

		// Verificamos con ping rápido
		ctxPing, cancelPing := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancelPing()

		if err := sqlDB.PingContext(ctxPing); err != nil {
			return fmt.Errorf("ping fallido: %w", err)
		}

		// Consulta de prueba con timeout estricto
		ctxQuery, cancelQuery := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancelQuery()

		var result int
		if err := db.WithContext(ctxQuery).Raw("SELECT 1").Scan(&result).Error; err != nil {
			return fmt.Errorf("consulta de prueba fallida: %w", err)
		}

		if result != 1 {
			return errors.New("la consulta de prueba no devolvió el resultado esperado")
		}

		return nil
	}

	// 1. Intento con servidor principal
	log.Println("Intentando conectar al servidor principal...")
	primaryConnStr := ConnectionString(config)[0]

	// Hacer timeout corto para fallback más rápido en caso de host inexistente
	ctxPrimary, cancelPrimary := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancelPrimary()

	// Usar el contexto con timeout para la conexión principal
	db, err := gorm.Open(sqlserver.Open(primaryConnStr), &gorm.Config{})
	if err == nil {
		// La apertura principal de gorm.Open tuvo éxito, ahora verificar con timeout
		sqlDB, sqlErr := db.DB()
		if sqlErr == nil {
			// Usar PingContext con timeout
			pingErr := sqlDB.PingContext(ctxPrimary)
			if pingErr == nil {
				// Solo si el ping funciona, intentamos la verificación completa
				errVerify := verifyConnection(db)
				if errVerify == nil {
					log.Println("✅ Conexión VERIFICADA con servidor principal")
					return db, nil
				}
				lastErr = fmt.Errorf("conexión principal falló la verificación: %w", errVerify)
			} else {
				lastErr = fmt.Errorf("ping a servidor principal falló: %w", pingErr)
			}
		} else {
			lastErr = fmt.Errorf("error al obtener DB del pool: %w", sqlErr)
		}
		log.Printf("⚠️ %v", lastErr)
	} else {
		// La conexión principal de gorm.Open falló
		lastErr = fmt.Errorf("error al conectar a principal: %w", err)
		log.Printf("⚠️ %v", lastErr)
	}

	// 2. Si llegamos aquí, el intento de conexión principal (abrir o verificar) falló.
	// Intentar fallback al servidor secundario, pero solo si ErrHost está configurado.
	if config.ErrHost == "" {
		log.Println("Servidor secundario no configurado (ERR_HOST no está definido). No se intentará la conexión de respaldo.")
		return nil, lastErr // Devolver el error del intento principal
	}

	// 3. Intento con servidor secundario (fallback)
	log.Println("Intentando conectar al servidor secundario...")
	log.Printf("Usando host alternativo: %s", config.ErrHost)
	secondaryConnStr := ConnectionString(config)[1]

	// Volver a asignar db y err para el intento de conexión secundaria con timeout generoso
	ctxSecondary, cancelSecondary := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelSecondary()

	db, err = gorm.Open(sqlserver.Open(secondaryConnStr), &gorm.Config{})
	if err != nil {
		// La conexión secundaria falló al abrir
		return nil, fmt.Errorf("error al conectar a secundario (fallback): %w", err)
	}

	// Obtener objeto de conexión para configurarlo
	if sqlDB, err := db.DB(); err == nil {
		// Configurar para mejor rendimiento en servidor local
		sqlDB.SetConnMaxLifetime(time.Minute * 5)
		sqlDB.SetMaxIdleConns(5)
		sqlDB.SetMaxOpenConns(20)

		// Ping rápido para verificar respuesta básica
		if err := sqlDB.PingContext(ctxSecondary); err != nil {
			return nil, fmt.Errorf("ping a servidor secundario falló: %w", err)
		}
	}

	// La apertura secundaria de gorm.Open tuvo éxito, ahora verificar
	if errVerify := verifyConnection(db); errVerify != nil {
		// La conexión secundaria tuvo éxito, pero la verificación falló
		return nil, fmt.Errorf("conexión secundaria no verificada (fallback): %w", errVerify)
	}

	log.Println("✅ Conexión VERIFICADA con servidor secundario (fallback)")
	return db, nil
}
