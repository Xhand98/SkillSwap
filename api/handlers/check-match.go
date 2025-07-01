package handlers

// import (
// 	"encoding/json"
// 	"net/http"
// 	"strconv"
// )

// CheckMatch verifica si existe un match entre dos usuarios
// y devuelve el ID del match en caso de que exista
// func (h *matchesHandler) CheckMatch(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodGet {
// 		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
// 		return
// 	}

// 	// Obtener IDs de usuario de query params
// 	user1Str := r.URL.Query().Get("user1")
// 	user2Str := r.URL.Query().Get("user2")

// 	if user1Str == "" || user2Str == "" {
// 		w.Header().Set("Content-Type", "application/json")
// 		json.NewEncoder(w).Encode(map[string]interface{}{
// 			"exists": false,
// 			"error": "Se requieren ambos parámetros: user1 y user2",
// 		})
// 		return
// 	}

// 	user1ID, err1 := strconv.Atoi(user1Str)
// 	user2ID, err2 := strconv.Atoi(user2Str)

// 	if err1 != nil || err2 != nil {
// 		w.Header().Set("Content-Type", "application/json")
// 		json.NewEncoder(w).Encode(map[string]interface{}{
// 			"exists": false,
// 			"error": "IDs de usuario inválidos",
// 		})
// 		return
// 	}

// 	// Buscar match (considerando ambas direcciones: user1->user2 o user2->user1)
// 	var matchID int
// 	var exists bool

// 	row := h.DB.Raw(`
// 		SELECT EmparejamientoID
// 		FROM Emparejamientos
// 		WHERE (Usuario1ID = ? AND Usuario2ID = ?) OR (Usuario1ID = ? AND Usuario2ID = ?)
// 		LIMIT 1
// 	`, user1ID, user2ID, user2ID, user1ID).Row()

// 	if err := row.Scan(&matchID); err != nil {
// 		// No encontrado
// 		w.Header().Set("Content-Type", "application/json")
// 		json.NewEncoder(w).Encode(map[string]interface{}{
// 			"exists": false,
// 			"match_id": nil,
// 		})
// 		return
// 	}

// 	// Match encontrado
// 	exists = true
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(map[string]interface{}{
// 		"exists": exists,
// 		"match_id": matchID,
// 	})
// }
