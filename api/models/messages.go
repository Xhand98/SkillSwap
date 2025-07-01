package models

import (
	"time"

	"gorm.io/gorm"
)

// Message representa un mensaje en una conversación
type Message struct {
	ID             uint           `json:"id" gorm:"primarykey"`
	ConversationID uint           `json:"conversation_id" gorm:"not null;index;column:ConversationID"`
	SenderID       uint           `json:"sender_id" gorm:"not null;index;column:SenderID"`
	Content        string         `json:"content" gorm:"type:text;not null;column:Content"`
	MessageType    string         `json:"message_type" gorm:"default:'text';column:MessageType"` // text, image, file
	IsRead         bool           `json:"is_read" gorm:"default:false;column:IsRead"`
	ReadAt         *time.Time     `json:"read_at,omitempty" gorm:"column:ReadAt"`
	CreatedAt      time.Time      `json:"created_at" gorm:"column:CreatedAt"`
	UpdatedAt      time.Time      `json:"updated_at" gorm:"column:UpdatedAt"`
	DeletedAt      gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index;column:DeletedAt"`

	// Relaciones
	Conversation   Conversation   `json:"conversation,omitempty" gorm:"foreignKey:ConversationID"`
	Sender         User           `json:"sender,omitempty" gorm:"foreignKey:SenderID"`
}

// Conversation representa una conversación entre dos usuarios
type Conversation struct {
	ID           uint           `json:"id" gorm:"primarykey"`
	User1ID      uint           `json:"user1_id" gorm:"not null;index;column:User1ID"`
	User2ID      uint           `json:"user2_id" gorm:"not null;index;column:User2ID"`
	MatchID      *uint          `json:"match_id,omitempty" gorm:"index;column:MatchID"` // Opcional, para conversaciones basadas en matches
	Title        string         `json:"title,omitempty" gorm:"column:Title"`
	LastMessageAt *time.Time    `json:"last_message_at,omitempty" gorm:"column:LastMessageAt"`
	CreatedAt    time.Time      `json:"created_at" gorm:"column:CreatedAt"`
	UpdatedAt    time.Time      `json:"updated_at" gorm:"column:UpdatedAt"`
	DeletedAt    gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index;column:DeletedAt"`
	// Relaciones
	User1        User           `json:"user1,omitempty" gorm:"foreignKey:User1ID"`
	User2        User           `json:"user2,omitempty" gorm:"foreignKey:User2ID"`
	Match        *Matches       `json:"match,omitempty" gorm:"foreignKey:MatchID"`
	Messages     []Message      `json:"messages,omitempty" gorm:"foreignKey:ConversationID"`
}

// ConversationParticipant representa la participación de un usuario en una conversación
type ConversationParticipant struct {
	ID               uint           `json:"id" gorm:"primarykey"`
	ConversationID   uint           `json:"conversation_id" gorm:"not null;index;column:ConversationID"`
	UserID           uint           `json:"user_id" gorm:"not null;index;column:UserID"`
	LastReadAt       *time.Time     `json:"last_read_at,omitempty" gorm:"column:LastReadAt"`
	NotificationsEnabled bool       `json:"notifications_enabled" gorm:"default:true;column:NotificationsEnabled"`
	CreatedAt        time.Time      `json:"created_at" gorm:"column:CreatedAt"`
	UpdatedAt        time.Time      `json:"updated_at" gorm:"column:UpdatedAt"`
	DeletedAt        gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index;column:DeletedAt"`

	// Relaciones
	Conversation     Conversation   `json:"conversation,omitempty" gorm:"foreignKey:ConversationID"`
	User             User           `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// TableName methods para especificar nombres de tabla en SQL Server
func (Message) TableName() string {
	return "Messages"
}

func (Conversation) TableName() string {
	return "Conversations"
}

func (ConversationParticipant) TableName() string {
	return "ConversationParticipants"
}

// Requests para API

// CreateConversationRequest representa una solicitud para crear una nueva conversación
type CreateConversationRequest struct {
	User1ID  uint   `json:"user1_id" binding:"required"`
	User2ID  uint   `json:"user2_id" binding:"required"`
	MatchID  *uint  `json:"match_id,omitempty"`
	Title    string `json:"title,omitempty"`
}

// SendMessageRequest representa una solicitud para enviar un mensaje
type SendMessageRequest struct {
	ConversationID uint   `json:"conversation_id" binding:"required"`
	SenderID       uint   `json:"sender_id" binding:"required"`
	Content        string `json:"content" binding:"required"`
	MessageType    string `json:"message_type,omitempty"`
}

// UpdateMessageRequest representa una solicitud para actualizar un mensaje
type UpdateMessageRequest struct {
	UserID  uint    `json:"user_id" binding:"required"`
	Content *string `json:"content,omitempty"`
	IsRead  *bool   `json:"is_read,omitempty"`
}

// Responses para API

// MessageResponse representa la respuesta de un mensaje individual
type MessageResponse struct {
	ID             uint       `json:"id"`
	ConversationID uint       `json:"conversation_id"`
	SenderID       uint       `json:"sender_id"`
	Content        string     `json:"content"`
	MessageType    string     `json:"message_type"`
	IsRead         bool       `json:"is_read"`
	ReadAt         *time.Time `json:"read_at,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

// ConversationResponse representa la respuesta de una conversación individual
type ConversationResponse struct {
	ID            uint       `json:"id"`
	User1ID       uint       `json:"user1_id"`
	User2ID       uint       `json:"user2_id"`
	MatchID       *uint      `json:"match_id,omitempty"`
	Title         string     `json:"title,omitempty"`
	LastMessageAt *time.Time `json:"last_message_at,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

// ConversationWithLastMessage representa una conversación con información del último mensaje
type ConversationWithLastMessage struct {
	ID                  uint       `json:"id"`
	User1ID             uint       `json:"user1_id"`
	User2ID             uint       `json:"user2_id"`
	MatchID             *uint      `json:"match_id,omitempty"`
	Title               string     `json:"title,omitempty"`
	LastMessageAt       *time.Time `json:"last_message_at,omitempty"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
	LastMessageContent  string     `json:"last_message_content,omitempty"`
	LastMessageTime     time.Time  `json:"last_message_time"`
	UnreadCount         int        `json:"unread_count"`
}

// MessagesListResponse representa la respuesta de la API para listas de mensajes
type MessagesListResponse struct {
	Messages    []MessageResponse `json:"messages"`
	Total       int64             `json:"total"`
	Page        int               `json:"page"`
	PageSize    int               `json:"page_size"`
	TotalPages  int               `json:"total_pages"`
}

// ConversationsListResponse representa la respuesta de la API para listas de conversaciones
type ConversationsListResponse struct {
	Conversations []ConversationWithLastMessage `json:"conversations"`
	Total         int64                         `json:"total"`
	Page          int                           `json:"page"`
	PageSize      int                           `json:"page_size"`
	TotalPages    int                           `json:"total_pages"`
}
