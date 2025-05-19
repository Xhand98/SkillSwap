package models

import "time"

type Matches struct {
	ID            uint      `json:"id" gorm:"primaryKey;column:EmparejamientoID"`
	UserID1       uint      `json:"user_id_1" gorm:"column:Usuario1ID"`
	UserID2       uint      `json:"user_id_2" gorm:"column:Usuario2ID"`
	Habilidad1ID  uint      `json:"ability_1_id" gorm:"column:Habilidad1ID"` // Corregido: ability_1_id
	Habilidad2ID  uint      `json:"ability_2_id" gorm:"column:Habilidad2ID"` // Corregido: ability_2_id
	MatchingState string    `json:"matching_state" gorm:"column:EstadoEmparejamiento"`
	CreatedAt     time.Time `json:"created_at" gorm:"column:FechaCreacion;autoCreateTime"`

	User1    User    `json:"user_1,omitempty" gorm:"foreignKey:UserID1;references:UsuarioID"`
	User2    User    `json:"user_2,omitempty" gorm:"foreignKey:UserID2;references:UsuarioID"`
	Ability1 Ability `json:"ability_1,omitempty" gorm:"foreignKey:Habilidad1ID;references:HabilidadID"`
	Ability2 Ability `json:"ability_2,omitempty" gorm:"foreignKey:Habilidad2ID;references:HabilidadID"`
}

func (Matches) TableName() string {
	return "Emparejamientos"
}

type CreateMatchesRequest struct {
	UserID1       uint   `json:"user_id_1" binding:"required"`
	UserID2       uint   `json:"user_id_2" binding:"required"`
	Habilidad1ID  uint   `json:"ability_1_id" binding:"required"` // Corregido: ability_1_id
	Habilidad2ID  uint   `json:"ability_2_id" binding:"required"` // Corregido: ability_2_id
	MatchingState string `json:"matching_state" binding:"required"`
}

type UpdateMatchesRequest struct {
	UserID1       *uint   `json:"user_id_1,omitempty"`
	UserID2       *uint   `json:"user_id_2,omitempty"`
	Habilidad1ID  *uint   `json:"ability_1_id,omitempty"` // Corregido: ability_1_id
	Habilidad2ID  *uint   `json:"ability_2_id,omitempty"` // Corregido: ability_2_id
	MatchingState *string `json:"matching_state,omitempty"`
}
