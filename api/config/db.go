package config

import (
	"fmt"
	"os"

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

func  ConnectionString(c *DBConfig) ([]string) {
	// con := "sqlserver://%s:%s@%s?database=%s", c.User, c.Password, c.Host, c.DBName
	return []string{"sqlserver://"+c.User+":"+c.Password+"@"+c.Host+"?"+"database="+c.DBName, "sqlserver://"+c.User+":"+c.Password+"@"+c.ErrHost+"?"+"database="+c.DBName}

}

func ConnectDB(config *DBConfig) (*gorm.DB, error) {
	db, err := gorm.Open(sqlserver.Open(ConnectionString(config)[0]), &gorm.Config{})
	if err != nil {
		fmt.Println("No se pudo conectar a el servidor principal... Cambiando a localhost.")
		db, _ = gorm.Open(sqlserver.Open(ConnectionString(config)[1]), &gorm.Config{})
	} else {
		fmt.Println("Sesion a base de datos iniciada con servidor principal.")
	}
	return db, nil
}
