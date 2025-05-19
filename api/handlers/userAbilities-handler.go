package handlers

import (
	"encoding/json"
	"net/http"
	"skillswap/api/models"
	"strconv"

	"gorm.io/gorm"
)

type userAbilitiesHandler struct {
	DB *gorm.DB
}

func NewUserAbilitiesHandler(db *gorm.DB) *userAbilitiesHandler {
	return &userAbilitiesHandler{DB: db}
}

func (h *userAbilitiesHandler) CreateUserAbilities(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var req models.CreateUserAbilityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error al decodificar la solicitud: "+err.Error(), http.StatusBadRequest)
		return
	}

	if req.SkillType != "Ofrece" && req.SkillType != "Busca" {
		http.Error(w, "Tipo de habilidad inválido", http.StatusBadRequest)
		return
	}

	userAbility := models.UserAbility {
		UserID:    req.UserID,
		AbilityID: req.AbilityID,
		SkillType: req.SkillType,
		ProficiencyLevel: req.ProficiencyLevel,
	}

	var user models.User
	if err := h.DB.First(&user, req.UserID).Error; err != nil {
		http.Error(w, "Usuario no encontrado: "+err.Error(), http.StatusNotFound)
		return
	}

	var ability models.Ability
	if err := h.DB.First(&ability, req.AbilityID).Error; err != nil {
		http.Error(w, "Habilidad no encontrada: "+err.Error(), http.StatusNotFound)
		return
	}

	if result := h.DB.Create(&userAbility); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userAbility)
}

func (h *userAbilitiesHandler) GetUserAbilities(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var userAbilities []models.UserAbility
	// MODIFICACIÓN: Añadir Preload
	if result := h.DB.Preload("User").Preload("Ability").Find(&userAbilities); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userAbilities)
}

func (h *userAbilitiesHandler) GetUserAbility(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var userAbility models.UserAbility
	// MODIFICACIÓN: Añadir Preload
	if result := h.DB.Preload("User").Preload("Ability").First(&userAbility, id); result.Error != nil {
		// Considerar verificar gorm.ErrRecordNotFound para un error 404 más específico
		http.Error(w, result.Error.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userAbility)
}

func (h *userAbilitiesHandler) UpdateUserAbility(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var req models.UpdateUserAbilityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error al decodificar la solicitud: "+err.Error(), http.StatusBadRequest)
		return
	}

	var userAbility models.UserAbility
	if result := h.DB.First(&userAbility, id); result.Error != nil {
		http.Error(w, "Habilidad de usuario no encontrada: "+result.Error.Error(), http.StatusNotFound)
		return
	}

	if req.UserID != nil {
		userAbility.UserID = *req.UserID
	}
	if req.AbilityID != nil {
		userAbility.AbilityID = *req.AbilityID
	}
	if req.SkillType != nil {
		userAbility.SkillType = *req.SkillType
	}
	if req.ProficiencyLevel != nil {
		userAbility.ProficiencyLevel = *req.ProficiencyLevel
	}

	if result := h.DB.Save(&userAbility); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userAbility)
}

func (h *userAbilitiesHandler) DeleteUserAbility(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	if result := h.DB.Delete(&models.UserAbility{}, id); result.Error != nil {
		http.Error(w, "Error al eliminar la habilidad de usuario: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *userAbilitiesHandler) GetUserAbilitiesByUserID(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
        return
    }

    userID, err := strconv.Atoi(r.PathValue("id")) // "id" es el nombre del parámetro en tu ruta
    if err != nil {
        http.Error(w, "ID de usuario inválido: "+err.Error(), http.StatusBadRequest)
        return
    }

    var userAbilities []models.UserAbility
    if result := h.DB.Preload("User").Preload("Ability").Where("UsuarioID = ?", userID).Find(&userAbilities); result.Error != nil {
        http.Error(w, "Error al obtener habilidades del usuario: "+result.Error.Error(), http.StatusInternalServerError)
        return
    }

    if len(userAbilities) == 0 {
        // Opcional: Devolver 200 con un array vacío o 404 si prefieres indicar que no hay relaciones para ese usuario.
        // Por ahora, devolvemos 200 con un array vacío, que es común.
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode([]models.UserAbility{}) // Devuelve un array vacío
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(userAbilities)
}
