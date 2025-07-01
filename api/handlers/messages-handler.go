package handlers

import (
	"encoding/json"
	"net/http"
	"skillswap/api/models"
	"strconv"
	"time"

	"gorm.io/gorm"
)

type messagesHandler struct {
	DB        *gorm.DB
	WSHandler *WebSocketHandler
}

func NewMessagesHandler(db *gorm.DB) *messagesHandler {
	return &messagesHandler{DB: db}
}

// SetWebSocketHandler configura el handler de WebSocket para notificaciones en tiempo real
func (h *messagesHandler) SetWebSocketHandler(wsHandler *WebSocketHandler) {
	h.WSHandler = wsHandler
}

// CreateConversation crea una nueva conversación entre dos usuarios
func (h *messagesHandler) CreateConversation(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var req models.CreateConversationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error decodificando JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validación básica
	if req.User1ID == 0 || req.User2ID == 0 {
		http.Error(w, "Los IDs de usuario son requeridos", http.StatusBadRequest)
		return
	}

	if req.User1ID == req.User2ID {
		http.Error(w, "Un usuario no puede crear una conversación consigo mismo", http.StatusBadRequest)
		return
	}

	// Verificar que ambos usuarios existen
	var user1, user2 models.User
	if result := h.DB.First(&user1, req.User1ID); result.Error != nil {
		http.Error(w, "Usuario 1 no encontrado", http.StatusNotFound)
		return
	}
	if result := h.DB.First(&user2, req.User2ID); result.Error != nil {
		http.Error(w, "Usuario 2 no encontrado", http.StatusNotFound)
		return
	}

	// Verificar si ya existe una conversación entre estos usuarios
	var existingConversation models.Conversation
	result := h.DB.Where(
		"(User1ID = ? AND User2ID = ?) OR (User1ID = ? AND User2ID = ?)",
		req.User1ID, req.User2ID, req.User2ID, req.User1ID,
	).First(&existingConversation)

	if result.Error == nil {
		// Ya existe una conversación, devolverla
		response := models.ConversationResponse{
			ID:            existingConversation.ID,
			User1ID:       existingConversation.User1ID,
			User2ID:       existingConversation.User2ID,
			MatchID:       existingConversation.MatchID,
			Title:         existingConversation.Title,
			LastMessageAt: existingConversation.LastMessageAt,
			CreatedAt:     existingConversation.CreatedAt,
			UpdatedAt:     existingConversation.UpdatedAt,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}
	// Verificar el match si se proporciona
	if req.MatchID != nil {
		var match models.Matches
		if result := h.DB.First(&match, *req.MatchID); result.Error != nil {
			http.Error(w, "Match no encontrado", http.StatusNotFound)
			return
		}
	}

	// Crear nueva conversación
	conversation := models.Conversation{
		User1ID: req.User1ID,
		User2ID: req.User2ID,
		MatchID: req.MatchID,
		Title:   req.Title,
	}

	if result := h.DB.Create(&conversation); result.Error != nil {
		http.Error(w, "Error creando conversación: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Crear participantes de la conversación
	participants := []models.ConversationParticipant{
		{
			ConversationID:       conversation.ID,
			UserID:              req.User1ID,
			NotificationsEnabled: true,
		},
		{
			ConversationID:       conversation.ID,
			UserID:              req.User2ID,
			NotificationsEnabled: true,
		},
	}

	if result := h.DB.Create(&participants); result.Error != nil {
		http.Error(w, "Error creando participantes: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	response := models.ConversationResponse{
		ID:            conversation.ID,
		User1ID:       conversation.User1ID,
		User2ID:       conversation.User2ID,
		MatchID:       conversation.MatchID,
		Title:         conversation.Title,
		LastMessageAt: conversation.LastMessageAt,
		CreatedAt:     conversation.CreatedAt,
		UpdatedAt:     conversation.UpdatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// GetUserConversations obtiene todas las conversaciones de un usuario
func (h *messagesHandler) GetUserConversations(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

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

	var conversations []models.ConversationWithLastMessage
	query := `
		SELECT
			c.ID, c.User1ID, c.User2ID, c.MatchID, c.Title, c.LastMessageAt, c.CreatedAt, c.UpdatedAt,
			COALESCE(m.Content, '') as LastMessageContent,
			COALESCE(m.CreatedAt, c.CreatedAt) as LastMessageTime,
			COALESCE(unread.UnreadCount, 0) as UnreadCount
		FROM Conversations c
		LEFT JOIN (
			SELECT ConversationID, Content, CreatedAt,
				ROW_NUMBER() OVER (PARTITION BY ConversationID ORDER BY CreatedAt DESC) as rn
			FROM Messages
			WHERE DeletedAt IS NULL
		) m ON c.ID = m.ConversationID AND m.rn = 1
		LEFT JOIN (
			SELECT ConversationID, COUNT(*) as UnreadCount
			FROM Messages
			WHERE SenderID != ? AND IsRead = 0 AND DeletedAt IS NULL
			GROUP BY ConversationID
		) unread ON c.ID = unread.ConversationID
		WHERE (c.User1ID = ? OR c.User2ID = ?) AND c.DeletedAt IS NULL
		ORDER BY COALESCE(c.LastMessageAt, c.CreatedAt) DESC
	`

	if result := h.DB.Raw(query, userID, userID, userID).Scan(&conversations); result.Error != nil {
		http.Error(w, "Error obteniendo conversaciones: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conversations)
}

// GetConversationMessages obtiene los mensajes de una conversación específica
func (h *messagesHandler) GetConversationMessages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	conversationID, err := parseIDFromPath(r, "conversationID")
	if err != nil {
		http.Error(w, "ID de conversación inválido", http.StatusBadRequest)
		return
	}

	// Verificar que la conversación existe
	var conversation models.Conversation
	if result := h.DB.First(&conversation, conversationID); result.Error != nil {
		http.Error(w, "Conversación no encontrada", http.StatusNotFound)
		return
	}

	// Obtener parámetros de paginación
	page := 1
	limit := 50
	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	offset := (page - 1) * limit

	var messages []models.Message
	query := h.DB.Where("ConversationID = ?", conversationID).
		Preload("Sender").
		Order("CreatedAt DESC").
		Limit(limit).
		Offset(offset)

	if result := query.Find(&messages); result.Error != nil {
		http.Error(w, "Error obteniendo mensajes: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Convertir a response format
	var responses []models.MessageResponse
	for _, message := range messages {
		responses = append(responses, models.MessageResponse{
			ID:             message.ID,
			ConversationID: message.ConversationID,
			SenderID:       message.SenderID,
			Content:        message.Content,
			MessageType:    message.MessageType,
			IsRead:         message.IsRead,
			ReadAt:         message.ReadAt,
			CreatedAt:      message.CreatedAt,
			UpdatedAt:      message.UpdatedAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
}

// SendMessage envía un nuevo mensaje en una conversación
func (h *messagesHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	conversationID, err := parseIDFromPath(r, "conversationID")
	if err != nil {
		http.Error(w, "ID de conversación inválido", http.StatusBadRequest)
		return
	}

	var req models.SendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error decodificando JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validación básica
	if req.SenderID == 0 {
		http.Error(w, "ID del remitente es requerido", http.StatusBadRequest)
		return
	}
	if req.Content == "" {
		http.Error(w, "El contenido del mensaje es requerido", http.StatusBadRequest)
		return
	}

	// Verificar que la conversación existe
	var conversation models.Conversation
	if result := h.DB.First(&conversation, conversationID); result.Error != nil {
		http.Error(w, "Conversación no encontrada", http.StatusNotFound)
		return
	}

	// Verificar que el remitente es participante de la conversación
	if conversation.User1ID != req.SenderID && conversation.User2ID != req.SenderID {
		http.Error(w, "El usuario no es participante de esta conversación", http.StatusForbidden)
		return
	}

	// Verificar que el remitente existe
	var sender models.User
	if result := h.DB.First(&sender, req.SenderID); result.Error != nil {
		http.Error(w, "Remitente no encontrado", http.StatusNotFound)
		return
	}

	// Crear mensaje
	message := models.Message{
		ConversationID: conversationID,
		SenderID:       req.SenderID,
		Content:        req.Content,
		MessageType:    req.MessageType,
		IsRead:         false,
	}

	if message.MessageType == "" {
		message.MessageType = "text"
	}

	if result := h.DB.Create(&message); result.Error != nil {
		http.Error(w, "Error creando mensaje: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}
	// Actualizar última actividad de la conversación
	now := time.Now()
	h.DB.Model(&conversation).Update("LastMessageAt", now)

	// Enviar notificación WebSocket si el handler está configurado
	if h.WSHandler != nil {
		h.WSHandler.BroadcastNewMessage(message)
	}

	response := models.MessageResponse{
		ID:             message.ID,
		ConversationID: message.ConversationID,
		SenderID:       message.SenderID,
		Content:        message.Content,
		MessageType:    message.MessageType,
		IsRead:         message.IsRead,
		ReadAt:         message.ReadAt,
		CreatedAt:      message.CreatedAt,
		UpdatedAt:      message.UpdatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// MarkMessageAsRead marca un mensaje como leído
func (h *messagesHandler) MarkMessageAsRead(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	messageID, err := parseIDFromPath(r, "messageID")
	if err != nil {
		http.Error(w, "ID de mensaje inválido", http.StatusBadRequest)
		return
	}

	var req models.UpdateMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error decodificando JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Verificar que el mensaje existe
	var message models.Message
	if result := h.DB.First(&message, messageID); result.Error != nil {
		http.Error(w, "Mensaje no encontrado", http.StatusNotFound)
		return
	}

	// Verificar que el usuario tiene permisos para marcar este mensaje como leído
	// Solo el receptor puede marcar un mensaje como leído
	var conversation models.Conversation
	if result := h.DB.First(&conversation, message.ConversationID); result.Error != nil {
		http.Error(w, "Conversación no encontrada", http.StatusNotFound)
		return
	}

	// El usuario que marca como leído debe ser el receptor (no el remitente)
	if message.SenderID == req.UserID {
		http.Error(w, "El remitente no puede marcar su propio mensaje como leído", http.StatusBadRequest)
		return
	}

	if conversation.User1ID != req.UserID && conversation.User2ID != req.UserID {
		http.Error(w, "El usuario no es participante de esta conversación", http.StatusForbidden)
		return
	}

	// Marcar como leído
	now := time.Now()
	updates := map[string]interface{}{
		"IsRead": true,
		"ReadAt": now,
	}

	if result := h.DB.Model(&message).Updates(updates); result.Error != nil {
		http.Error(w, "Error actualizando mensaje: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Actualizar última lectura del participante
	h.DB.Model(&models.ConversationParticipant{}).
		Where("ConversationID = ? AND UserID = ?", message.ConversationID, req.UserID).
		Update("LastReadAt", now)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Mensaje marcado como leído"})
}

// MarkConversationAsRead marca todos los mensajes de una conversación como leídos
func (h *messagesHandler) MarkConversationAsRead(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	conversationID, err := parseIDFromPath(r, "conversationID")
	if err != nil {
		http.Error(w, "ID de conversación inválido", http.StatusBadRequest)
		return
	}

	var req models.UpdateMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error decodificando JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Verificar que la conversación existe
	var conversation models.Conversation
	if result := h.DB.First(&conversation, conversationID); result.Error != nil {
		http.Error(w, "Conversación no encontrada", http.StatusNotFound)
		return
	}

	// Verificar que el usuario es participante
	if conversation.User1ID != req.UserID && conversation.User2ID != req.UserID {
		http.Error(w, "El usuario no es participante de esta conversación", http.StatusForbidden)
		return
	}

	// Marcar todos los mensajes no leídos como leídos (excepto los propios)
	now := time.Now()
	updates := map[string]interface{}{
		"IsRead": true,
		"ReadAt": now,
	}

	result := h.DB.Model(&models.Message{}).
		Where("ConversationID = ? AND SenderID != ? AND IsRead = ?", conversationID, req.UserID, false).
		Updates(updates)

	if result.Error != nil {
		http.Error(w, "Error actualizando mensajes: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Actualizar última lectura del participante
	h.DB.Model(&models.ConversationParticipant{}).
		Where("ConversationID = ? AND UserID = ?", conversationID, req.UserID).
		Update("LastReadAt", now)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":        "Conversación marcada como leída",
		"messagesUpdated": result.RowsAffected,
	})
}

// GetConversation obtiene los detalles de una conversación específica
func (h *messagesHandler) GetConversation(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	conversationID, err := parseIDFromPath(r, "conversationID")
	if err != nil {
		http.Error(w, "ID de conversación inválido", http.StatusBadRequest)
		return
	}

	var conversation models.Conversation
	result := h.DB.Preload("User1").Preload("User2").Preload("Match").First(&conversation, conversationID)
	if result.Error != nil {
		http.Error(w, "Conversación no encontrada", http.StatusNotFound)
		return
	}

	response := models.ConversationResponse{
		ID:            conversation.ID,
		User1ID:       conversation.User1ID,
		User2ID:       conversation.User2ID,
		MatchID:       conversation.MatchID,
		Title:         conversation.Title,
		LastMessageAt: conversation.LastMessageAt,
		CreatedAt:     conversation.CreatedAt,
		UpdatedAt:     conversation.UpdatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
