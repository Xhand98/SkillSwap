package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"skillswap/api/models"
	"strconv"

	"gorm.io/gorm"
)

type sessionsHandler struct {
	DB *gorm.DB
}

func NewSessionsHandler(db *gorm.DB) *sessionsHandler {
	return &sessionsHandler{DB: db}
}

// CreateSession crea una nueva sesión
func (h *sessionsHandler) CreateSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var req models.CreateSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error al decodificar la solicitud: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validación básica
	if req.MatchID == 0 {
		http.Error(w, "Se requiere un ID de match válido", http.StatusBadRequest)
		return
	}
	// Verificar que el match existe
	var count int64
	if err := h.DB.Model(&models.Matches{}).Where("EmparejamientoID = ?", req.MatchID).Count(&count).Error; err != nil {
		http.Error(w, "Error al verificar el match: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if count == 0 {
		http.Error(w, "El match especificado no existe", http.StatusBadRequest)
		return
	}

	session := models.Session{
		MatchID:  req.MatchID,
		DateTime: req.DateTime,
		Location: req.Location,
		Notes:    req.Notes,
		Status:   req.Status,
	}

	if result := h.DB.Create(&session); result.Error != nil {
		http.Error(w, "Error al crear la sesión: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Precargar datos relacionados para la respuesta
	if err := h.DB.Preload("Match").First(&session, session.ID).Error; err != nil {
		http.Error(w, "Sesión creada, pero hubo un error al cargar datos relacionados: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(session)
}

// GetSessions obtiene todas las sesiones
func (h *sessionsHandler) GetSessions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var sessions []models.Session
	if result := h.DB.Preload("Match").Find(&sessions); result.Error != nil {
		http.Error(w, "Error al obtener sesiones: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sessions)
}

// GetSession obtiene una sesión específica
func (h *sessionsHandler) GetSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID de sesión inválido", http.StatusBadRequest)
		return
	}

	var session models.Session
	if result := h.DB.Preload("Match").First(&session, id); result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Sesión no encontrada", http.StatusNotFound)
		} else {
			http.Error(w, "Error al obtener sesión: "+result.Error.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(session)
}

// GetSessionsByMatchID obtiene todas las sesiones para un match específico
func (h *sessionsHandler) GetSessionsByMatchID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	matchID, err := strconv.Atoi(r.PathValue("matchID"))
	if err != nil {
		http.Error(w, "ID de match inválido", http.StatusBadRequest)
		return
	}

	var sessions []models.Session
	if result := h.DB.Where("EmparejamientoID = ?", matchID).Find(&sessions); result.Error != nil {
		http.Error(w, "Error al obtener sesiones: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sessions)
}

// UpdateSession actualiza una sesión existente
func (h *sessionsHandler) UpdateSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID de sesión inválido", http.StatusBadRequest)
		return
	}

	var req models.UpdateSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error al decodificar la solicitud: "+err.Error(), http.StatusBadRequest)
		return
	}

	var existingSession models.Session
	if result := h.DB.First(&existingSession, id); result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Sesión no encontrada", http.StatusNotFound)
		} else {
			http.Error(w, "Error al buscar sesión: "+result.Error.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Actualizar campos si se proporcionan
	if req.MatchID != nil {
		existingSession.MatchID = *req.MatchID
	}
	if req.DateTime != nil {
		existingSession.DateTime = *req.DateTime
	}
	if req.Location != nil {
		existingSession.Location = *req.Location
	}
	if req.Notes != nil {
		existingSession.Notes = *req.Notes
	}
	if req.Status != nil {
		existingSession.Status = *req.Status
	}

	if result := h.DB.Save(&existingSession); result.Error != nil {
		http.Error(w, "Error al actualizar la sesión: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Precargar datos relacionados para la respuesta actualizada
	if err := h.DB.Preload("Match").First(&existingSession, existingSession.ID).Error; err != nil {
		http.Error(w, "Sesión actualizada, pero hubo un error al cargar datos relacionados: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(existingSession)
}

// DeleteSession elimina una sesión
func (h *sessionsHandler) DeleteSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID de sesión inválido", http.StatusBadRequest)
		return
	}

	if result := h.DB.Delete(&models.Session{}, id); result.Error != nil {
		http.Error(w, "Error al eliminar la sesión: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
