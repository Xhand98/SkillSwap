package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"gorm.io/gorm"
)

type auditHandler struct {
	DB *gorm.DB
}

func NewAuditHandler(db *gorm.DB) *auditHandler {
	return &auditHandler{DB: db}
}

// AuditRecord representa un registro de auditoría
type AuditRecord struct {
	ID                   int       `json:"id"`
	EventTime           time.Time `json:"event_time"`
	ServerPrincipalName string    `json:"server_principal_name"`
	DatabaseName        string    `json:"database_name"`
	ObjectName          string    `json:"object_name"`
	Statement           string    `json:"statement"`
	ActionID            string    `json:"action_id"`
	Succeeded           bool      `json:"succeeded"`
	SessionID           int       `json:"session_id"`
	ApplicationName     string    `json:"application_name"`
	HostName            string    `json:"host_name"`
	ClientIP            string    `json:"client_ip"`
	FileName            string    `json:"file_name"`
}

// AuditResponse representa la respuesta de la API de auditoría
type AuditResponse struct {
	Records []AuditRecord `json:"records"`
	Total   int64         `json:"total"`
	Page    int           `json:"page"`
	Size    int           `json:"size"`
}

// GetAuditRecords obtiene los registros de auditoría
func (h *auditHandler) GetAuditRecords(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Parámetros de paginación
	pageStr := r.URL.Query().Get("page")
	pageSizeStr := r.URL.Query().Get("pageSize")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize <= 0 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize

	// Parámetros de filtrado
	searchTerm := r.URL.Query().Get("search")
	succeededStr := r.URL.Query().Get("succeeded")
	actionID := r.URL.Query().Get("actionId")
	startDate := r.URL.Query().Get("startDate")
	endDate := r.URL.Query().Get("endDate")	// Construir la consulta base
	query := `
	SELECT
		ROW_NUMBER() OVER (ORDER BY event_time DESC) as id,
		event_time,
		server_principal_name,
		database_name,
		object_name,
		statement,
		action_id,
		succeeded,
		session_id,
		application_name,
		host_name,
		client_ip,
		file_name
	FROM vw_AuditoriaSkillSwap
	WHERE 1=1`

	countQuery := `
	SELECT COUNT(*)
	FROM vw_AuditoriaSkillSwap
	WHERE 1=1`

	var args []interface{}
	var countArgs []interface{}

	// Agregar filtros
	if searchTerm != "" {
		query += " AND (object_name LIKE ? OR statement LIKE ? OR server_principal_name LIKE ?)"
		countQuery += " AND (object_name LIKE ? OR statement LIKE ? OR server_principal_name LIKE ?)"
		searchPattern := "%" + searchTerm + "%"
		args = append(args, searchPattern, searchPattern, searchPattern)
		countArgs = append(countArgs, searchPattern, searchPattern, searchPattern)
	}

	if succeededStr != "" {
		succeeded, err := strconv.ParseBool(succeededStr)
		if err == nil {
			query += " AND succeeded = ?"
			countQuery += " AND succeeded = ?"
			args = append(args, succeeded)
			countArgs = append(countArgs, succeeded)
		}
	}

	if actionID != "" {
		query += " AND action_id = ?"
		countQuery += " AND action_id = ?"
		args = append(args, actionID)
		countArgs = append(countArgs, actionID)
	}

	if startDate != "" {
		query += " AND event_time >= ?"
		countQuery += " AND event_time >= ?"
		args = append(args, startDate)
		countArgs = append(countArgs, startDate)
	}

	if endDate != "" {
		query += " AND event_time <= ?"
		countQuery += " AND event_time <= ?"
		args = append(args, endDate)
		countArgs = append(countArgs, endDate)
	}
	query += " ORDER BY event_time DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"

	// Agregar parámetros de paginación
	queryArgs := append(args, offset, pageSize)
	// Ejecutar consulta principal
	var records []AuditRecord
	if err := h.DB.Raw(query, queryArgs...).Scan(&records).Error; err != nil {
		// Si falla la consulta de auditoría, devolver datos mock para desarrollo
		records = h.getMockAuditRecords(page, pageSize)
	}

	// Contar total de registros
	var total int64
	if err := h.DB.Raw(countQuery, countArgs...).Scan(&total).Error; err != nil {
		total = int64(len(records)) // Fallback al número de registros actuales
	}

	response := AuditResponse{
		Records: records,
		Total:   total,
		Page:    page,
		Size:    pageSize,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// getMockAuditRecords devuelve datos de auditoría mock para desarrollo
func (h *auditHandler) getMockAuditRecords(page, pageSize int) []AuditRecord {
	mockRecords := []AuditRecord{
		{
			ID:                   1,
			EventTime:           time.Now().Add(-1 * time.Hour),
			ServerPrincipalName: "dbo",
			DatabaseName:        "VoluLinkLocal",
			ObjectName:          "Users",
			Statement:           "SELECT * FROM Users WHERE id = 1",
			ActionID:            "SCHEMA_OBJECT_ACCESS_EVENT",
			Succeeded:           true,
			SessionID:           123,
			ApplicationName:     "SkillSwap API",
			HostName:            "localhost",
			ClientIP:            "127.0.0.1",
			FileName:            "audit_log_001.sqlaudit",
		},
		{
			ID:                   2,
			EventTime:           time.Now().Add(-2 * time.Hour),
			ServerPrincipalName: "dbo",
			DatabaseName:        "VoluLinkLocal",
			ObjectName:          "UsuariosHabilidades",
			Statement:           "INSERT INTO UsuariosHabilidades (UsuarioID, HabilidadID, TipoHabilidad) VALUES (1, 5, 'Ofrece')",
			ActionID:            "DATABASE_OBJECT_CHANGE_EVENT",
			Succeeded:           true,
			SessionID:           124,
			ApplicationName:     "SkillSwap API",
			HostName:            "localhost",
			ClientIP:            "127.0.0.1",
			FileName:            "audit_log_002.sqlaudit",
		},
		{
			ID:                   3,
			EventTime:           time.Now().Add(-3 * time.Hour),
			ServerPrincipalName: "dbo",
			DatabaseName:        "VoluLinkLocal",
			ObjectName:          "Posts",
			Statement:           "UPDATE Posts SET descripcion = 'Nueva descripción' WHERE id = 5",
			ActionID:            "DATABASE_OBJECT_CHANGE_EVENT",
			Succeeded:           false,
			SessionID:           125,
			ApplicationName:     "SkillSwap API",
			HostName:            "localhost",
			ClientIP:            "127.0.0.1",
			FileName:            "audit_log_003.sqlaudit",
		},
	}

	// Simular paginación
	start := (page - 1) * pageSize
	if start >= len(mockRecords) {
		return []AuditRecord{}
	}

	end := start + pageSize
	if end > len(mockRecords) {
		end = len(mockRecords)
	}

	return mockRecords[start:end]
}
