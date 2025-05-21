package handlers

import (
	"encoding/json"
	"errors" // Importar el paquete errors
	"log"    // Importar el paquete log para registro

	// Importar el paquete math
	"math"
	"net/http"
	"strconv"

	"skillswap/api/models"

	"gorm.io/gorm"
)

type postsHandler struct {
	DB *gorm.DB
}

func NewPostsHandler(db *gorm.DB) *postsHandler {
	return &postsHandler{DB: db}
}

type PaginatedPostsFullInfoResponse struct {
		Posts       []models.PostFullInfo `json:"posts"`
		TotalPosts  int64        `json:"total_posts"`
		Page        int          `json:"page"`
		PageSize    int          `json:"page_size"`
		TotalPages  int          `json:"total_pages"`
}

func (h *postsHandler) GetPosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Paginación
	pageStr := r.URL.Query().Get("page")
	pageSizeStr := r.URL.Query().Get("pageSize")
	tipoPost := r.URL.Query().Get("tipo")
	searchTerm := r.URL.Query().Get("search")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1 // Valor por defecto para la página
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize <= 0 {
		// fmt.Println(err.Error())
		pageSize = 3 // Valor por defecto para el tamaño de página
	}

	offset := (page - 1) * pageSize

	var posts []models.PostFullInfo
	var totalPosts int64

	// Inicializar la consulta base
	query := h.DB.Model(&models.PostFullInfo{})

	// Aplicar filtros si están presentes
	if tipoPost != "" {
		query = query.Where("TipoPost = ?", tipoPost)
	}

	if searchTerm != "" {
		query = query.Where("NombreHabilidad LIKE ?", "%"+searchTerm+"%")
	}

	// Contar el total de posts filtrados
	if err := query.Count(&totalPosts).Error; err != nil {
		http.Error(w, "Error al contar posts: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Obtener posts paginados con filtros
	if result := query.Limit(pageSize).Offset(offset).Find(&posts); result.Error != nil {
		http.Error(w, "Error al obtener posts: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	totalPages := int(totalPosts) / pageSize
	if totalPosts>0 {
		totalPages = int(math.Ceil(float64(totalPosts) / float64(pageSize)))
	}

	response := PaginatedPostsFullInfoResponse{
		Posts:      posts,
		TotalPosts: totalPosts,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

}

func (h *postsHandler) GetPost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Query().Get("id"))
	if err != nil {
		http.Error(w, "ID de usuario inválido", http.StatusBadRequest)
		return
	}

	var post models.PostFullInfo
	if result := h.DB.First(&post, id); result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Usuario no encontrado", http.StatusNotFound)
		} else {
			http.Error(w, "Error al obtener usuario: "+result.Error.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

func (h *postsHandler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var req models.UpdatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var post models.Post
	// Primero, obtener el usuario existente de la base de datos
	if result := h.DB.First(&post, id); result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Usuario no encontrado", http.StatusNotFound)
		} else {
			http.Error(w, "Error al buscar usuario: "+result.Error.Error(), http.StatusInternalServerError)
		}
		return
	}
	if req.Descripcion != nil {
		post.Descripcion = *req.Descripcion
	}

	if req.HabilidadID != nil {
		var habilidad models.Ability
		if result := h.DB.First(&habilidad, *req.HabilidadID); result.Error != nil {
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				http.Error(w, "Habilidad no encontrada", http.StatusNotFound)
				return
			} else {
				http.Error(w, "Error al buscar habilidad: "+result.Error.Error(), http.StatusInternalServerError)
				return
			}
		}
		post.HabilidadID = *req.HabilidadID
	}

	if req.Descripcion != nil {
		post.Descripcion = *req.Descripcion
	}


	// Guardar los cambios en la base de datos
	if result := h.DB.Save(&post); result.Error != nil {
		http.Error(w, "Error al actualizar usuario: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

func (h *postsHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Query().Get("id"))
	if err != nil {
		http.Error(w, "ID de usuario inválido", http.StatusBadRequest)
		return
	}

	if result := h.DB.Delete(&models.Post{}, id); result.Error != nil {
		http.Error(w, "Error al eliminar el usuario: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *postsHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	// Verificar explícitamente el método
	if r.Method != http.MethodPost {
		log.Printf("ERROR: Método incorrecto. Recibido %s, esperado POST", r.Method)
		http.Error(w, "Método no permitido: "+r.Method, http.StatusMethodNotAllowed)
		return
	}

	log.Printf("INFO: Procesando solicitud POST a %s", r.URL.Path)
	log.Printf("INFO: Content-Type: %s", r.Header.Get("Content-Type"))
	log.Printf("INFO: Content-Length: %d", r.ContentLength)

	// Intentar leer y decodificar el cuerpo de la solicitud
	var req models.CreatePostRequest
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		log.Printf("ERROR: Fallo al decodificar JSON: %s", err.Error())
		http.Error(w, "Error al decodificar la solicitud: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Imprimir los datos recibidos para depuración
	log.Printf("INFO: Datos de post recibidos: usuario_id=%d, tipo_post=%s, habilidad_id=%d",
		req.UsuarioID, req.TipoPost, req.HabilidadID)

	// Validar los datos recibidos
	if req.UsuarioID == 0 || req.HabilidadID == 0 || req.TipoPost == "" || req.Descripcion == "" {
		log.Printf("ERROR: Datos incompletos para crear post")
		http.Error(w, "Datos incompletos para crear el post", http.StatusBadRequest)
		return
	}

	// Verificar que la habilidad existe
	var habilidad models.Ability
	if result := h.DB.First(&habilidad, req.HabilidadID); result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			log.Printf("ERROR: Habilidad no encontrada (ID=%d)", req.HabilidadID)
			http.Error(w, "Habilidad no encontrada", http.StatusNotFound)
			return
		} else {
			log.Printf("ERROR: Fallo al buscar habilidad: %s", result.Error.Error())
			http.Error(w, "Error al buscar habilidad: "+result.Error.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Crear el post en la base de datos
	post := models.Post{
		UsuarioID:   req.UsuarioID,
		TipoPost:    req.TipoPost,
		HabilidadID: req.HabilidadID,
		Descripcion: req.Descripcion,
	}

	if result := h.DB.Create(&post); result.Error != nil {
		http.Error(w, "Error al crear el post: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Devolver el post creado
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(post)
}

func (h *postsHandler) GetPostsByUserID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	userIDStr := r.URL.Query().Get("userID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "ID de usuario inválido", http.StatusBadRequest)
		return
	}

	// Paginación
    pageStr := r.URL.Query().Get("page")
    pageSizeStr := r.URL.Query().Get("pageSize")
    page, pErr := strconv.Atoi(pageStr)
    if pErr != nil || page < 1 {
        page = 1
    }
    pageSize, psErr := strconv.Atoi(pageSizeStr)
    if psErr != nil || pageSize <= 0 {
        pageSize = 10
    }
    offset := (page - 1) * pageSize


	var posts []models.PostFullInfo
	var totalPosts int64
	query := h.DB.Model(&models.PostFullInfo{}).Where("UsuarioID = ?", userID) // <--- CAMBIO (necesita UsuarioID en la vista)

	if err := query.Count(&totalPosts).Error; err != nil {
        http.Error(w, "Error al contar posts del usuario: "+err.Error(), http.StatusInternalServerError)
        return
    }

    if result := query.Limit(pageSize).Offset(offset).Order("CreatedAt desc").Find(&posts); result.Error != nil { // <--- CAMBIO
        http.Error(w, "Error al obtener posts del usuario: "+result.Error.Error(), http.StatusInternalServerError)
        return
    }

    response := PaginatedPostsFullInfoResponse{ // <--- CAMBIO
        Posts:      posts,
        TotalPosts: totalPosts,
        Page:       page,
        PageSize:   pageSize,
        TotalPages: int(math.Ceil(float64(totalPosts) / float64(pageSize))),
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}
