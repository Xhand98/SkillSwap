package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

// MockDataHandler proporciona datos de ejemplo cuando estamos en modo de prueba
type MockDataHandler struct {}

// NewMockDataHandler crea un nuevo handler para datos de ejemplo
func NewMockDataHandler() *MockDataHandler {
	return &MockDataHandler{}
}

// GetMockPosts devuelve datos de ejemplo de posts cuando estamos en modo de prueba
func (h *MockDataHandler) GetMockPosts(w http.ResponseWriter, r *http.Request) {
	// Establecer encabezados
	w.Header().Set("Content-Type", "application/json")

	// Crear algunos posts de ejemplo
	mockPosts := []map[string]interface{}{
		{
			"id_usuario": 1,
			"post_id": 1,
			"nombre_usuario": "Usuario Prueba",
			"nombre_habilidad": "Programación Go",
			"tipo_post": "OFREZCO",
			"descripcion": "Puedo enseñar programación en Go",
			"created_at": time.Now().AddDate(0, 0, -2).Format(time.RFC3339),
			"updated_at": time.Now().AddDate(0, 0, -2).Format(time.RFC3339),
		},
		{
			"id_usuario": 2,
			"post_id": 2,
			"nombre_usuario": "Otro Usuario",
			"nombre_habilidad": "Diseño Web",
			"tipo_post": "BUSCO",
			"descripcion": "Busco quien me enseñe diseño web moderno",
			"created_at": time.Now().AddDate(0, 0, -1).Format(time.RFC3339),
			"updated_at": time.Now().AddDate(0, 0, -1).Format(time.RFC3339),
		},
		{
			"id_usuario": 1,
			"post_id": 3,
			"nombre_usuario": "Usuario Prueba",
			"nombre_habilidad": "Fotografía",
			"tipo_post": "BUSCO",
			"descripcion": "Me gustaría aprender fotografía profesional",
			"created_at": time.Now().Format(time.RFC3339),
			"updated_at": time.Now().Format(time.RFC3339),
		},
	}

	// Crear respuesta con paginación simulada
	response := map[string]interface{}{
		"posts": mockPosts,
		"page": 1,
		"total_pages": 1,
		"total_posts": len(mockPosts),
	}

	// Devolver respuesta
	json.NewEncoder(w).Encode(response)
}

// GetMockUsers devuelve datos de ejemplo de usuarios cuando estamos en modo de prueba
func (h *MockDataHandler) GetMockUsers(w http.ResponseWriter, r *http.Request) {
	// Establecer encabezados
	w.Header().Set("Content-Type", "application/json")

	// Crear algunos usuarios de ejemplo
	mockUsers := []map[string]interface{}{
		{
			"id": 1,
			"nombre_usuario": "usuario_prueba",
			"primer_nombre": "Usuario",
			"segundo_nombre": "",
			"primer_apellido": "Prueba",
			"segundo_apellido": "",
			"correo_electronico": "usuario@ejemplo.com",
			"ciudad_trabajo": "Ciudad Ejemplo",
			"rol": "user",
		},
		{
			"id": 2,
			"nombre_usuario": "otro_usuario",
			"primer_nombre": "Otro",
			"segundo_nombre": "",
			"primer_apellido": "Usuario",
			"segundo_apellido": "",
			"correo_electronico": "otro@ejemplo.com",
			"ciudad_trabajo": "Ciudad Ejemplo",
			"rol": "user",
		},
	}

	// Devolver respuesta
	json.NewEncoder(w).Encode(mockUsers)
}

// CreateMockUser simula la creación de un usuario cuando estamos en modo de prueba
func (h *MockDataHandler) CreateMockUser(w http.ResponseWriter, r *http.Request) {
	// Establecer encabezados
	w.Header().Set("Content-Type", "application/json")

	// Leer el cuerpo de la solicitud
	var userData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&userData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Datos inválidos"})
		return
	}

	// Simular la creación exitosa de un usuario usando los datos recibidos
	mockUser := map[string]interface{}{
		"id": 999, // ID simulado
		"nombre_usuario": generateUsername(userData),
		"primer_nombre": getStringValue(userData, "primer_nombre", "Usuario"),
		"segundo_nombre": getStringValue(userData, "segundo_nombre", ""),
		"primer_apellido": getStringValue(userData, "primer_apellido", "Prueba"),
		"segundo_apellido": getStringValue(userData, "segundo_apellido", ""),
		"correo_electronico": getStringValue(userData, "correo_electronico", "usuario@ejemplo.com"),
		"ciudad_trabajo": getStringValue(userData, "ciudad_trabajo", "Ciudad Ejemplo"),
		"rol": "user",
		"created_at": time.Now().Format(time.RFC3339),
		"updated_at": time.Now().Format(time.RFC3339),
	}

	// Responder con código 201 (Created) y el usuario creado
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(mockUser)
}

