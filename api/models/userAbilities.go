// filepath: c:\Users\hendr\OneDrive\Documents\proyectos\Web\Nextjs\skillswap\api\models\userAbilities.go
package models

type UserAbility struct {
	ID               uint      `json:"id" gorm:"primaryKey;column:UsuarioHabilidadID"`
	UserID           uint      `json:"user_id" gorm:"column:UsuarioID"`
	AbilityID        uint      `json:"ability_id" gorm:"column:HabilidadID"`
	SkillType        string    `json:"skill_type" gorm:"column:TipoHabilidad"`
	ProficiencyLevel string    `json:"proficiency_level,omitempty" gorm:"column:NivelProficiencia"`

	// Campos para cargar datos relacionados
	User    User    `json:"user,omitempty" gorm:"foreignKey:UserID;references:UsuarioID"`
	Ability Ability `json:"ability,omitempty" gorm:"foreignKey:AbilityID;references:HabilidadID"`
}

func (UserAbility) TableName() string {
return "UsuariosHabilidades"
}

type CreateUserAbilityRequest struct {
UserID           uint   `json:"user_id" binding:"required"`
AbilityID        uint   `json:"ability_id" binding:"required"`
SkillType        string `json:"skill_type" binding:"required"`
ProficiencyLevel string `json:"proficiency_level" binding:"required"`
}

type UpdateUserAbilityRequest struct {
UserID           *uint   `json:"user_id"`
AbilityID        *uint   `json:"ability_id"`
SkillType        *string `json:"skill_type"`
ProficiencyLevel *string `json:"proficiency_level"`
}
