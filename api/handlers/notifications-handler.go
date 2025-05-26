package handlers

import (
	"encoding/json"
	"net/http"
	"skillswap/api/models"
	"strconv"
	"time"

	"gorm.io/gorm"
)

func parseIDFromPath(r *http.Request, paramName string) (uint, error) {
	idStr := r.PathValue(paramName)
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return 0, err
	}
	return uint(id), nil
}

type notificationsHandler struct {
	DB *gorm.DB
}

func NewNotificationsHandler(db *gorm.DB) *notificationsHandler {
	return &notificationsHandler{DB: db}
}

// GetUserNotifications obtiene todas las notificaciones para un usuario específico
func (h *notificationsHandler) GetUserNotifications(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Obtener el ID del usuario de la URL
	userID, err := parseIDFromPath(r, "userID")
	if err != nil {
		http.Error(w, "ID de usuario inválido", http.StatusBadRequest)
		return
	}
	// Verificar que el usuario existe
	var user models.User
	if result := h.DB.First(&user, userID); result.Error != nil {
		http.Error(w, "Usuario no encontrado", http.StatusNotFound)
		return
	}

	var notifications []models.Notification
	if result := h.DB.Debug().Where("UsuarioID = ?", userID).Order("FechaCreacion DESC").Find(&notifications); result.Error != nil {
		http.Error(w, "Error al obtener notificaciones: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Establecer los encabezados adecuados para CORS y tipo de contenido
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// Si no hay notificaciones, devolver un array vacío, pero con código 200 OK
	json.NewEncoder(w).Encode(notifications)
}

// MarkNotificationAsRead marca una notificación como leída
func (h *notificationsHandler) MarkNotificationAsRead(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Obtener ID de la notificación
	notificationID, err := parseIDFromPath(r, "id")
	if err != nil {
		http.Error(w, "ID de notificación inválido", http.StatusBadRequest)
		return
	}

	// Buscar la notificación
	var notification models.Notification
	if result := h.DB.First(&notification, notificationID); result.Error != nil {
		http.Error(w, "Notificación no encontrada", http.StatusNotFound)
		return
	}

	// Actualizar estado a leído
	notification.Leida = true
	notification.FechaLectura = time.Now()

	if result := h.DB.Save(&notification); result.Error != nil {
		http.Error(w, "Error al actualizar notificación: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notification)
}

// SendSessionReminder envía un recordatorio para una sesión programada
func (h *notificationsHandler) SendSessionReminder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Obtener ID de la sesión
	sessionID, err := parseIDFromPath(r, "sessionID")
	if err != nil {
		http.Error(w, "ID de sesión inválido", http.StatusBadRequest)
		return
	}

	// Buscar la sesión
	var session models.Session
	if result := h.DB.Preload("Match").First(&session, sessionID); result.Error != nil {
		http.Error(w, "Sesión no encontrada", http.StatusNotFound)
		return
	}

	// Crear notificaciones para ambos usuarios
	notifications := []models.Notification{
		{
			UsuarioID:     session.Match.UserID1,
			Tipo:          "session_reminder",
			Titulo:        "Recordatorio de sesión",
			Contenido:     "Tienes una sesión programada para mañana",
			ReferenciaID:  sessionID,
			FechaCreacion: time.Now(),
			Leida:         false,
		},
		{
			UsuarioID:     session.Match.UserID2,
			Tipo:          "session_reminder",
			Titulo:        "Recordatorio de sesión",
			Contenido:     "Tienes una sesión programada para mañana",
			ReferenciaID:  sessionID,
			FechaCreacion: time.Now(),
			Leida:         false,
		},
	}

	// Guardar notificaciones
	for _, notification := range notifications {
		if result := h.DB.Create(&notification); result.Error != nil {
			http.Error(w, "Error al crear notificación: "+result.Error.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Recordatorios enviados correctamente"})
}

// GetUpcomingSessionsReminders crea recordatorios automáticos para las sesiones próximas
// Este método puede ser llamado por un cronjob o manualmente
func (h *notificationsHandler) GetUpcomingSessionsReminders(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Calcular fechas para mañana
	tomorrow := time.Now().AddDate(0, 0, 1)
	startOfDay := time.Date(tomorrow.Year(), tomorrow.Month(), tomorrow.Day(), 0, 0, 0, 0, tomorrow.Location())
	endOfDay := time.Date(tomorrow.Year(), tomorrow.Month(), tomorrow.Day(), 23, 59, 59, 0, tomorrow.Location())

	// Buscar sesiones programadas para mañana
	var sessions []models.Session
	if result := h.DB.Preload("Match").Where("Estado = ? AND FechaHora BETWEEN ? AND ?", "scheduled", startOfDay, endOfDay).Find(&sessions); result.Error != nil {
		http.Error(w, "Error al buscar sesiones: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Crear notificaciones para cada sesión
	createdNotifications := 0
	for _, session := range sessions {
		// Verificar si ya se envió notificación para esta sesión
		var existingNotificationCount int64
		h.DB.Model(&models.Notification{}).Where("referencia_id = ? AND tipo = ?", session.ID, "session_reminder").Count(&existingNotificationCount)

		if existingNotificationCount == 0 {
			// Crear notificación para usuario 1
			notificationUser1 := models.Notification{
				UsuarioID:     session.Match.UserID1,
				Tipo:          "session_reminder",
				Titulo:        "Recordatorio: Sesión programada para mañana",
				Contenido:     "Tienes una sesión programada para mañana en " + session.Location,
				ReferenciaID:  session.ID,
				FechaCreacion: time.Now(),
				Leida:         false,
			}
			if result := h.DB.Create(&notificationUser1); result.Error != nil {
				continue // Continuar con la siguiente sesión en caso de error
			}

			// Crear notificación para usuario 2
			notificationUser2 := models.Notification{
				UsuarioID:     session.Match.UserID2,
				Tipo:          "session_reminder",
				Titulo:        "Recordatorio: Sesión programada para mañana",
				Contenido:     "Tienes una sesión programada para mañana en " + session.Location,
				ReferenciaID:  session.ID,
				FechaCreacion: time.Now(),
				Leida:         false,
			}
			if result := h.DB.Create(&notificationUser2); result.Error != nil {
				continue
			}

			createdNotifications += 2
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":                 "Recordatorios procesados",
		"total_sessions":          len(sessions),
		"total_new_notifications": createdNotifications,
	})
}
