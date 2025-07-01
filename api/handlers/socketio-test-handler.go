package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// SocketIOTestHandler maneja las pruebas de Socket.IO
type SocketIOTestHandler struct {
	SocketIOBroadcaster *SocketIOBroadcaster
}

// NewSocketIOTestHandler crea una nueva instancia del handler de pruebas
func NewSocketIOTestHandler() *SocketIOTestHandler {
	return &SocketIOTestHandler{
		SocketIOBroadcaster: NewSocketIOBroadcaster(),
	}
}

// TestSocketIOConnection prueba la conexión Socket.IO
func (h *SocketIOTestHandler) TestSocketIOConnection(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Datos de prueba para mensaje
	testMessageData := map[string]interface{}{
		"id":              999,
		"conversation_id": 1,
		"sender_id":       1,
		"content":         "🚀 Mensaje de prueba desde backend Go usando Socket.IO",
		"message_type":    "text",
		"created_at":      "2024-01-01T00:00:00Z",
		"test":            true,
	}
	// Enviar mensaje de prueba a la conversación 1
	h.SocketIOBroadcaster.BroadcastNewMessage(1, testMessageData)

	response := map[string]interface{}{
		"success": true,
		"message": "Mensaje de prueba enviado exitosamente",
		"data":    testMessageData,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// TestSocketIOComment prueba el envío de comentarios por Socket.IO
func (h *SocketIOTestHandler) TestSocketIOComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Datos de prueba para comentario
	testCommentData := map[string]interface{}{
		"comentario_id":        999,
		"post_id":              1,
		"usuario_id":           1,
		"nombre_usuario":       "test_user",
		"primer_nombre":        "Usuario",
		"apellido":             "Prueba",
		"contenido":            "💬 Comentario de prueba desde backend Go usando Socket.IO",
		"comentario_padre_id":  nil,
		"total_likes":          0,
		"total_dislikes":       0,
		"total_respuestas":     0,
		"created_at":           "2024-01-01T00:00:00Z",
		"updated_at":           "2024-01-01T00:00:00Z",
		"activo":               true,
		"test":                 true,
	}
	// Enviar comentario de prueba al post 1
	h.SocketIOBroadcaster.BroadcastNewComment(1, testCommentData)

	response := map[string]interface{}{
		"success": true,
		"message": "Comentario de prueba enviado exitosamente",
		"data":    testCommentData,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// TestSocketIOTyping prueba el envío de notificaciones de escritura
func (h *SocketIOTestHandler) TestSocketIOTyping(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var requestBody struct {
		ConversationID uint `json:"conversation_id"`
		UserID         uint `json:"user_id"`
		Action         string `json:"action"` // "start" o "stop"
	}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		// Valores por defecto si no se proporciona el body
		requestBody.ConversationID = 1
		requestBody.UserID = 1
		requestBody.Action = "start"
	}

	if requestBody.Action == "stop" {
		h.SocketIOBroadcaster.BroadcastTypingStop(requestBody.ConversationID, requestBody.UserID)
	} else {
		h.SocketIOBroadcaster.BroadcastTypingStart(requestBody.ConversationID, requestBody.UserID)
	}

	response := map[string]interface{}{
		"success":         true,
		"message":         fmt.Sprintf("Notificación de escritura (%s) enviada exitosamente", requestBody.Action),
		"conversation_id": requestBody.ConversationID,
		"user_id":         requestBody.UserID,
		"action":          requestBody.Action,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// TestSocketIOCustomMessage envía un mensaje personalizado para pruebas
func (h *SocketIOTestHandler) TestSocketIOCustomMessage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var requestBody struct {
		RoomName  string      `json:"room_name"`
		EventName string      `json:"event_name"`
		Data      interface{} `json:"data"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Error al decodificar JSON", http.StatusBadRequest)
		return
	}

	if requestBody.RoomName == "" || requestBody.EventName == "" {
		http.Error(w, "room_name y event_name son requeridos", http.StatusBadRequest)
		return
	}

	err := h.SocketIOBroadcaster.BroadcastMessage(requestBody.RoomName, requestBody.EventName, requestBody.Data)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al enviar mensaje personalizado Socket.IO: %v", err), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success":    true,
		"message":    "Mensaje personalizado enviado exitosamente",
		"room_name":  requestBody.RoomName,
		"event_name": requestBody.EventName,
		"data":       requestBody.Data,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetSocketIOStatus devuelve el estado de Socket.IO
func (h *SocketIOTestHandler) GetSocketIOStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	response := map[string]interface{}{
		"success":       true,
		"socket_io_url": h.SocketIOBroadcaster.BaseURL,
		"auth_token":    "***HIDDEN***", // No mostrar el token real
		"endpoints": map[string]string{
			"test_message":    "/api/test/socketio/message",
			"test_comment":    "/api/test/socketio/comment",
			"test_typing":     "/api/test/socketio/typing",
			"custom_message":  "/api/test/socketio/custom",
			"status":          "/api/test/socketio/status",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
