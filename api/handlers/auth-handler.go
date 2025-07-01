package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"skillswap/api/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type authHandler struct {
	DB         *gorm.DB
	JWTSecret  []byte
	JWTExpires time.Duration
}


func NewAuthHandler(db *gorm.DB) *authHandler {
    // Obtener clave desde variable de entorno, o usar una por defecto para desarrollo
    jwtSecret := os.Getenv("JWT_SECRET_KEY")
    if jwtSecret == "" {
        // Solo para desarrollo, mostrar advertencia
        log.Println("ADVERTENCIA: JWT_SECRET_KEY no está configurado. Usando clave por defecto (¡NO HACER ESTO EN PRODUCCIÓN!)")
        jwtSecret = "8/4oxdZ6LwDpJ6R1nJgkVh4xtAwHE6mg+2kwj0RcyYw="
    }

    return &authHandler{
        DB:         db,
        JWTSecret:  []byte(jwtSecret),
        JWTExpires: 24 * time.Hour, // Token válido por 24 horas
    }
}
// LoginRequest estructura para la solicitud de login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse estructura para la respuesta de login
type LoginResponse struct {
	Token    string       `json:"token"`
	User     models.User  `json:"user"`
	ExpiresAt time.Time   `json:"expires_at"`
}

// Login maneja la autenticación de usuarios
func (h *authHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var loginReq LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginReq); err != nil {
		log.Printf("Error al decodificar solicitud de login: %v", err)
		http.Error(w, "Formato de solicitud inválido", http.StatusBadRequest)
		return
	}

	// Buscar usuario por email
	var user models.User
	result := h.DB.Where("CorreoElectronico = ?", loginReq.Email).First(&user)
	if result.Error != nil {
		log.Printf("Usuario no encontrado para email %s: %v", loginReq.Email, result.Error)
		http.Error(w, "Credenciales inválidas", http.StatusUnauthorized)
		return
	}

	// Verificar contraseña
	err := bcrypt.CompareHashAndPassword([]byte(user.HashContrasena), []byte(loginReq.Password))
	if err != nil {
		log.Printf("Contraseña incorrecta para usuario %s: %v", loginReq.Email, err)
		http.Error(w, "Credenciales inválidas", http.StatusUnauthorized)
		return
	}

	// Generar token JWT
	expiresAt := time.Now().Add(h.JWTExpires)
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.CorreoElectronico,
		"exp":     expiresAt.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(h.JWTSecret)
	if err != nil {
		log.Printf("Error al firmar token JWT: %v", err)
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		return
	}

	// No devolver la contraseña hash
	user.HashContrasena = ""

	// Devolver token y datos del usuario
	response := LoginResponse{
		Token:    tokenString,
		User:     user,
		ExpiresAt: expiresAt,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// ValidateToken verifica si un token JWT es válido
func (h *authHandler) ValidateToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Obtener token del encabezado Authorization
	tokenString := r.Header.Get("Authorization")
	if tokenString == "" {
		http.Error(w, "Token no proporcionado", http.StatusUnauthorized)
		return
	}

	// Si el token comienza con "Bearer ", eliminar ese prefijo
	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}

	// Validar token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return h.JWTSecret, nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Token inválido", http.StatusUnauthorized)
		return
	}

	// Obtener claims del token
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Error al procesar el token", http.StatusInternalServerError)
		return
	}

	// Obtener ID de usuario desde claims
	userID, ok := claims["user_id"].(float64)
	if !ok {
		http.Error(w, "Token malformado", http.StatusBadRequest)
		return
	}

	// Buscar usuario por ID
	var user models.User
	if result := h.DB.First(&user, uint(userID)); result.Error != nil {
		http.Error(w, "Usuario no encontrado", http.StatusNotFound)
		return
	}

	// No devolver la contraseña hash
	user.HashContrasena = ""

	// Devolver datos del usuario
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}
