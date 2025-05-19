package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"skillswap/api/models"
	"strconv"

	"gorm.io/gorm"
)

type matchesHandler struct {
	DB *gorm.DB
}

func NewMatchesHandler(db *gorm.DB) *matchesHandler {
	return &matchesHandler{DB: db}
}

// CreateMatch crea un nuevo emparejamiento.
func (h *matchesHandler) CreateMatch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var req models.CreateMatchesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error al decodificar la solicitud: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validación básica (puedes añadir más según tus reglas de negocio)
	if req.UserID1 == req.UserID2 {
		http.Error(w, "Un usuario no puede emparejarse consigo mismo.", http.StatusBadRequest)
		return
	}

	match := models.Matches{
		UserID1:       req.UserID1,
		UserID2:       req.UserID2,
		Habilidad1ID:  req.Habilidad1ID,
		Habilidad2ID:  req.Habilidad2ID,
		MatchingState: req.MatchingState, // Asumiendo que el estado inicial se envía en la solicitud
	}

	// Opcional: Verificar existencia de Usuarios y Habilidades
	// ...

	if result := h.DB.Create(&match); result.Error != nil {
		http.Error(w, "Error al crear el emparejamiento: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Precargar datos relacionados para la respuesta
	if err := h.DB.Preload("User1").Preload("User2").Preload("Ability1").Preload("Ability2").First(&match, match.ID).Error; err != nil {
		// Manejar el error si la precarga falla, aunque el emparejamiento ya se creó.
		// Podrías devolver el 'match' sin los datos precargados o loguear el error.
		http.Error(w, "Emparejamiento creado, pero hubo un error al cargar datos relacionados: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(match)
}

// GetMatches obtiene todos los emparejamientos.
func (h *matchesHandler) GetMatches(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var matches []models.Matches
	if result := h.DB.Preload("User1").Preload("User2").Preload("Ability1").Preload("Ability2").Find(&matches); result.Error != nil {
		http.Error(w, "Error al obtener emparejamientos: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matches)
}

// GetMatch obtiene un emparejamiento específico por su ID.
func (h *matchesHandler) GetMatch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID de emparejamiento inválido", http.StatusBadRequest)
		return
	}

	var match models.Matches
	if result := h.DB.Preload("User1").Preload("User2").Preload("Ability1").Preload("Ability2").First(&match, id); result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Emparejamiento no encontrado", http.StatusNotFound)
		} else {
			http.Error(w, "Error al obtener emparejamiento: "+result.Error.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(match)
}

// UpdateMatch actualiza un emparejamiento existente.
func (h *matchesHandler) UpdateMatch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID de emparejamiento inválido", http.StatusBadRequest)
		return
	}

	var req models.UpdateMatchesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error al decodificar la solicitud: "+err.Error(), http.StatusBadRequest)
		return
	}

	var existingMatch models.Matches
	if result := h.DB.First(&existingMatch, id); result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Emparejamiento no encontrado", http.StatusNotFound)
		} else {
			http.Error(w, "Error al buscar emparejamiento: "+result.Error.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Actualizar campos si se proporcionan
	if req.UserID1 != nil {
		existingMatch.UserID1 = *req.UserID1
	}
	if req.UserID2 != nil {
		existingMatch.UserID2 = *req.UserID2
	}
	if req.Habilidad1ID != nil {
		existingMatch.Habilidad1ID = *req.Habilidad1ID
	}
	if req.Habilidad2ID != nil {
		existingMatch.Habilidad2ID = *req.Habilidad2ID
	}
	if req.MatchingState != nil {
		existingMatch.MatchingState = *req.MatchingState
	}
	// Considerar validaciones adicionales, como no permitir que UserID1 == UserID2

	if result := h.DB.Save(&existingMatch); result.Error != nil {
		http.Error(w, "Error al actualizar el emparejamiento: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Precargar datos relacionados para la respuesta actualizada
	if err := h.DB.Preload("User1").Preload("User2").Preload("Ability1").Preload("Ability2").First(&existingMatch, existingMatch.ID).Error; err != nil {
		http.Error(w, "Emparejamiento actualizado, pero hubo un error al cargar datos relacionados: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(existingMatch)
}

// DeleteMatch elimina un emparejamiento.
func (h *matchesHandler) DeleteMatch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID de emparejamiento inválido", http.StatusBadRequest)
		return
	}

	// Opcional: verificar si el emparejamiento existe antes de intentar eliminarlo
	// para devolver un 404 si no se encuentra.
	// var match models.Matches
	// if err := h.DB.First(&match, id).Error; err != nil {
	// 	if errors.Is(err, gorm.ErrRecordNotFound) {
	// 		http.Error(w, "Emparejamiento no encontrado", http.StatusNotFound)
	// 		return
	// 	}
	// 	http.Error(w, "Error al buscar emparejamiento: "+err.Error(), http.StatusInternalServerError)
	// 	return
	// }

	if result := h.DB.Delete(&models.Matches{}, id); result.Error != nil {
		http.Error(w, "Error al eliminar el emparejamiento: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetMatchesByUserID obtiene todos los emparejamientos para un usuario específico (ya sea como UserID1 o UserID2).
func (h *matchesHandler) GetMatchesByUserID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	userID, err := strconv.Atoi(r.PathValue("userID"))
	if err != nil {
		http.Error(w, "ID de usuario inválido", http.StatusBadRequest)
		return
	}

	var matches []models.Matches
	if result := h.DB.Preload("User1").Preload("User2").Preload("Ability1").Preload("Ability2").
		Where("Usuario1ID = ? OR Usuario2ID = ?", userID, userID).
		Find(&matches); result.Error != nil {
		http.Error(w, "Error al obtener emparejamientos del usuario: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matches)
}
