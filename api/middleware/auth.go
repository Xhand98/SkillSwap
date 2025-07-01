package middleware

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

// AuthContext estructura para almacenar información del usuario en el contexto
type AuthContext struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
}

// ContextKey es el tipo para las claves del contexto
type ContextKey string

const UserContextKey ContextKey = "user"

// AuthMiddleware middleware para validar tokens JWT
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Obtener token del encabezado Authorization
		tokenString := r.Header.Get("Authorization")
		if tokenString == "" {
			http.Error(w, "Token de autorización requerido", http.StatusUnauthorized)
			return
		}

		// Si el token comienza con "Bearer ", eliminar ese prefijo
		if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
			tokenString = tokenString[7:]
		}

		// Obtener clave secreta
		jwtSecret := os.Getenv("JWT_SECRET_KEY")
		if jwtSecret == "" {
			// Solo para desarrollo
			jwtSecret = "8/4oxdZ6LwDpJ6R1nJgkVh4xtAwHE6mg+2kwj0RcyYw="
		}

		// Validar token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Verificar que el método de firma sea el esperado
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				log.Printf("Método de firma inesperado: %v", token.Header["alg"])
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			log.Printf("Token inválido: %v", err)
			http.Error(w, "Token inválido", http.StatusUnauthorized)
			return
		}

		// Obtener claims del token
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			log.Printf("Error al procesar claims del token")
			http.Error(w, "Error al procesar el token", http.StatusInternalServerError)
			return
		}

		// Obtener ID de usuario desde claims
		userID, ok := claims["user_id"].(float64)
		if !ok {
			log.Printf("user_id no encontrado en claims del token")
			http.Error(w, "Token malformado", http.StatusBadRequest)
			return
		}

		// Obtener email desde claims
		email, ok := claims["email"].(string)
		if !ok {
			log.Printf("email no encontrado en claims del token")
			http.Error(w, "Token malformado", http.StatusBadRequest)
			return
		}

		// Agregar información del usuario al contexto
		userContext := AuthContext{
			UserID: uint(userID),
			Email:  email,
		}

		ctx := context.WithValue(r.Context(), UserContextKey, userContext)
		r = r.WithContext(ctx)

		// Continuar con el siguiente handler
		next.ServeHTTP(w, r)
	})
}

// OptionalAuthMiddleware middleware opcional para extraer información de usuario si está disponible
func OptionalAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Obtener token del encabezado Authorization
		tokenString := r.Header.Get("Authorization")

		// Si no hay token, continuar sin autenticación
		if tokenString == "" {
			next.ServeHTTP(w, r)
			return
		}

		// Si el token comienza con "Bearer ", eliminar ese prefijo
		if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
			tokenString = tokenString[7:]
		}

		// Obtener clave secreta
		jwtSecret := os.Getenv("JWT_SECRET_KEY")
		if jwtSecret == "" {
			// Solo para desarrollo
			jwtSecret = "8/4oxdZ6LwDpJ6R1nJgkVh4xtAwHE6mg+2kwj0RcyYw="
		}

		// Validar token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(jwtSecret), nil
		})

		// Si el token es válido, agregar información al contexto
		if err == nil && token.Valid {
			if claims, ok := token.Claims.(jwt.MapClaims); ok {
				if userID, ok := claims["user_id"].(float64); ok {
					if email, ok := claims["email"].(string); ok {
						userContext := AuthContext{
							UserID: uint(userID),
							Email:  email,
						}
						ctx := context.WithValue(r.Context(), UserContextKey, userContext)
						r = r.WithContext(ctx)
					}
				}
			}
		}

		// Continuar independientemente de si el token es válido o no
		next.ServeHTTP(w, r)
	})
}

// GetUserFromContext extrae la información del usuario del contexto
func GetUserFromContext(r *http.Request) (AuthContext, bool) {
	user, ok := r.Context().Value(UserContextKey).(AuthContext)
	return user, ok
}

// RequireAuthWrapper wrapper para funciones que requieren autenticación
func RequireAuthWrapper(handler http.HandlerFunc) http.Handler {
	return AuthMiddleware(http.HandlerFunc(handler))
}

// OptionalAuthWrapper wrapper para funciones que pueden usar autenticación opcional
func OptionalAuthWrapper(handler http.HandlerFunc) http.Handler {
	return OptionalAuthMiddleware(http.HandlerFunc(handler))
}
