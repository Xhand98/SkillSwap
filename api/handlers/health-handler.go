package handlers

import (
	"encoding/json"
	"net/http"
	"os"
)

// HealthCheckHandler maneja las solicitudes para verificar la salud de la API
func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
    // Establecer los encabezados CORS
    w.Header().Set("Content-Type", "application/json")
    allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
    if allowedOrigin == "" {
        allowedOrigin = "*"
    }
    w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
    w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

    // Si es una solicitud OPTIONS, retornar OK
    if r.Method == "OPTIONS" {
        w.WriteHeader(http.StatusOK)
        return
    }

    // Si no es GET, retornar error
    if r.Method != "GET" {
        w.WriteHeader(http.StatusMethodNotAllowed)
        json.NewEncoder(w).Encode(map[string]string{"error": "Método no permitido"})
        return
    }    // Responder con el estado de la API
    testMode := os.Getenv("TEST_MODE") == "true"

    response := map[string]interface{}{
        "status": "ok",
        "message": "API funcionando correctamente",
        "cors": map[string]string{
            "allowed_origin": allowedOrigin,
        },
        "test_mode": testMode,
    }

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(response)
}
