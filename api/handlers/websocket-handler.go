package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"skillswap/api/models"

	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

// WebSocketMessage representa un mensaje de WebSocket
type WebSocketMessage struct {
	Type    string      `json:"type"`
	Data    interface{} `json:"data"`
	UserID  uint        `json:"user_id,omitempty"`
	RoomID  string      `json:"room_id,omitempty"`
	Time    time.Time   `json:"time"`
}

// Client representa una conexión WebSocket activa
type Client struct {
	ID     string
	UserID uint
	Conn   *websocket.Conn
	Send   chan WebSocketMessage
	Hub    *Hub
	Rooms  map[string]bool // Salas a las que está conectado el cliente
}

// Hub mantiene el conjunto de clientes activos y transmite mensajes
type Hub struct {
	DB          *gorm.DB
	Clients     map[*Client]bool
	Broadcast   chan WebSocketMessage
	Register    chan *Client
	Unregister  chan *Client
	Rooms       map[string]map[*Client]bool // Mapeo de salas a clientes
	mu          sync.RWMutex
}

type WebSocketHandler struct {
	DB  *gorm.DB
	Hub *Hub
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// En producción, verificar el origen adecuadamente
		return true
	},
	ReadBufferSize:  1024,	WriteBufferSize: 1024,
}

// NewHub crea un nuevo hub de WebSocket
func NewHub(db *gorm.DB) *Hub {
	return &Hub{
		DB:         db,
		Broadcast:  make(chan WebSocketMessage),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Clients:    make(map[*Client]bool),
		Rooms:      make(map[string]map[*Client]bool),
	}
}

// NewWebSocketHandler crea un nuevo handler de WebSocket
func NewWebSocketHandler(db *gorm.DB, hub *Hub) *WebSocketHandler {
	return &WebSocketHandler{
		DB:  db,
		Hub: hub,
	}
}

// Run inicia el hub de WebSocket
func (h *Hub) Run() {
	h.run()
}

// ServeWS maneja las conexiones WebSocket
func (ws *WebSocketHandler) ServeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error al actualizar a WebSocket: %v", err)
		return
	}

	// Obtener userID del query parameter o header
	userIDStr := r.URL.Query().Get("user_id")
	if userIDStr == "" {
		log.Printf("UserID no proporcionado en la conexión WebSocket")
		conn.Close()
		return
	}

	var userID uint
	if _, err := fmt.Sscanf(userIDStr, "%d", &userID); err != nil {
		log.Printf("UserID inválido: %s", userIDStr)
		conn.Close()
		return
	}

	client := &Client{
		ID:     generateClientID(),
		UserID: userID,
		Conn:   conn,
		Send:   make(chan WebSocketMessage, 256),
		Hub:    ws.Hub,
		Rooms:  make(map[string]bool),
	}

	client.Hub.Register <- client

	// Permitir la recolección de basura de memoria
	defer func() {
		client.Hub.Unregister <- client
		conn.Close()
	}()

	// Iniciar goroutine para escritura
	go client.writePump()

	// Ejecutar readPump en la goroutine principal (bloquea hasta que se cierre la conexión)
	client.readPump()
}

// run ejecuta el hub de WebSocket
func (h *Hub) run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			h.Clients[client] = true
			h.mu.Unlock()

			log.Printf("Cliente %s (UserID: %d) conectado. Total clientes: %d",
				client.ID, client.UserID, len(h.Clients))

			// Enviar mensaje de bienvenida
			welcomeMsg := WebSocketMessage{
				Type: "connection_established",
				Data: map[string]interface{}{
					"message": "Conexión WebSocket establecida exitosamente",
					"client_id": client.ID,
				},
				Time: time.Now(),
			}
			select {
			case client.Send <- welcomeMsg:
			default:
				close(client.Send)
				h.mu.Lock()
				delete(h.Clients, client)
				h.mu.Unlock()
			}

		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)

				// Remover cliente de todas las salas
				for roomID := range client.Rooms {
					if room, exists := h.Rooms[roomID]; exists {
						delete(room, client)
						if len(room) == 0 {
							delete(h.Rooms, roomID)
						}
					}
				}

				log.Printf("Cliente %s (UserID: %d) desconectado. Total clientes: %d",
					client.ID, client.UserID, len(h.Clients))
			}
			h.mu.Unlock()

		case message := <-h.Broadcast:
			h.mu.RLock()
			if message.RoomID != "" {
				// Enviar a sala específica
				if room, exists := h.Rooms[message.RoomID]; exists {
					for client := range room {
						select {
						case client.Send <- message:
						default:
							close(client.Send)
							delete(h.Clients, client)
							delete(room, client)
						}
					}
				}
			} else {
				// Broadcast a todos los clientes
				for client := range h.Clients {
					select {
					case client.Send <- message:
					default:
						close(client.Send)
						delete(h.Clients, client)
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

// readPump maneja los mensajes entrantes del cliente
func (c *Client) readPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(512)
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		var msg WebSocketMessage
		err := c.Conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error de WebSocket: %v", err)
			}
			break
		}

		msg.UserID = c.UserID
		msg.Time = time.Now()

		// Procesar mensaje según el tipo
		c.handleMessage(msg)
	}
}

