package models

import (
	"time"
)

type User struct {
	ID                uint      `json:"id" gorm:"primaryKey;column:UsuarioID;autoIncrement"`
	CreatedAt         time.Time `json:"created_at" gorm:"column:FechaCreacion;autoCreateTime"`
	UpdatedAt         time.Time `json:"updated_at" gorm:"-"` // No existe en la tabla Usuarios
	NombreUsuario     string    `json:"nombre_usuario" gorm:"unique;not null;column:NombreUsuario"`
	PrimerNombre      string    `json:"primer_nombre" gorm:"not null;column:PrimerNombre"`
	SegundoNombre     string    `json:"segundo_nombre,omitempty" gorm:"column:SegundoNombre"`
	PrimerApellido    string    `json:"primer_apellido" gorm:"not null;column:PrimerApellido"`
	SegundoApellido   string    `json:"segundo_apellido,omitempty" gorm:"column:SegundoApellido"`
	CorreoElectronico string    `json:"correo_electronico" gorm:"unique;not null;column:CorreoElectronico"`
	CiudadTrabajo     string    `json:"ciudad_trabajo" gorm:"not null;column:CiudadTrabajo"`
	HashContrasena    string    `json:"-" gorm:"not null;column:HashContrasena"`
	Rol               string    `json:"rol" gorm:"default:'user';column:Rol"`
	IsBanned		  bool 		`json:"is_banned" gorm:"default:0;column:IsBanned"` // Añadido IsBanned a User
	FechaNacimiento   string    `json:"fecha_nacimiento,omitempty" gorm:"column:FechaNacimiento"`
	RolID             *int      `json:"rol_id,omitempty" gorm:"column:RolID"`
		// Nuevos campos de enlaces sociales
	LinkedInLink      string    `json:"linkedin_link,omitempty" gorm:"column:LinkedInLink"`
	GithubLink        string    `json:"github_link" gorm:"column:GithubLink"`
	OwnWebsiteLink    string    `json:"website_link,omitempty" gorm:"column:OwnWebsiteLink"`

	// Relación con las habilidades del usuario
	UserAbilities []UserAbility `json:"user_abilities,omitempty" gorm:"foreignKey:UserID;references:UsuarioID"`
}

// TableName especifica el nombre de la tabla para el modelo User.
func (User) TableName() string {
return "Usuarios"
}

type CreateUserRequest struct {
	NombreUsuario     string `json:"nombre_usuario" binding:"required"`
	PrimerNombre      string `json:"primer_nombre" binding:"required"`
	SegundoNombre     string `json:"segundo_nombre"`
	PrimerApellido    string `json:"primer_apellido" binding:"required"`
	SegundoApellido   string `json:"segundo_apellido"`
	CorreoElectronico string `json:"correo_electronico" binding:"required,email"`
	CiudadTrabajo     string `json:"ciudad_trabajo" binding:"required"`
	HashContrasena    string `json:"hash_contrasena" binding:"required"`
	Rol               string `json:"rol"` // Añadido Rol a CreateUserRequest
	FechaNacimiento   string `json:"fecha_nacimiento"`
	LinkedInLink      string `json:"linkedin_link"`
	GithubLink        string `json:"github_link"`
	OwnWebsiteLink    string `json:"website_link"`
}

type UpdateUserRequest struct {
	PrimerNombre      *string `json:"primer_nombre"`
	SegundoNombre     *string `json:"segundo_nombre"`
	PrimerApellido    *string `json:"primer_apellido"`
	SegundoApellido   *string `json:"segundo_apellido"`
	CorreoElectronico *string `json:"correo_electronico"`
	CiudadTrabajo     *string `json:"ciudad_trabajo"`
	HashContrasena    *string `json:"hash_contrasena"` // Considerar si la contraseña se actualiza así
	Rol               *string `json:"rol"` // Añadido Rol a UpdateUserRequest
	FechaNacimiento   *string `json:"fecha_nacimiento"`
	LinkedInLink      *string `json:"linkedin_link"`
	GithubLink        *string `json:"github_link"`
	OwnWebsiteLink    *string `json:"website_link"`
	IsBanned          *bool   `json:"is_banned"` // Añadido IsBanned a UpdateUserRequest
}
