package models

import "time"

type Post struct {
	ID          uint      `json:"id" gorm:"primaryKey;column:PostID"`
	UsuarioID   uint      `json:"usuario_id" gorm:"column:UsuarioID"`
	TipoPost	string    `json:"tipo_post" gorm:"column:TipoPost"`
	HabilidadID uint      `json:"habilidad_id" gorm:"column:HabilidadID"`
	Descripcion string    `json:"descripcion" gorm:"column:Descripcion"`
	CreatedAt   time.Time `json:"created_at" gorm:"column:CreatedAt;autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"column:UpdatedAt;autoUpdateTime"` // Mapeado a FechaActualizacion
}

func (Post) TableName() string {
	return "Posts"
}

type CreatePostRequest struct {
	UsuarioID   uint   `json:"usuario_id" binding:"required"`
	TipoPost	string `json:"tipo_post" binding:"required"`
	HabilidadID uint   `json:"habilidad_id" binding:"required"`
	Descripcion string `json:"descripcion" binding:"required"`
}
type UpdatePostRequest struct {
	UsuarioID   *uint   `json:"usuario_id,omitempty"`
	HabilidadID *uint   `json:"habilidad_id,omitempty"`
	Descripcion *string `json:"descripcion,omitempty"`
}
// PostFullInfo representa los datos de la vista vw_PostFullInfo.
type PostFullInfo struct {
    PostID          uint      `json:"post_id" gorm:"column:PostID;primaryKey"` // Es buena idea tener una primaryKey para GORM, incluso en vistas
    NombreUsuario   string    `json:"nombre_usuario" gorm:"column:NombreUsuario"`
    NombreHabilidad string    `json:"nombre_habilidad" gorm:"column:NombreHabilidad"`
    TipoPost        string    `json:"tipo_post" gorm:"column:TipoPost"` // Asegúrate que este campo exista en tu vista
    Descripcion     string    `json:"descripcion" gorm:"column:Descripcion"`
    CreatedAt       time.Time `json:"created_at" gorm:"column:CreatedAt"` // Asegúrate que el nombre de columna coincida
    UpdatedAt       time.Time `json:"updated_at" gorm:"column:UpdatedAt"` // Asegúrate que el nombre de columna coincida
}
func (PostFullInfo) TableName() string {
	return "vw_PostFullInfo"
}
