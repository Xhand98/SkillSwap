// filepath: c:\Users\hendr\OneDrive\Documents\proyectos\Web\Nextjs\skillswap\api\handlers\user-handler.go

package handlers

import (
	"encoding/json"
	"errors" // Importar el paquete errors
	"fmt"
	"log"  // Importar el paquete log para registro
	"math" // Importar el paquete math
	"net/http"
	"strconv"
	"strings" // Importar el paquete strings para manipulación de cadenas

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
		pageSize = 20 // Aumentado de 3 a 20 para la administración
	}
	offset := (page - 1) * pageSize

	// Parámetro de búsqueda
	searchTerm := r.URL.Query().Get("search")

	var users []models.User
	var totalUsers int64

	// Construir query base
	query := h.DB.Model(&models.User{})	// Aplicar filtro de búsqueda si existe
	if searchTerm != "" {
		searchPattern := "%" + strings.ToLower(searchTerm) + "%"
		query = query.Where(
			"LOWER(NombreUsuario) LIKE ? OR LOWER(CorreoElectronico) LIKE ? OR LOWER(PrimerNombre) LIKE ? OR LOWER(PrimerApellido) LIKE ? OR LOWER(SegundoNombre) LIKE ? OR LOWER(SegundoApellido) LIKE ?",
			searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
		)
	}

	// Contar el total de usuarios (con filtro aplicado)
	if err := query.Count(&totalUsers).Error; err != nil {
		http.Error(w, "Error al contar usuarios: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Obtener usuarios paginados (con filtro aplicado)
	if result := query.Limit(pageSize).Offset(offset).Find(&users); result.Error != nil {
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
	log.Printf("CreateUser: Método recibido: %s, URL: %s", r.Method, r.URL.Path)

	if r.Method != http.MethodPost {
		log.Printf("CreateUser: Método no permitido: %s", r.Method)
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Verificar Content-Type
	contentType := r.Header.Get("Content-Type")
	log.Printf("CreateUser: Content-Type: %s", contentType)
	if contentType != "application/json" {
		log.Printf("CreateUser: Content-Type incorrecto: %s", contentType)
		http.Error(w, "Content-Type debe ser application/json", http.StatusUnsupportedMediaType)
		return
	}

	var req models.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("CreateUser: Error al decodificar el cuerpo: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("CreateUser: Datos recibidos: %+v", req)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.HashContrasena), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("CreateUser: Error al generar la contraseña: %v", err)
		http.Error(w, "Error al generar la contraseña", http.StatusInternalServerError)
		return
	}	// Generar un nombre de usuario único si está vacío o en caso de colisión
	nombreUsuario := req.NombreUsuario
	if nombreUsuario == "" {
		// Generar nombre de usuario basado en el email
		emailParts := strings.Split(req.CorreoElectronico, "@")
		if len(emailParts) > 0 {
			nombreUsuario = emailParts[0]
		} else {
			nombreUsuario = "user"
		}
	}

	// Verificar unicidad del nombre de usuario y generar alternativas si es necesario
	originalNombre := nombreUsuario
	for i := 0; i < 100; i++ { // Máximo 100 intentos
		var existingUser models.User
		result := h.DB.Where("NombreUsuario = ?", nombreUsuario).First(&existingUser)
		if result.Error != nil && errors.Is(result.Error, gorm.ErrRecordNotFound) {
			// El nombre de usuario está disponible
			break
		}
		// El nombre de usuario ya existe, generar uno nuevo
		nombreUsuario = fmt.Sprintf("%s%d", originalNombre, i+1)
	}

	log.Printf("CreateUser: Nombre de usuario generado: %s", nombreUsuario)

	user := models.User{
		NombreUsuario:    nombreUsuario,
		PrimerNombre:     req.PrimerNombre,
		SegundoNombre:    req.SegundoNombre,
		PrimerApellido:   req.PrimerApellido,
		SegundoApellido:  req.SegundoApellido,
		CorreoElectronico: req.CorreoElectronico,
		CiudadTrabajo:    req.CiudadTrabajo,
		HashContrasena:   string(hashedPassword),
	}

	if result := h.DB.Create(&user); result.Error != nil {
		log.Printf("CreateUser: Error al crear el usuario: %v", result.Error)
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("CreateUser: Usuario creado con éxito: ID=%d", user.ID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

func (h *userHandler) BanUser (w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	userId, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var user models.User
	if result := h.DB.First(&user, userId); result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Usuario no encontrado", http.StatusNotFound)
		} else {
			http.Error(w, "Error al buscar usuario: "+result.Error.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Cambiar el estado de IsBanned
	user.IsBanned = !user.IsBanned

	if result := h.DB.Save(&user); result.Error != nil {
		http.Error(w, "Error: "+result.Error.Error(), http.StatusInternalServerError)
		return // Añadido return para evitar continuar si hay error
	}

	w.Header().Set("Content-Type", "application/json") // Cambiado a application/json
	json.NewEncoder(w).Encode(user);
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
		}	}
	if req.CiudadTrabajo != nil {
		user.CiudadTrabajo = *req.CiudadTrabajo
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
