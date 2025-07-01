package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

// SocketIOBroadcaster maneja el envío de mensajes a Socket.IO
type SocketIOBroadcaster struct {
	BaseURL   string
	AuthToken string
	Client    *http.Client
}

// SocketIOMessage representa un mensaje para Socket.IO
type SocketIOMessage struct {
	RoomName  string      `json:"roomName"`
	EventName string      `json:"eventName"`
	Data      interface{} `json:"data"`
	AuthToken string      `json:"authToken"`
}

// NewSocketIOBroadcaster crea una nueva instancia del broadcaster
func NewSocketIOBroadcaster() *SocketIOBroadcaster {
	baseURL := os.Getenv("FRONTEND_URL")
	if baseURL == "" {
		baseURL = "http://localhost:3000"
	}

	authToken := os.Getenv("SOCKET_AUTH_TOKEN")
	if authToken == "" {
		authToken = "default-secret-token"
	}

	return &SocketIOBroadcaster{
		BaseURL:   baseURL,
		AuthToken: authToken,
		Client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

// BroadcastMessage envía un mensaje a una sala específica de Socket.IO
func (s *SocketIOBroadcaster) BroadcastMessage(roomName, eventName string, data interface{}) error {
	message := SocketIOMessage{
		RoomName:  roomName,
		EventName: eventName,
		Data:      data,
		AuthToken: s.AuthToken,
	}

	jsonData, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("error al serializar mensaje: %w", err)
	}

	url := s.BaseURL + "/api/broadcast"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("error al crear petición HTTP: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := s.Client.Do(req)
	if err != nil {
		log.Printf("⚠️ Error al enviar mensaje Socket.IO: %v", err)
		return nil // No devolver error para no romper el flujo principal
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("⚠️ Socket.IO respondió con código: %d", resp.StatusCode)
		return nil // No devolver error para no romper el flujo principal
	}

	log.Printf("✅ Mensaje Socket.IO enviado exitosamente a %s: %s", roomName, eventName)
	return nil
}

// BroadcastNewMessage envía notificación de nuevo mensaje
func (s *SocketIOBroadcaster) BroadcastNewMessage(conversationID uint, messageData interface{}) {
	roomName := fmt.Sprintf("conversation_%d", conversationID)
	s.BroadcastMessage(roomName, "new_message", messageData)
}

// BroadcastNewComment envía notificación de nuevo comentario
func (s *SocketIOBroadcaster) BroadcastNewComment(postID uint, commentData interface{}) {
	roomName := fmt.Sprintf("post_%d", postID)
	s.BroadcastMessage(roomName, "new_comment", commentData)
}

// BroadcastTypingStart envía notificación de inicio de escritura
func (s *SocketIOBroadcaster) BroadcastTypingStart(conversationID uint, userID uint) {
	roomName := fmt.Sprintf("conversation_%d", conversationID)
	data := map[string]interface{}{
		"user_id":         userID,
		"conversation_id": conversationID,
	}
	s.BroadcastMessage(roomName, "user_typing_start", data)
}

// BroadcastTypingStop envía notificación de cese de escritura
func (s *SocketIOBroadcaster) BroadcastTypingStop(conversationID uint, userID uint) {
	roomName := fmt.Sprintf("conversation_%d", conversationID)
	data := map[string]interface{}{
		"user_id":         userID,
		"conversation_id": conversationID,
	}
	s.BroadcastMessage(roomName, "user_typing_stop", data)
}
