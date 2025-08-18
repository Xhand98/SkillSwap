package handlers

import (
	"encoding/json"
	"net/http"
	"skillswap/api/models"
	"strconv"
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
	
	// Use raw SQL to avoid GORM column mapping issues
	var match models.Matches
	query := `
		SELECT "EmparejamientoID", "Usuario1ID", "Usuario2ID", "Habilidad1ID", "Habilidad2ID", "EstadoEmparejamiento", "FechaCreacion"
		FROM "Emparejamientos" 
		WHERE ("Usuario1ID" = ? AND "Usuario2ID" = ?) OR ("Usuario1ID" = ? AND "Usuario2ID" = ?)
		LIMIT 1
	`
	
	result := h.DB.Raw(query, user1ID, user2ID, user2ID, user1ID).Scan(&match)

	if result.Error != nil {
		// Error de base de datos
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"exists": false,
			"error":  "Error al consultar la base de datos",
		})
		return
	}

	// Check if any rows were returned
	if result.RowsAffected == 0 || match.ID == 0 {
		// No match found
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"exists":   false,
			"match_id": nil,
		})
		return
	}

	// Match encontrado
	matchID = int(match.ID)
	exists = true
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// Asegurarse de devolver el campo como "match_id" explícitamente para el frontend
	json.NewEncoder(w).Encode(map[string]interface{}{
		"exists":   exists,
		"match_id": matchID,
	})
}
