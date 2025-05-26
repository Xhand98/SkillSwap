package models

import "time"

// Notification representa una notificación para un usuario
type Notification struct {
	ID            uint      `json:"id" gorm:"primaryKey;column:NotificacionID"`
	UsuarioID     uint      `json:"usuario_id" gorm:"column:UsuarioID"`
	Tipo          string    `json:"tipo" gorm:"column:Tipo;size:50"` // session_reminder, match_created, etc.
	Titulo        string    `json:"titulo" gorm:"column:Titulo;size:100"`
	Contenido     string    `json:"contenido" gorm:"column:Contenido;size:500"`
	ReferenciaID  uint      `json:"referencia_id" gorm:"column:ReferenciaID"` // ID de la entidad relacionada (sesión, match, etc.)
	FechaCreacion time.Time `json:"fecha_creacion" gorm:"column:FechaCreacion;autoCreateTime"`
	Leida         bool      `json:"leida" gorm:"column:Leida;default:false"`
	FechaLectura  time.Time `json:"fecha_lectura" gorm:"column:FechaLectura"`
}

// TableName establece el nombre personalizado de la tabla
func (Notification) TableName() string {
	return "Notificaciones"
}
