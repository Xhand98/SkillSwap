package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillswap/api/middleware"
	"skillswap/api/models"

	"gorm.io/gorm"
)

type commentsHandler struct {
	DB                  *gorm.DB
	WSHandler           *WebSocketHandler
	SocketIOBroadcaster *SocketIOBroadcaster
}

func NewCommentHandler(db *gorm.DB) *commentsHandler {
	return &commentsHandler{
		DB:                  db,
		SocketIOBroadcaster: NewSocketIOBroadcaster(),
	}
}

// SetWebSocketHandler configura el handler de WebSocket para notificaciones en tiempo real
func (h *commentsHandler) SetWebSocketHandler(wsHandler *WebSocketHandler) {
	h.WSHandler = wsHandler
}

// GetPostComments obtiene los comentarios de un post
func (h *commentsHandler) GetPostComments(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Extraer postId del path
	postID, err := extractIDFromPath(r.URL.Path, "posts")
	if err != nil {
		log.Printf("Error extrayendo postID: %v", err)
		http.Error(w, "ID de post inválido", http.StatusBadRequest)
		return
	}

	// Parámetros de paginación
	page := 1
	pageSize := 20

	if p := r.URL.Query().Get("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}

	if ps := r.URL.Query().Get("page_size"); ps != "" {
		if parsed, err := strconv.Atoi(ps); err == nil && parsed > 0 && parsed <= 100 {
			pageSize = parsed
		}
	}

	offset := (page - 1) * pageSize

	// Consultar comentarios principales (sin padre)
	var comentarios []models.ComentarioCompleto
	result := h.DB.Table("vw_ComentariosCompletos").
		Where("PostID = ? AND ComentarioPadreID IS NULL", postID).
		Order("CreatedAt ASC").
		Offset(offset).
		Limit(pageSize).
		Find(&comentarios)

	if result.Error != nil {
		log.Printf("Error consultando comentarios: %v", result.Error)
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		return
	}

	// Contar total de comentarios
	var total int64
	h.DB.Model(&models.Comentario{}).
		Where("PostID = ? AND ComentarioPadreID IS NULL AND Activo = 1", postID).
		Count(&total)

	response := map[string]interface{}{
		"comentarios": comentarios,
		"pagination": map[string]interface{}{
			"current_page": page,
			"page_size":    pageSize,
			"total":        total,
			"total_pages":  (total + int64(pageSize) - 1) / int64(pageSize),
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// CreateComment crea un nuevo comentario
func (h *commentsHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Extraer postId del path
	postID, err := extractIDFromPath(r.URL.Path, "posts")
	if err != nil {
		log.Printf("Error extrayendo postID: %v", err)
		http.Error(w, "ID de post inválido", http.StatusBadRequest)
		return
	}

	var req models.CrearComentarioRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decodificando JSON: %v", err)
		http.Error(w, "Error decodificando JSON", http.StatusBadRequest)
		return
	}	// Validaciones básicas
	if strings.TrimSpace(req.Contenido) == "" {
		http.Error(w, "Contenido es requerido", http.StatusBadRequest)
		return
	}

	// Obtener userID del contexto de autenticación
	user, authenticated := middleware.GetUserFromContext(r)
	if !authenticated {
		http.Error(w, "Autenticación requerida para crear comentarios", http.StatusUnauthorized)
		return
	}

	comentario := models.Comentario{
		PostID:            postID,
		UsuarioID:         int(user.UserID),
		ComentarioPadreID: req.ComentarioPadreID,
		Contenido:         req.Contenido,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
		Activo:            true,
	}

	result := h.DB.Create(&comentario)
	if result.Error != nil {
		log.Printf("Error creando comentario: %v", result.Error)
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		return
	}
	// Obtener el comentario completo
	var comentarioCompleto models.ComentarioCompleto
	h.DB.Table("vw_ComentariosCompletos").
		Where("ComentarioID = ?", comentario.ComentarioID).
		First(&comentarioCompleto)
	// Enviar notificación Socket.IO si el broadcaster está configurado
	if h.SocketIOBroadcaster != nil {
		h.SocketIOBroadcaster.BroadcastNewComment(uint(postID), map[string]interface{}{
			"comentario_id":       comentarioCompleto.ComentarioID,
			"post_id":             comentarioCompleto.PostID,
			"usuario_id":          comentarioCompleto.UsuarioID,
			"nombre_usuario":      comentarioCompleto.NombreUsuario,
			"primer_nombre":       comentarioCompleto.PrimerNombre,
			"apellido":            comentarioCompleto.Apellido,
			"contenido":           comentarioCompleto.Contenido,
			"comentario_padre_id": comentarioCompleto.ComentarioPadreID,
			"total_likes":         comentarioCompleto.TotalLikes,
			"total_dislikes":      comentarioCompleto.TotalDislikes,
			"total_respuestas":    comentarioCompleto.TotalRespuestas,
			"created_at":          comentarioCompleto.CreatedAt,
			"updated_at":          comentarioCompleto.UpdatedAt,
			"activo":              comentarioCompleto.Activo,
		})
	}

	// Mantener compatibilidad con WebSocket (temporal)
	if h.WSHandler != nil {
		h.WSHandler.BroadcastNewComment(comentarioCompleto)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(comentarioCompleto)
}

// GetCommentReplies obtiene las respuestas de un comentario
func (h *commentsHandler) GetCommentReplies(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Extraer comentarioId del path
	comentarioID, err := extractIDFromPath(r.URL.Path, "comments")
	if err != nil {
		log.Printf("Error extrayendo comentarioID: %v", err)
		http.Error(w, "ID de comentario inválido", http.StatusBadRequest)
		return
	}

	// Parámetros de paginación
	page := 1
	pageSize := 10

	if p := r.URL.Query().Get("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}

	if ps := r.URL.Query().Get("page_size"); ps != "" {
		if parsed, err := strconv.Atoi(ps); err == nil && parsed > 0 && parsed <= 50 {
			pageSize = parsed
		}
	}

	offset := (page - 1) * pageSize

	// Consultar respuestas
	var respuestas []models.ComentarioCompleto
	result := h.DB.Table("vw_ComentariosCompletos").
		Where("ComentarioPadreID = ?", comentarioID).
		Order("CreatedAt ASC").
		Offset(offset).
		Limit(pageSize).
		Find(&respuestas)

	if result.Error != nil {
		log.Printf("Error consultando respuestas: %v", result.Error)
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		return
	}

	// Contar total de respuestas
	var total int64
	h.DB.Model(&models.Comentario{}).
		Where("ComentarioPadreID = ? AND Activo = 1", comentarioID).
		Count(&total)

	response := map[string]interface{}{
		"respuestas": respuestas,
		"pagination": map[string]interface{}{
			"current_page": page,
			"page_size":    pageSize,
			"total":        total,
			"total_pages":  (total + int64(pageSize) - 1) / int64(pageSize),
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// UpdateComment actualiza un comentario existente
func (h *commentsHandler) UpdateComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Extraer comentarioId del path
	comentarioID, err := extractIDFromPath(r.URL.Path, "comments")
	if err != nil {
		log.Printf("Error extrayendo comentarioID: %v", err)
		http.Error(w, "ID de comentario inválido", http.StatusBadRequest)
		return
	}

	var req models.ActualizarComentarioRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decodificando JSON: %v", err)
		http.Error(w, "Error decodificando JSON", http.StatusBadRequest)
		return
	}
	// Validaciones
	if strings.TrimSpace(req.Contenido) == "" {
		http.Error(w, "Contenido es requerido", http.StatusBadRequest)
		return
	}

	// Obtener userID del contexto de autenticación
	user, authenticated := middleware.GetUserFromContext(r)
	if !authenticated {
		http.Error(w, "Autenticación requerida para actualizar comentarios", http.StatusUnauthorized)
		return
	}

	// Verificar que el comentario existe y pertenece al usuario
	var comentario models.Comentario
	result := h.DB.Where("ComentarioID = ? AND Activo = 1", comentarioID).First(&comentario)
	if result.Error != nil {
		log.Printf("Comentario no encontrado: %v", result.Error)
		http.Error(w, "Comentario no encontrado", http.StatusNotFound)
		return
	}

	// Verificar que el usuario es dueño del comentario
	if comentario.UsuarioID != int(user.UserID) {
		http.Error(w, "No tienes permiso para actualizar este comentario", http.StatusForbidden)
		return
	}
	// TODO: Extraer userID del token JWT

	// Actualizar comentario
	result = h.DB.Model(&models.Comentario{}).
		Where("ComentarioID = ? AND Activo = 1", comentarioID).
		Updates(map[string]interface{}{
			"Contenido":  req.Contenido,
			"UpdatedAt": time.Now(),
		})

	if result.Error != nil {
		log.Printf("Error actualizando comentario: %v", result.Error)
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected == 0 {
		http.Error(w, "Comentario no encontrado", http.StatusNotFound)
		return
	}

	// Obtener el comentario actualizado
	var comentarioCompleto models.ComentarioCompleto
	h.DB.Table("vw_ComentariosCompletos").
		Where("ComentarioID = ?", comentarioID).
		First(&comentarioCompleto)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comentarioCompleto)
}

// DeleteComment elimina (marca como inactivo) un comentario
func (h *commentsHandler) DeleteComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Extraer comentarioId del path
	comentarioID, err := extractIDFromPath(r.URL.Path, "comments")
	if err != nil {
		log.Printf("Error extrayendo comentarioID: %v", err)
		http.Error(w, "ID de comentario inválido", http.StatusBadRequest)
		return
	}
	// Obtener userID del contexto de autenticación
	user, authenticated := middleware.GetUserFromContext(r)
	if !authenticated {
		http.Error(w, "Autenticación requerida para eliminar comentarios", http.StatusUnauthorized)
		return
	}

	// Verificar que el comentario existe y pertenece al usuario
	var comentario models.Comentario
	result := h.DB.Where("ComentarioID = ? AND Activo = 1", comentarioID).First(&comentario)
	if result.Error != nil {
		log.Printf("Comentario no encontrado: %v", result.Error)
		http.Error(w, "Comentario no encontrado", http.StatusNotFound)
		return
	}

	// Verificar que el usuario es dueño del comentario
	if comentario.UsuarioID != int(user.UserID) {
		http.Error(w, "No tienes permiso para eliminar este comentario", http.StatusForbidden)
		return
	}

	// Marcar como inactivo (soft delete)
	result = h.DB.Model(&models.Comentario{}).
		Where("ComentarioID = ? AND Activo = 1", comentarioID).
		Update("Activo", false)

	if result.Error != nil {
		log.Printf("Error eliminando comentario: %v", result.Error)
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected == 0 {
		http.Error(w, "Comentario no encontrado", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Comentario eliminado correctamente",
	})
}

// LikeComment maneja los likes/dislikes en comentarios
func (h *commentsHandler) LikeComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Extraer comentarioId del path
	comentarioID, err := extractIDFromPath(r.URL.Path, "comments")
	if err != nil {
		log.Printf("Error extrayendo comentarioID: %v", err)
		http.Error(w, "ID de comentario inválido", http.StatusBadRequest)
		return
	}

	var req models.VotarComentarioRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decodificando JSON: %v", err)
		http.Error(w, "Error decodificando JSON", http.StatusBadRequest)
		return
	}
	// Validar tipo de voto
	if req.TipoVoto != "like" && req.TipoVoto != "dislike" {
		http.Error(w, "TipoVoto debe ser 'like' o 'dislike'", http.StatusBadRequest)
		return
	}

	// Obtener userID del contexto de autenticación
	user, authenticated := middleware.GetUserFromContext(r)
	if !authenticated {
		http.Error(w, "Autenticación requerida para votar comentarios", http.StatusUnauthorized)
		return
	}

	// Verificar si ya existe un voto del usuario
	var existingLike models.ComentarioLike
	result := h.DB.Where("ComentarioID = ? AND UsuarioID = ?", comentarioID, int(user.UserID)).
		First(&existingLike)

	if result.Error == nil {
		// Ya existe un voto, actualizarlo
		if existingLike.TipoVoto == req.TipoVoto {
			// Mismo voto, eliminar (toggle)
			h.DB.Delete(&existingLike)
		} else {
			// Voto diferente, actualizar
			h.DB.Model(&existingLike).Update("TipoVoto", req.TipoVoto)
		}	} else if result.Error == gorm.ErrRecordNotFound {
		// No existe voto, crear nuevo
		nuevoLike := models.ComentarioLike{
			ComentarioID: comentarioID,
			UsuarioID:    int(user.UserID),
			TipoVoto:     req.TipoVoto,
			CreatedAt:    time.Now(),
		}
		h.DB.Create(&nuevoLike)
	} else {
		log.Printf("Error consultando voto existente: %v", result.Error)
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		return
	}

	// Obtener estadísticas actualizadas
	stats := h.getCommentStats(comentarioID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// GetCommentStats obtiene las estadísticas de un comentario
func (h *commentsHandler) GetCommentStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Extraer comentarioId del path
	comentarioID, err := extractIDFromPath(r.URL.Path, "comments")
	if err != nil {
		log.Printf("Error extrayendo comentarioID: %v", err)
		http.Error(w, "ID de comentario inválido", http.StatusBadRequest)
		return
	}

	stats := h.getCommentStats(comentarioID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// GetPostCommentStats obtiene estadísticas de comentarios de un post
func (h *commentsHandler) GetPostCommentStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Extraer postId del path
	postID, err := extractIDFromPath(r.URL.Path, "posts")
	if err != nil {
		log.Printf("Error extrayendo postID: %v", err)
		http.Error(w, "ID de post inválido", http.StatusBadRequest)
		return
	}

	// Estructuras para las consultas
	type StatsResult struct {
		TotalComments   int    `json:"total_comments"`
		TotalLikes      int    `json:"total_likes"`
		TotalDislikes   int    `json:"total_dislikes"`
		MostActiveUser  string `json:"most_active_user"`
		AverageLength   float64 `json:"average_length"`
	}

	type TopComment struct {
		ComentarioID   int    `json:"comentario_id"`
		Contenido      string `json:"contenido"`
		TotalLikes     int    `json:"total_likes"`
		NombreUsuario  string `json:"nombre_usuario"`
	}

	var stats StatsResult
	var topComments []TopComment

	// Consulta principal para estadísticas generales
	query := `
		SELECT
			COUNT(*) as total_comments,
			ISNULL(SUM(total_likes), 0) as total_likes,
			ISNULL(SUM(total_dislikes), 0) as total_dislikes,
			ISNULL(AVG(CAST(LEN(contenido) AS FLOAT)), 0) as average_length
		FROM comentarios_con_info
		WHERE post_id = ? AND activo = 1
	`

	if err := h.DB.Raw(query, postID).Scan(&stats).Error; err != nil {
		log.Printf("Error obteniendo estadísticas: %v", err)
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		return
	}

	// Consulta para el usuario más activo
	userQuery := `
		SELECT TOP 1 nombre_usuario
		FROM comentarios_con_info
		WHERE post_id = ? AND activo = 1
		GROUP BY usuario_id, nombre_usuario
		ORDER BY COUNT(*) DESC
	`

	if err := h.DB.Raw(userQuery, postID).Scan(&stats.MostActiveUser).Error; err != nil {
		log.Printf("Error obteniendo usuario más activo: %v", err)
		// No es un error crítico, continuamos
	}

	// Consulta para los comentarios más populares
	topQuery := `
		SELECT TOP 5
			comentario_id,
			contenido,
			total_likes,
			nombre_usuario
		FROM comentarios_con_info
		WHERE post_id = ? AND activo = 1 AND total_likes > 0
		ORDER BY total_likes DESC
	`

	if err := h.DB.Raw(topQuery, postID).Scan(&topComments).Error; err != nil {
		log.Printf("Error obteniendo comentarios populares: %v", err)
		// No es un error crítico, continuamos
	}

	// Preparar respuesta
	response := map[string]interface{}{
		"totalComments":   stats.TotalComments,
		"totalLikes":      stats.TotalLikes,
		"totalDislikes":   stats.TotalDislikes,
		"mostActiveUser":  stats.MostActiveUser,
		"averageLength":   stats.AverageLength,
		"topComments":     topComments,
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error codificando respuesta: %v", err)
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		return
	}

	log.Printf("Estadísticas de comentarios para post %d enviadas exitosamente", postID)
}

// getCommentStats helper para obtener estadísticas
func (h *commentsHandler) getCommentStats(comentarioID int) models.EstadisticasComentario {
	var stats models.EstadisticasComentario
	stats.ComentarioID = comentarioID

	// Contar likes
	h.DB.Model(&models.ComentarioLike{}).
		Where("ComentarioID = ? AND TipoVoto = 'like'", comentarioID).
		Count(&stats.TotalLikes)

	// Contar dislikes
	h.DB.Model(&models.ComentarioLike{}).
		Where("ComentarioID = ? AND TipoVoto = 'dislike'", comentarioID).
		Count(&stats.TotalDislikes)

	// Contar respuestas
	h.DB.Model(&models.Comentario{}).
		Where("ComentarioPadreID = ? AND Activo = 1", comentarioID).
		Count(&stats.TotalRespuestas)

	return stats
}

// extractIDFromPath extrae un ID de una URL path
func extractIDFromPath(path, resource string) (int, error) {
	// Dividir el path por "/"
	parts := strings.Split(strings.Trim(path, "/"), "/")

	// Buscar el recurso en el path
	resourceIndex := -1
	for i, part := range parts {
		if part == resource {
			resourceIndex = i
			break
		}
	}

	// Verificar que encontramos el recurso y que hay un ID después
	if resourceIndex == -1 || resourceIndex+1 >= len(parts) {
		return 0, fmt.Errorf("no se encontró ID para el recurso %s", resource)
	}

	// Convertir el ID a entero
	id, err := strconv.Atoi(parts[resourceIndex+1])
	if err != nil {
		return 0, err
	}

	return id, nil
}
