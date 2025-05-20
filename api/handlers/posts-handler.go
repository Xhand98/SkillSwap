package handlers

import (
	"bytes"
	"encoding/json"
	"errors" // Importar el paquete errors
	"fmt"
	"io"
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

	// Contar el total de usuarios
	if err := h.DB.Model(&models.PostFullInfo{}).Count(&totalPosts).Error; err != nil {
		http.Error(w, "Error al contar usuarios: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Obtener usuarios paginados
	if result := h.DB.Limit(pageSize).Offset(offset).Find(&posts); result.Error != nil {
		http.Error(w, "Error al obtener usuarios: "+result.Error.Error(), http.StatusInternalServerError)
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

	// Cambiado para tomar el ID de la ruta, como es más estándar para GET /resource/{id}
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID de post inválido en la ruta", http.StatusBadRequest)
		return
	}

	var post models.PostFullInfo
	// Buscar en la vista por PostID
	if result := h.DB.Where("PostID = ?", id).First(&post); result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Post no encontrado", http.StatusNotFound)
		} else {
			http.Error(w, "Error al obtener post: "+result.Error.Error(), http.StatusInternalServerError)
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

	// El campo TipoPost no está en UpdatePostRequest, si se quisiera actualizar, se añadiría aquí.
	// if req.TipoPost != nil {
	// 	post.TipoPost = *req.TipoPost
	// }


	// Guardar los cambios en la base de datos
	if result := h.DB.Save(&post); result.Error != nil {
		http.Error(w, "Error al actualizar usuario: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post) // Devuelve el post actualizado desde la tabla base
}

func (h *postsHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Cambiado para tomar el ID de la ruta
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID de post inválido en la ruta", http.StatusBadRequest)
		return
	}

	// Opcional: Verificar si el post existe antes de eliminar para dar un 404 más específico
	var postForCheck models.Post
	if err := h.DB.First(&postForCheck, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			http.Error(w, "Post no encontrado para eliminar", http.StatusNotFound)
		} else {
			http.Error(w, "Error al buscar post para eliminar: "+err.Error(), http.StatusInternalServerError)
		}
		return
	}

	if result := h.DB.Delete(&models.Post{}, id); result.Error != nil {
		http.Error(w, "Error al eliminar el usuario: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *postsHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var req models.CreatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error al decodificar la solicitud: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Verificar si la habilidad existe
	var habilidad models.Ability
	if result := h.DB.First(&habilidad, req.HabilidadID); result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Habilidad no encontrada", http.StatusNotFound)
			return
		} else {
			http.Error(w, "Error al buscar habilidad: "+result.Error.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Verificar si el usuario existe
var usuario models.User // Replace "Usuario" with your actual user model
if result := h.DB.First(&usuario, req.UsuarioID); result.Error != nil {
    if errors.Is(result.Error, gorm.ErrRecordNotFound) {
        http.Error(w, "Usuario no encontrado", http.StatusNotFound)
        return
    } else {
        http.Error(w, "Error al buscar usuario: "+result.Error.Error(), http.StatusInternalServerError)
        return
    }
}

	// Crear el post
	post := models.Post {
		UsuarioID:   req.UsuarioID,
		TipoPost:    req.TipoPost,
		HabilidadID: req.HabilidadID,
		Descripcion: req.Descripcion,
	}

	if result := h.DB.Create(&post); result.Error != nil {
		http.Error(w, "Error al crear el post: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(post) // Devuelve el post creado desde la tabla base
}

func (h *postsHandler) GetPostsByUserID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	userIDStr := r.PathValue("userID") // Cambiado para tomar de PathValue
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "ID de usuario inválido en la ruta", http.StatusBadRequest)
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

// DebugHandler imprime información detallada sobre la solicitud recibida
func DebugHandler(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Imprimir información básica de la solicitud
        fmt.Printf("\n--- DEBUG REQUEST ---\n")
        fmt.Printf("Method: %s\n", r.Method)
        fmt.Printf("URL: %s\n", r.URL.String())
        fmt.Printf("ContentType: %s\n", r.Header.Get("Content-Type"))

        // Si es POST o PUT, intentar leer el cuerpo
        if r.Method == http.MethodPost || r.Method == http.MethodPut {
            // Guardar el cuerpo para poder leerlo múltiples veces
            bodyBytes, _ := io.ReadAll(r.Body)
            r.Body.Close()

            // Mostrar el cuerpo
            fmt.Printf("Body: %s\n", string(bodyBytes))

            // Restaurar el cuerpo para que pueda ser leído por el siguiente handler
            r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
        }

        fmt.Printf("--- END DEBUG ---\n\n")

        // Pasar al siguiente handler
        next.ServeHTTP(w, r)
    })
}
