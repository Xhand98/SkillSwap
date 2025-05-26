package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"skillswap/api/models"
	"strconv"

	"gorm.io/gorm"
)

// CheckMatchJSON verifica si existe un match entre dos usuarios
// y devuelve el resultado como objeto JSON
func (h *matchesHandler) CheckMatchJSON(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"exists": false,
			"error":  "Método no permitido",
		})
		return
	}

	// Obtener IDs de usuario de query params
	user1Str := r.URL.Query().Get("user1")
	user2Str := r.URL.Query().Get("user2")

	if user1Str == "" || user2Str == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"exists": false,
			"error":  "Se requieren ambos parámetros: user1 y user2",
		})
		return
	}

	user1ID, err1 := strconv.Atoi(user1Str)
	user2ID, err2 := strconv.Atoi(user2Str)

	if err1 != nil || err2 != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"exists": false,
			"error":  "IDs de usuario inválidos",
		})
		return
	}	// Buscar match (considerando ambas direcciones: user1->user2 o user2->user1)
	var matchID int
	var exists bool
	// Buscar el match de manera directa usando el modelo de GORM
	var match models.Matches
	result := h.DB.Where(
		"(Usuario1ID = ? AND Usuario2ID = ?) OR (Usuario1ID = ? AND Usuario2ID = ?)",
		user1ID, user2ID, user2ID, user1ID,
	).First(&match)

	if result.Error != nil {
		// Verificar si es un error de "record not found" (caso normal)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			// No encontrado - respuesta normal
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"exists":   false,
				"match_id": nil,
			})
			return
		}
		// Otro tipo de error de base de datos
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"exists": false,
			"error":  "Error al consultar la base de datos",
		})
		return
	}

	// El match ID debería estar en match.ID
	matchID = int(match.ID)// Match encontrado
	exists = true
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// Asegurarse de devolver el campo como "match_id" explícitamente para el frontend
	json.NewEncoder(w).Encode(map[string]interface{}{
		"exists":   exists,
		"match_id": matchID,
	})
}
