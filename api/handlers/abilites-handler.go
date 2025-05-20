package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"skillswap/api/models"
	"strconv"

	"gorm.io/gorm"
)

type abilityHandler struct {
	DB *gorm.DB
}

func NewAbilityHandler(db *gorm.DB) *abilityHandler {
	return &abilityHandler{DB: db}
}

func (h *abilityHandler) GetAbilities(w http.ResponseWriter, r *http.Request) {
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

	var abilities []models.Ability
	var totalAbilities int64

	if err := h.DB.Model(&models.Ability{}).Count(&totalAbilities).Error; err != nil {
		http.Error(w, "Error al contar usuarios: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if result := h.DB.Limit(pageSize).Offset(offset).Find(&abilities); result.Error != nil {
		http.Error(w, "Error al obtener usuarios: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	type PaginatedUsersResponse struct {
		Abilities  []models.Ability `json:"abilities"`
		TotalUsers int64           `json:"total_users"`
		Page       int             `json:"page"`
		PageSize   int             `json:"page_size"`
		TotalPages int             `json:"total_pages"`

	}

	totalPages := int(totalAbilities / int64(pageSize))

	response := PaginatedUsersResponse{
		Abilities:  abilities,
		TotalUsers: totalAbilities,

		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}


	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *abilityHandler) GetAbility(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var ability models.Ability

	if result := h.DB.First(&ability, id); result.Error != nil {
		http.Error(w, "Habilidad no encontrada", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ability)
}

func (h *abilityHandler) CreateAbility(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var ability models.CreateAbilityRequest
	if err := json.NewDecoder(r.Body).Decode(&ability); err != nil {
		http.Error(w, "Error al decodificar la solicitud", http.StatusBadRequest)
		return
	}

	newAbility := models.Ability{
		Name:        ability.Name,
		Category:    ability.Category,
		Description: ability.Description,
	}

	if result := h.DB.Create(&newAbility); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newAbility)
}

func (h *abilityHandler) UpdateAbility(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var ability models.UpdateAbilityRequest
	if err := json.NewDecoder(r.Body).Decode(&ability); err != nil {
		http.Error(w, "Error al decodificar la solicitud", http.StatusBadRequest)
		return
	}

	var existingAbility models.Ability
	if result := h.DB.First(&existingAbility, id); result.Error != nil {
		http.Error(w, "Habilidad no encontrada", http.StatusNotFound)
		return
	}

	if ability.Name != nil {
		existingAbility.Name = *ability.Name
	}
	if ability.Category != nil {
		existingAbility.Category = *ability.Category
	}
	if ability.Description != nil {
		existingAbility.Description = *ability.Description
	}

	if result := h.DB.Save(&existingAbility); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(existingAbility)
}

func (h *abilityHandler) DeleteAbility(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	if result := h.DB.Delete(&models.Ability{}, id); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
