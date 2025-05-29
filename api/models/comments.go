package models

import (
	"time"
)

// Comentario representa un comentario en un post
type Comentario struct {
	ComentarioID      int        `json:"comentario_id" gorm:"primaryKey;column:ComentarioID;autoIncrement"`
	PostID            int        `json:"post_id" gorm:"column:PostID;not null"`
	UsuarioID         int        `json:"usuario_id" gorm:"column:UsuarioID;not null"`
	ComentarioPadreID *int       `json:"comentario_padre_id" gorm:"column:ComentarioPadreID"`
	Contenido         string     `json:"contenido" gorm:"column:Contenido;type:nvarchar(max);not null"`
	CreatedAt         time.Time  `json:"created_at" gorm:"column:CreatedAt;default:GETDATE()"`
	UpdatedAt         time.Time  `json:"updated_at" gorm:"column:UpdatedAt;default:GETDATE()"`
	Activo            bool       `json:"activo" gorm:"column:Activo;default:true"`

	// Relaciones
	Post             *Post              `json:"post,omitempty" gorm:"foreignKey:PostID"`
	Usuario          *User              `json:"usuario,omitempty" gorm:"foreignKey:UsuarioID"`
	ComentarioPadre  *Comentario        `json:"comentario_padre,omitempty" gorm:"foreignKey:ComentarioPadreID"`
	Respuestas       []Comentario       `json:"respuestas,omitempty" gorm:"foreignKey:ComentarioPadreID"`
	Likes            []ComentarioLike   `json:"likes,omitempty" gorm:"foreignKey:ComentarioID"`
}

// TableName especifica el nombre de la tabla
func (Comentario) TableName() string {
	return "Comentarios"
}

// ComentarioLike representa un like/dislike en un comentario
type ComentarioLike struct {
	LikeID       int       `json:"like_id" gorm:"primaryKey;column:LikeID;autoIncrement"`
	ComentarioID int       `json:"comentario_id" gorm:"column:ComentarioID;not null"`
	UsuarioID    int       `json:"usuario_id" gorm:"column:UsuarioID;not null"`
	TipoVoto     string    `json:"tipo_voto" gorm:"column:TipoVoto;type:nvarchar(10);not null;check:TipoVoto IN ('like','dislike')"`
	CreatedAt    time.Time `json:"created_at" gorm:"column:CreatedAt;default:GETDATE()"`
		// Relaciones
	Comentario *Comentario `json:"comentario,omitempty" gorm:"foreignKey:ComentarioID"`
	Usuario    *User    `json:"usuario,omitempty" gorm:"foreignKey:UsuarioID"`
}

// TableName especifica el nombre de la tabla
func (ComentarioLike) TableName() string {
	return "ComentarioLikes"
}

// ComentarioCompleto representa la vista completa de un comentario
type ComentarioCompleto struct {
	ComentarioID      int       `json:"comentario_id" gorm:"column:ComentarioID"`
	PostID            int       `json:"post_id" gorm:"column:PostID"`
	UsuarioID         int       `json:"usuario_id" gorm:"column:UsuarioID"`
	ComentarioPadreID *int      `json:"comentario_padre_id" gorm:"column:ComentarioPadreID"`
	Contenido         string    `json:"contenido" gorm:"column:Contenido"`
	CreatedAt         time.Time `json:"created_at" gorm:"column:CreatedAt"`
	UpdatedAt         time.Time `json:"updated_at" gorm:"column:UpdatedAt"`
	Activo            bool      `json:"activo" gorm:"column:Activo"`
	NombreUsuario     string    `json:"nombre_usuario" gorm:"column:NombreUsuario"`
	PrimerNombre      string    `json:"primer_nombre" gorm:"column:PrimerNombre"`
	Apellido          string    `json:"apellido" gorm:"column:Apellido"`
	TotalLikes        int       `json:"total_likes" gorm:"column:TotalLikes"`
	TotalDislikes     int       `json:"total_dislikes" gorm:"column:TotalDislikes"`
	TotalRespuestas   int       `json:"total_respuestas" gorm:"column:TotalRespuestas"`
}

// TableName especifica el nombre de la vista
func (ComentarioCompleto) TableName() string {
	return "vw_ComentariosCompletos"
}

// CreateComentarioRequest representa la estructura para crear un comentario
type CreateComentarioRequest struct {
	PostID            int    `json:"post_id,omitempty"` // Opcional, se extrae de la URL
	ComentarioPadreID *int   `json:"comentario_padre_id,omitempty"`
	Contenido         string `json:"contenido"`
}

// UpdateComentarioRequest representa la estructura para actualizar un comentario
type UpdateComentarioRequest struct {
	Contenido string `json:"contenido"`
}

// ComentarioLikeRequest representa la estructura para votar en un comentario
type ComentarioLikeRequest struct {
	TipoVoto string `json:"tipo_voto"`
}

// ComentariosResponse representa la respuesta paginada de comentarios
type ComentariosResponse struct {
	Comentarios     []ComentarioCompleto `json:"comentarios"`
	TotalComentarios int                  `json:"total_comentarios"`
	Page            int                  `json:"page"`
	PageSize        int                  `json:"page_size"`
	TotalPages      int                  `json:"total_pages"`
}

// RespuestasResponse representa la respuesta de respuestas a un comentario
type RespuestasResponse struct {
	Respuestas       []ComentarioCompleto `json:"respuestas"`
	TotalRespuestas  int                  `json:"total_respuestas"`
	Page             int                  `json:"page"`
	PageSize         int                  `json:"page_size"`
	TotalPages       int                  `json:"total_pages"`
}

// ComentarioStats representa estadísticas de comentarios para un post
type ComentarioStats struct {
	PostID           int `json:"post_id"`
	TotalComentarios int `json:"total_comentarios"`
	TotalRespuestas  int `json:"total_respuestas"`
}

// EstadisticasComentario representa estadísticas de un comentario específico
type EstadisticasComentario struct {
	ComentarioID     int   `json:"comentario_id"`
	TotalLikes       int64 `json:"total_likes"`
	TotalDislikes    int64 `json:"total_dislikes"`
	TotalRespuestas  int64 `json:"total_respuestas"`
}

// Alias para compatibilidad con el handler
type CrearComentarioRequest = CreateComentarioRequest
type ActualizarComentarioRequest = UpdateComentarioRequest
type VotarComentarioRequest = ComentarioLikeRequest
