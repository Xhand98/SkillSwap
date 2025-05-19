package models

func (Ability) TableName() string {
	return "Habilidades"
}

type Ability struct {
	ID          uint   `json:"id" gorm:"primaryKey;column:HabilidadID"`
	Name        string `json:"name" gorm:"unique;not null;column:NombreHabilidad"`
	Category    string `json:"category" gorm:"not null;column:Categoria"`
	Description string `json:"description" gorm:"not null;column:Descripcion"`
}

type CreateAbilityRequest struct {
	Name        string `json:"name" binding:"required"`
	Category    string `json:"category" binding:"required"`
	Description string `json:"description" binding:"required"`
}

type UpdateAbilityRequest struct {
	Name        *string `json:"name"`
	Category    *string `json:"category"`
	Description *string `json:"description"`
}
