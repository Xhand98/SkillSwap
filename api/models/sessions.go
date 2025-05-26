package models

import "time"

// Session representa una sesión programada entre dos usuarios
type Session struct {
	ID        uint      `json:"id" gorm:"primaryKey;column:SesionID"`
	MatchID   uint      `json:"match_id" gorm:"column:EmparejamientoID"`
	DateTime  time.Time `json:"date_time" gorm:"column:FechaHora"`
	Location  string    `json:"location" gorm:"column:Ubicacion;size:255"`
	Notes     string    `json:"notes" gorm:"column:Notas;size:500"`
	Status    string    `json:"status" gorm:"column:Estado;size:50"`
	CreatedAt time.Time `json:"created_at" gorm:"column:FechaCreacion;autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"column:FechaActualizacion;autoUpdateTime"`

	// Relaciones
	Match Matches `json:"match" gorm:"foreignKey:EmparejamientoID;references:ID"`
}

// TableName establece el nombre personalizado de la tabla
func (Session) TableName() string {
	return "Sesiones"
}

// CreateSessionRequest representa la estructura para crear una nueva sesión
type CreateSessionRequest struct {
	MatchID  uint      `json:"match_id"`
	DateTime time.Time `json:"date_time"`
	Location string    `json:"location"`
	Notes    string    `json:"notes"`
	Status   string    `json:"status"`
}

// UpdateSessionRequest representa la estructura para actualizar una sesión existente
type UpdateSessionRequest struct {
	MatchID  *uint      `json:"match_id,omitempty"`
	DateTime *time.Time `json:"date_time,omitempty"`
	Location *string    `json:"location,omitempty"`
	Notes    *string    `json:"notes,omitempty"`
	Status   *string    `json:"status,omitempty"`
}
