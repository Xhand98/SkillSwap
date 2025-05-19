package models

import (
	"time"
)

	type User struct {
		ID                uint      `json:"id" gorm:"primaryKey;column:UsuarioID"`
		CreatedAt         time.Time `json:"created_at" gorm:"column:FechaCreacion;autoCreateTime"`
		UpdatedAt         time.Time `json:"updated_at" gorm:"column:UpdatedAt;autoUpdateTime"` // Mapeado a FechaActualizacion
		NombreUsuario     string    `json:"nombre_usuario" gorm:"unique;not null;column:NombreUsuario"`
		PrimerNombre      string    `json:"primer_nombre" gorm:"not null;column:PrimerNombre"`
		SegundoNombre     string    `json:"segundo_nombre,omitempty" gorm:"column:SegundoNombre"`
		PrimerApellido    string    `json:"primer_apellido" gorm:"not null;column:PrimerApellido"`
		SegundoApellido   string    `json:"segundo_apellido,omitempty" gorm:"column:SegundoApellido"`
		CorreoElectronico string    `json:"correo_electronico" gorm:"unique;not null;column:CorreoElectronico"`
		CiudadTrabajo     string    `json:"ciudad_trabajo" gorm:"not null;column:CiudadTrabajo"`
		HashContrasena    string    `json:"hash_contrasena" gorm:"not null;column:HashContrasena"`
		FechaNacimiento   string    `json:"fecha_nacimiento,omitempty" gorm:"column:FechaNacimiento"` // Asegúrate de que la columna FechaNacimiento exista
		Rol               string    `json:"rol" gorm:"default:'user';column:Rol"`

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
	FechaNacimiento   string `json:"fecha_nacimiento" binding:"required"`
	Rol               string `json:"rol"` // Añadido Rol a CreateUserRequest
}

type UpdateUserRequest struct {
	PrimerNombre      *string `json:"primer_nombre"`
	SegundoNombre     *string `json:"segundo_nombre"`
	PrimerApellido    *string `json:"primer_apellido"`
	SegundoApellido   *string `json:"segundo_apellido"`
	CorreoElectronico *string `json:"correo_electronico"`
	CiudadTrabajo     *string `json:"ciudad_trabajo"`
	HashContrasena    *string `json:"hash_contrasena"` // Considerar si la contraseña se actualiza así
	FechaNacimiento   *string `json:"fecha_nacimiento"`
	Rol               *string `json:"rol"` // Añadido Rol a UpdateUserRequest
}