// Función auxiliar para obtener valores string del mapa
func getStringValue(data map[string]interface{}, key, defaultValue string) string {
	if value, exists := data[key]; exists {
		if str, ok := value.(string); ok && str != "" {
			return str
		}
	}
	return defaultValue
}

// Función auxiliar para generar un nombre de usuario basado en los datos
func generateUsername(data map[string]interface{}) string {
	firstName := getStringValue(data, "primer_nombre", "usuario")
	lastName := getStringValue(data, "primer_apellido", "prueba")

	// Crear un nombre de usuario simple concatenando nombre y apellido
	username := firstName + "_" + lastName

	// Convertir a minúsculas y eliminar espacios
	username = strings.ToLower(strings.ReplaceAll(username, " ", "_"))

	return username
}

// LoginRequest estructura para la solicitud de login mock
type MockLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse estructura para la respuesta de login mock
type MockLoginResponse struct {
	Token     string                 `json:"token"`
	User      map[string]interface{} `json:"user"`
	ExpiresAt time.Time             `json:"expires_at"`
}

// MockLogin maneja la autenticación de usuarios en modo de prueba
func (h *MockDataHandler) MockLogin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var loginReq MockLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginReq); err != nil {
		http.Error(w, "Formato de solicitud inválido", http.StatusBadRequest)
		return
	}

	// En modo mock, aceptamos cualquier email/contraseña para facilitar las pruebas
	// Pero podemos crear algunos usuarios específicos de prueba
	var mockUser map[string]interface{}

	switch loginReq.Email {
	case "admin@skillswap.com":
		mockUser = map[string]interface{}{
			"id":                    1,
			"nombre_usuario":        "admin",
			"primer_nombre":         "Admin",
			"primer_apellido":       "Usuario",
			"correo_electronico":    "admin@skillswap.com",
			"ciudad_trabajo":        "Madrid",
			"rol":                   "admin",
			"created_at":           time.Now().AddDate(0, 0, -30).Format(time.RFC3339),
			"updated_at":           time.Now().Format(time.RFC3339),
		}
	case "test@skillswap.com":
		mockUser = map[string]interface{}{
			"id":                    2,
			"nombre_usuario":        "testuser",
			"primer_nombre":         "Usuario",
			"primer_apellido":       "Prueba",
			"correo_electronico":    "test@skillswap.com",
			"ciudad_trabajo":        "Barcelona",
			"rol":                   "user",
			"created_at":           time.Now().AddDate(0, 0, -15).Format(time.RFC3339),
			"updated_at":           time.Now().Format(time.RFC3339),
		}
	default:
		// Para cualquier otro email, crear un usuario dinámico
		emailParts := strings.Split(loginReq.Email, "@")
		username := emailParts[0]
		if strings.Contains(username, ".") {
			parts := strings.Split(username, ".")
			username = parts[0] + "_" + parts[1]
		}

		mockUser = map[string]interface{}{
			"id":                    999,
			"nombre_usuario":        username,
			"primer_nombre":         "Usuario",
			"primer_apellido":       "Demo",
			"correo_electronico":    loginReq.Email,
			"ciudad_trabajo":        "Ciudad Demo",
			"rol":                   "user",
			"created_at":           time.Now().AddDate(0, 0, -1).Format(time.RFC3339),
			"updated_at":           time.Now().Format(time.RFC3339),
		}
	}

	// Generar un token mock (en producción sería un JWT real)
	mockToken := "mock_jwt_token_" + time.Now().Format("20060102150405")
	expiresAt := time.Now().Add(24 * time.Hour)

	response := MockLoginResponse{
		Token:     mockToken,
		User:      mockUser,
		ExpiresAt: expiresAt,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// MockValidateToken valida un token en modo de prueba
func (h *MockDataHandler) MockValidateToken(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// En modo mock, cualquier token que comience con "mock_jwt_token_" es válido
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Token de autorización requerido", http.StatusUnauthorized)
		return
	}

	// Extraer el token del header "Bearer token"
	token := strings.TrimPrefix(authHeader, "Bearer ")

	if !strings.HasPrefix(token, "mock_jwt_token_") {
		http.Error(w, "Token inválido", http.StatusUnauthorized)
		return
	}

	// Retornar información del usuario para el token válido
	mockUser := map[string]interface{}{
		"id":                    999,
		"nombre_usuario":        "validated_user",
		"primer_nombre":         "Usuario",
		"primer_apellido":       "Validado",
		"correo_electronico":    "validated@skillswap.com",
		"ciudad_trabajo":        "Ciudad Demo",
		"rol":                   "user",
		"created_at":           time.Now().AddDate(0, 0, -1).Format(time.RFC3339),
		"updated_at":           time.Now().Format(time.RFC3339),
	}

	response := map[string]interface{}{
		"valid": true,
		"user":  mockUser,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
