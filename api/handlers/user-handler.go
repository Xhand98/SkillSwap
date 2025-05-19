package handlers

import (
	"encoding/json"
	"errors" // Importar el paquete errors
	"fmt"
	"math" // Importar el paquete math
	"net/http"
	"strconv"

	"golang.org/x/crypto/bcrypt"

	"skillswap/api/models"

	"gorm.io/gorm"
)

type userHandler struct {
	DB *gorm.DB
}

func NewUserHandler(db *gorm.DB) *userHandler {
	return &userHandler{DB: db}
}

func (h *userHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
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
		fmt.Println(err.Error())
		pageSize = 3 // Valor por defecto para el tamaño de página
	}

	offset := (page - 1) * pageSize

	var users []models.User
	var totalUsers int64

	// Contar el total de usuarios
	if err := h.DB.Model(&models.User{}).Count(&totalUsers).Error; err != nil {
		http.Error(w, "Error al contar usuarios: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Obtener usuarios paginados
	if result := h.DB.Limit(pageSize).Offset(offset).Find(&users); result.Error != nil {
		http.Error(w, "Error al obtener usuarios: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Estructura de respuesta que incluye los usuarios y la información de paginación
	type PaginatedUsersResponse struct {
		Users      []models.User `json:"users"`
		TotalUsers int64         `json:"total_users"`
		Page       int           `json:"page"`
		PageSize   int           `json:"page_size"`
		TotalPages int           `json:"total_pages"`
	}

	totalPages := 0
	if pageSize > 0 {
		totalPages = int(math.Ceil(float64(totalUsers) / float64(pageSize)))
	}

	response := PaginatedUsersResponse{
		Users:      users,
		TotalUsers: totalUsers,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *userHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var user models.User

	if result := h.DB.First(&user, id); result.Error != nil {
		http.Error(w, "Usuario no encontrado", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)

}
func (h *userHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}



	var req models.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.HashContrasena), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error al generar la contraseña", http.StatusInternalServerError)
		return
	}

	user := models.User{
		NombreUsuario:    req.NombreUsuario,
		PrimerNombre:     req.PrimerNombre,
		SegundoNombre:    req.SegundoNombre,
		PrimerApellido:   req.PrimerApellido,
		SegundoApellido:  req.SegundoApellido,
		CorreoElectronico: req.CorreoElectronico,
		CiudadTrabajo:    req.CiudadTrabajo,
		HashContrasena:   string(hashedPassword),
		FechaNacimiento:  req.FechaNacimiento,
	}

	if result := h.DB.Create(&user); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

func (h *userHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var req models.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var user models.User
	// Primero, obtener el usuario existente de la base de datos
	if result := h.DB.First(&user, id); result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Usuario no encontrado", http.StatusNotFound)
		} else {
			http.Error(w, "Error al buscar usuario: "+result.Error.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Actualizar campos si se proporcionan en la solicitud
	if req.PrimerNombre != nil {
		user.PrimerNombre = *req.PrimerNombre
	}
	if req.SegundoNombre != nil {
		user.SegundoNombre = *req.SegundoNombre // Asumiendo que "" es una forma válida de limpiar o se maneja en el modelo/DB
	}
	if req.PrimerApellido != nil {
		user.PrimerApellido = *req.PrimerApellido
	}
	if req.SegundoApellido != nil {
		user.SegundoApellido = *req.SegundoApellido
	}
	if req.CorreoElectronico != nil {
		// Validar unicidad si el correo cambia
		if *req.CorreoElectronico != user.CorreoElectronico {
			var existingUser models.User
			if err := h.DB.Where("correo_electronico = ? AND \"UsuarioID\" != ?", *req.CorreoElectronico, user.ID).First(&existingUser).Error; err == nil {
				http.Error(w, "El correo electrónico ya está en uso por otro usuario", http.StatusConflict)
				return
			} else if !errors.Is(err, gorm.ErrRecordNotFound) {
				http.Error(w, "Error al verificar correo: "+err.Error(), http.StatusInternalServerError)
				return
			}
			user.CorreoElectronico = *req.CorreoElectronico
		}
	}
	if req.CiudadTrabajo != nil {
		user.CiudadTrabajo = *req.CiudadTrabajo
	}
	if req.FechaNacimiento != nil {
		user.FechaNacimiento = *req.FechaNacimiento
	}
	if req.Rol != nil {
		user.Rol = *req.Rol
	}

	// Manejar actualización de contraseña si se proporciona una nueva
	if req.HashContrasena != nil && *req.HashContrasena != "" {
		hashedPasswordBytes, err := bcrypt.GenerateFromPassword([]byte(*req.HashContrasena), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Error al generar hash para la nueva contraseña", http.StatusInternalServerError)
			return
		}
		user.HashContrasena = string(hashedPasswordBytes) // Asignar al campo correcto
	}

	// Guardar los cambios en la base de datos
	if result := h.DB.Save(&user); result.Error != nil {
		http.Error(w, "Error al actualizar usuario: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *userHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	if result := h.DB.Delete(&models.User{}, id); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