// writePump maneja el envío de mensajes al cliente
func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.Conn.WriteJSON(message); err != nil {
				log.Printf("Error al enviar mensaje WebSocket: %v", err)
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// handleMessage procesa los diferentes tipos de mensajes
func (c *Client) handleMessage(msg WebSocketMessage) {
	switch msg.Type {
	case "join_conversation":
		c.handleJoinConversation(msg)
	case "leave_conversation":
		c.handleLeaveConversation(msg)
	case "typing_start":
		c.handleTypingStart(msg)
	case "typing_stop":
		c.handleTypingStop(msg)
	case "new_comment":
		c.handleNewComment(msg)
	case "comment_vote":
		c.handleCommentVote(msg)
	case "ping":
		c.handlePing(msg)
	default:
		log.Printf("Tipo de mensaje no reconocido: %s", msg.Type)
	}
}

// handleJoinConversation permite al usuario unirse a una sala de conversación
func (c *Client) handleJoinConversation(msg WebSocketMessage) {
	data, ok := msg.Data.(map[string]interface{})
	if !ok {
		return
	}

	conversationID, ok := data["conversation_id"].(string)
	if !ok {
		return
	}

	roomID := "conversation_" + conversationID

	// Verificar que el usuario tiene permiso para unirse a esta conversación
	if !c.canJoinConversation(conversationID) {
		response := WebSocketMessage{
			Type: "error",
			Data: map[string]interface{}{
				"message": "No tienes permiso para unirte a esta conversación",
			},
			Time: time.Now(),
		}
		c.Send <- response
		return
	}

	// Unir cliente a la sala
	c.Hub.mu.Lock()
	if c.Hub.Rooms[roomID] == nil {
		c.Hub.Rooms[roomID] = make(map[*Client]bool)
	}
	c.Hub.Rooms[roomID][c] = true
	c.Rooms[roomID] = true
	c.Hub.mu.Unlock()

	// Notificar al cliente
	response := WebSocketMessage{
		Type: "joined_conversation",
		Data: map[string]interface{}{
			"conversation_id": conversationID,
			"room_id": roomID,
		},
		Time: time.Now(),
	}
	c.Send <- response

	log.Printf("Cliente %s se unió a la conversación %s", c.ID, conversationID)
}

// handleLeaveConversation permite al usuario salir de una sala de conversación
func (c *Client) handleLeaveConversation(msg WebSocketMessage) {
	data, ok := msg.Data.(map[string]interface{})
	if !ok {
		return
	}

	conversationID, ok := data["conversation_id"].(string)
	if !ok {
		return
	}

	roomID := "conversation_" + conversationID

	c.Hub.mu.Lock()
	if room, exists := c.Hub.Rooms[roomID]; exists {
		delete(room, c)
		if len(room) == 0 {
			delete(c.Hub.Rooms, roomID)
		}
	}
	delete(c.Rooms, roomID)
	c.Hub.mu.Unlock()

	log.Printf("Cliente %s salió de la conversación %s", c.ID, conversationID)
}

// handleTypingStart maneja el inicio de escritura
func (c *Client) handleTypingStart(msg WebSocketMessage) {
	data, ok := msg.Data.(map[string]interface{})
	if !ok {
		return
	}

	conversationID, ok := data["conversation_id"].(string)
	if !ok {
		return
	}

	roomID := "conversation_" + conversationID

	// Retransmitir a otros usuarios en la sala
	broadcastMsg := WebSocketMessage{
		Type: "user_typing_start",
		Data: map[string]interface{}{
			"conversation_id": conversationID,
			"user_id": c.UserID,
		},
		RoomID: roomID,
		Time: time.Now(),
	}

	c.Hub.Broadcast <- broadcastMsg
}

// handleTypingStop maneja el cese de escritura
func (c *Client) handleTypingStop(msg WebSocketMessage) {
	data, ok := msg.Data.(map[string]interface{})
	if !ok {
		return
	}

	conversationID, ok := data["conversation_id"].(string)
	if !ok {
		return
	}

	roomID := "conversation_" + conversationID

	// Retransmitir a otros usuarios en la sala
	broadcastMsg := WebSocketMessage{
		Type: "user_typing_stop",
		Data: map[string]interface{}{
			"conversation_id": conversationID,
			"user_id": c.UserID,
		},
		RoomID: roomID,
		Time: time.Now(),
	}

	c.Hub.Broadcast <- broadcastMsg
}

// handleNewComment maneja nuevos comentarios
func (c *Client) handleNewComment(msg WebSocketMessage) {
	data, ok := msg.Data.(map[string]interface{})
	if !ok {
		return
	}

	postID, ok := data["post_id"].(string)
	if !ok {
		return
	}

	roomID := "post_" + postID

	// Retransmitir a otros usuarios viendo el mismo post
	broadcastMsg := WebSocketMessage{
		Type: "new_comment_notification",
		Data: data,
		RoomID: roomID,
		Time: time.Now(),
	}

	c.Hub.Broadcast <- broadcastMsg
}

// handleCommentVote maneja votos en comentarios
func (c *Client) handleCommentVote(msg WebSocketMessage) {
	data, ok := msg.Data.(map[string]interface{})
	if !ok {
		return
	}

	postID, ok := data["post_id"].(string)
	if !ok {
		return
	}

	roomID := "post_" + postID

	// Retransmitir actualización de votos
	broadcastMsg := WebSocketMessage{
		Type: "comment_vote_update",
		Data: data,
		RoomID: roomID,
		Time: time.Now(),
	}

	c.Hub.Broadcast <- broadcastMsg
}

// handlePing responde a pings del cliente
func (c *Client) handlePing(msg WebSocketMessage) {
	response := WebSocketMessage{
		Type: "pong",
		Data: map[string]interface{}{
			"timestamp": time.Now().Unix(),
		},
		Time: time.Now(),
	}
	c.Send <- response
}

// canJoinConversation verifica si el usuario puede unirse a una conversación
func (c *Client) canJoinConversation(conversationID string) bool {
	var conversation models.Conversation

	if err := c.Hub.DB.Where("id = ? AND (user1_id = ? OR user2_id = ?)",
		conversationID, c.UserID, c.UserID).First(&conversation).Error; err != nil {
		return false
	}

	return true
}

// BroadcastNewMessage envía una notificación de nuevo mensaje
func (ws *WebSocketHandler) BroadcastNewMessage(message models.Message) {
	roomID := fmt.Sprintf("conversation_%d", message.ConversationID)

	broadcastMsg := WebSocketMessage{
		Type: "new_message",
		Data: map[string]interface{}{
			"id": message.ID,
			"conversation_id": message.ConversationID,
			"sender_id": message.SenderID,
			"content": message.Content,
			"message_type": message.MessageType,
			"created_at": message.CreatedAt,
		},
		RoomID: roomID,
		Time: time.Now(),
	}

	ws.Hub.Broadcast <- broadcastMsg
}

// BroadcastNewComment envía una notificación de nuevo comentario
func (ws *WebSocketHandler) BroadcastNewComment(comment models.ComentarioCompleto) {
	roomID := fmt.Sprintf("post_%d", comment.PostID)

	broadcastMsg := WebSocketMessage{
		Type: "new_comment",
		Data: map[string]interface{}{
			"comentario_id": comment.ComentarioID,
			"post_id": comment.PostID,
			"usuario_id": comment.UsuarioID,
			"nombre_usuario": comment.NombreUsuario,
			"primer_nombre": comment.PrimerNombre,
			"apellido": comment.Apellido,
			"contenido": comment.Contenido,
			"comentario_padre_id": comment.ComentarioPadreID,
			"total_likes": comment.TotalLikes,
			"total_dislikes": comment.TotalDislikes,
			"total_respuestas": comment.TotalRespuestas,
			"created_at": comment.CreatedAt,
			"updated_at": comment.UpdatedAt,
			"activo": comment.Activo,
		},
		RoomID: roomID,
		Time: time.Now(),
	}

	ws.Hub.Broadcast <- broadcastMsg
}

// BroadcastCommentUpdate envía actualizaciones de comentarios
func (ws *WebSocketHandler) BroadcastCommentUpdate(postID uint, commentData interface{}) {
	roomID := fmt.Sprintf("post_%d", postID)

	broadcastMsg := WebSocketMessage{
		Type: "comment_update",
		Data: commentData,
		RoomID: roomID,
		Time: time.Now(),
	}

	ws.Hub.Broadcast <- broadcastMsg
}

// GetConnectedClients devuelve información sobre clientes conectados
func (ws *WebSocketHandler) GetConnectedClients(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	ws.Hub.mu.RLock()
	clientsInfo := make([]map[string]interface{}, 0, len(ws.Hub.Clients))

	for client := range ws.Hub.Clients {
		clientInfo := map[string]interface{}{
			"id": client.ID,
			"user_id": client.UserID,
			"rooms": make([]string, 0, len(client.Rooms)),
		}

		for room := range client.Rooms {
			clientInfo["rooms"] = append(clientInfo["rooms"].([]string), room)
		}

		clientsInfo = append(clientsInfo, clientInfo)
	}
	ws.Hub.mu.RUnlock()

	response := map[string]interface{}{
		"total_clients": len(clientsInfo),
		"clients": clientsInfo,
		"total_rooms": len(ws.Hub.Rooms),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// generateClientID genera un ID único para el cliente
func generateClientID() string {
	return fmt.Sprintf("client_%d", time.Now().UnixNano())
}

// GetWebSocketStatus devuelve el estado del WebSocket hub
func (ws *WebSocketHandler) GetWebSocketStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	ws.Hub.mu.RLock()
	status := map[string]interface{}{
		"total_clients": len(ws.Hub.Clients),
		"total_rooms": len(ws.Hub.Rooms),
		"rooms_info": make(map[string]int),
	}

	for roomID, clients := range ws.Hub.Rooms {
		status["rooms_info"].(map[string]int)[roomID] = len(clients)
	}
	ws.Hub.mu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}
