package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"reflect"
	"skillswap/api/models"
	"strconv"

	"gorm.io/gorm"
)

type matchesHandler struct {
	DB *gorm.DB
}

func NewMatchesHandler(db *gorm.DB) *matchesHandler {
	return &matchesHandler{DB: db}
}

// CreateMatch crea un nuevo emparejamiento.
func (h *matchesHandler) CreateMatch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var req models.CreateMatchesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error al decodificar la solicitud: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validación básica (puedes añadir más según tus reglas de negocio)
	if req.UserID1 == req.UserID2 {
		http.Error(w, "Un usuario no puede emparejarse consigo mismo.", http.StatusBadRequest)
		return
	}

	match := models.Matches{
		UserID1:       req.UserID1,
		UserID2:       req.UserID2,
		Habilidad1ID:  req.Habilidad1ID,
		Habilidad2ID:  req.Habilidad2ID,
		MatchingState: req.MatchingState, // Asumiendo que el estado inicial se envía en la solicitud
	}

	// Opcional: Verificar existencia de Usuarios y Habilidades
	// ...

	if result := h.DB.Create(&match); result.Error != nil {
		http.Error(w, "Error al crear el emparejamiento: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Precargar datos relacionados para la respuesta
	if err := h.DB.Preload("User1").Preload("User2").Preload("Ability1").Preload("Ability2").First(&match, match.ID).Error; err != nil {
		// Manejar el error si la precarga falla, aunque el emparejamiento ya se creó.
		// Podrías devolver el match sin los datos precargados o loguear el error.
		http.Error(w, "Emparejamiento creado, pero hubo un error al cargar datos relacionados: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(match)
}

// GetMatches obtiene todos los emparejamientos.
func (h *matchesHandler) GetMatches(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var matches []models.Matches
	if result := h.DB.Preload("User1").Preload("User2").Preload("Ability1").Preload("Ability2").Find(&matches); result.Error != nil {
		http.Error(w, "Error al obtener emparejamientos: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matches)
}

// GetMatch obtiene un emparejamiento específico por su ID.
func (h *matchesHandler) GetMatch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID de emparejamiento inválido", http.StatusBadRequest)
		return
	}

	var match models.Matches
	if result := h.DB.Preload("User1").Preload("User2").Preload("Ability1").Preload("Ability2").First(&match, id); result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Emparejamiento no encontrado", http.StatusNotFound)
		} else {
			http.Error(w, "Error al obtener emparejamiento: "+result.Error.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(match)
}

// UpdateMatch actualiza un emparejamiento existente.
func (h *matchesHandler) UpdateMatch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID de emparejamiento inválido", http.StatusBadRequest)
		return
	}

	var req models.UpdateMatchesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error al decodificar la solicitud: "+err.Error(), http.StatusBadRequest)
		return
	}

	var existingMatch models.Matches
	if result := h.DB.First(&existingMatch, id); result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Emparejamiento no encontrado", http.StatusNotFound)
		} else {
			http.Error(w, "Error al buscar emparejamiento: "+result.Error.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Actualizar campos si se proporcionan
	if req.UserID1 != nil {
		existingMatch.UserID1 = *req.UserID1
	}
	if req.UserID2 != nil {
		existingMatch.UserID2 = *req.UserID2
	}
	if req.Habilidad1ID != nil {
		existingMatch.Habilidad1ID = *req.Habilidad1ID
	}
	if req.Habilidad2ID != nil {
		existingMatch.Habilidad2ID = *req.Habilidad2ID
	}
	if req.MatchingState != nil {
		existingMatch.MatchingState = *req.MatchingState
	}
	// Considerar validaciones adicionales, como no permitir que UserID1 == UserID2

	if result := h.DB.Save(&existingMatch); result.Error != nil {
		http.Error(w, "Error al actualizar el emparejamiento: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Precargar datos relacionados para la respuesta actualizada
	if err := h.DB.Preload("User1").Preload("User2").Preload("Ability1").Preload("Ability2").First(&existingMatch, existingMatch.ID).Error; err != nil {
		http.Error(w, "Emparejamiento actualizado, pero hubo un error al cargar datos relacionados: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(existingMatch)
}

// DeleteMatch elimina un emparejamiento.
func (h *matchesHandler) DeleteMatch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "ID de emparejamiento inválido", http.StatusBadRequest)
		return
	}

	if result := h.DB.Delete(&models.Matches{}, id); result.Error != nil {
		http.Error(w, "Error al eliminar el emparejamiento: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetMatchesByUserID obtiene todos los emparejamientos para un usuario específico (ya sea como UserID1 o UserID2).
func (h *matchesHandler) GetMatchesByUserID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	userID, err := strconv.Atoi(r.PathValue("userID"))
	if err != nil {
		http.Error(w, "ID de usuario inválido", http.StatusBadRequest)
		return
	}

	var matches []models.Matches
	if result := h.DB.Preload("User1").Preload("User2").Preload("Ability1").Preload("Ability2").
		Where("Usuario1ID = ? OR Usuario2ID = ?", userID, userID).
		Find(&matches); result.Error != nil {
		http.Error(w, "Error al obtener emparejamientos del usuario: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matches)
}

func (h *matchesHandler) GetPotentialMatches(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// 1. Parsear parámetros query: userId y abilityId
	userIDStr := r.URL.Query().Get("userId")
	abilityIDStr := r.URL.Query().Get("abilityId")
	if userIDStr == "" || abilityIDStr == "" {
		http.Error(w, "Faltan parámetros userId o abilityId", http.StatusBadRequest)
		return
	}

	userIDInt, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "userId inválido", http.StatusBadRequest)
		return
	}
	abilityIDInt, err := strconv.Atoi(abilityIDStr)
	if err != nil {
		http.Error(w, "abilityId inválido", http.StatusBadRequest)
		return
	}

	userID := uint(userIDInt)
	abilityID := uint(abilityIDInt)

	// 2. Obtener lista de ability_id que el usuario actual "Ofrece"
	var offeredAbilities []uint
	if err := h.DB.
		Model(&models.UserAbility{}).
		Where("UsuarioID = ? AND TipoHabilidad = ?", userID, "Ofrece").
		Debug().
		Pluck("HabilidadID", &offeredAbilities).Error; err != nil {
		http.Error(w, "Error al obtener habilidades ofrecidas del usuario: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if len(offeredAbilities) == 0 {
		// Si el usuario no ofrece nada, no hay posibles matches
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]models.User{})
		return
	}

	// 3. Buscar usuarios que "Ofrecen" la abilityID, excluyendo al usuario actual
	var candidates []models.User
	if err := h.DB.
		Table("Usuarios").
		Select("Usuarios.*").
		Joins("JOIN UsuariosHabilidades ua ON ua.UsuarioID = Usuarios.UsuarioID").
		Where("ua.HabilidadID = ? AND ua.TipoHabilidad = ? AND Usuarios.UsuarioID <> ?", abilityID, "Ofrece", userID).
		Preload("UserAbilities").
		Preload("UserAbilities.Ability").
		Debug().
		Find(&candidates).Error; err != nil {
		http.Error(w, "Error al obtener candidatos: "+err.Error(), http.StatusInternalServerError)
		return
	}
	// 4. Filtrar aquellos candidatos que, a la vez, buscan alguna habilidad que el usuario actual ofrece
	var finalMatches []models.User
	for _, candidato := range candidates {
		// Corregir el ID del usuario para usar el campo correcto
		// Verificamos que la propiedad ID esté configurada correctamente
		userID := candidato.ID
		if userID == 0 {
			// Intentamos obtener el ID usando el campo UsuarioID del modelo User
			userIDField := reflect.ValueOf(candidato).FieldByName("UsuarioID")
			if userIDField.IsValid() && userIDField.Kind() == reflect.Uint {
				userID = uint(userIDField.Uint())
			}
		}

		var count int64
		if err := h.DB.
			Model(&models.UserAbility{}).
			Where("UsuarioID = ? AND TipoHabilidad = ? AND HabilidadID IN ?", userID, "Busca", offeredAbilities).
			Debug().
			Count(&count).Error; err != nil {
			http.Error(w, "Error al filtrar candidatos: "+err.Error(), http.StatusInternalServerError)
			return
		}
		if count > 0 {
			// Obtener un usuario completo con todas sus habilidades y relaciones
			var userCompleto models.User
			if err := h.DB.
				Preload("UserAbilities").
				Preload("UserAbilities.Ability").
				First(&userCompleto, userID).Error; err != nil {
				continue // Si hay un error, continuar con el siguiente candidato
			}
			finalMatches = append(finalMatches, userCompleto)
		}
	}

	// 5. Devolver JSON con los usuarios que cumplen ambas condiciones
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// Si no hay matches, devolver un array vacío en lugar de null
	if finalMatches == nil {
		finalMatches = []models.User{}
	}

	json.NewEncoder(w).Encode(finalMatches)
}

func (h *matchesHandler) CheckMatch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Obtener IDs de usuario de query params
	user1Str := r.URL.Query().Get("user1")
	user2Str := r.URL.Query().Get("user2")

	if user1Str == "" || user2Str == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"exists": false,
			"error":  "Se requieren ambos parámetros: user1 y user2",
		})
		return
	}

	user1ID, err1 := strconv.Atoi(user1Str)
	user2ID, err2 := strconv.Atoi(user2Str)

	if err1 != nil || err2 != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"exists": false,
			"error":  "IDs de usuario inválidos",
		})
		return
	}

	// Buscar match (considerando ambas direcciones: user1->user2 o user2->user1)
	var matchID int
	var exists bool

	row := h.DB.Raw(`
		SELECT EmparejamientoID
		FROM Emparejamientos
		WHERE (Usuario1ID = ? AND Usuario2ID = ?) OR (Usuario1ID = ? AND Usuario2ID = ?)
		LIMIT 1
	`, user1ID, user2ID, user2ID, user1ID).Row()

	if err := row.Scan(&matchID); err != nil {
		// No encontrado
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"exists":   false,
			"match_id": nil,
		})
		return
	}

	// Match encontrado
	exists = true
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"exists":   exists,
		"match_id": matchID,
	})
}
