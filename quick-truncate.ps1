# TRUNCATE RÁPIDO - Una línea de comando
# Ejecuta el truncate básico sin confirmaciones

Write-Host "🚀 TRUNCATE RÁPIDO - Eliminando todos los datos..." -ForegroundColor Red

# Ejecutar directamente con sqlcmd
sqlcmd -S localhost -d SkillSwapDB -i ".\database\truncate_all_tables.sql" -E

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de datos limpiada exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error durante el truncate" -ForegroundColor Red
}
