# Script de PowerShell para ejecutar TRUNCATE de todas las tablas
# Autor: GitHub Copilot
# Fecha: 25 de mayo de 2025

param(
    [switch]$Safe = $false,
    [switch]$Backup = $false,
    [string]$Server = "localhost",
    [string]$Database = "SkillSwapDB",
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "TRUNCATE ALL TABLES - Script de limpieza de base de datos" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "USO:" -ForegroundColor Yellow
    Write-Host "  .\truncate-database.ps1 [-Safe] [-Backup] [-Server servidor] [-Database bd]"
    Write-Host ""
    Write-Host "PARÁMETROS:" -ForegroundColor Yellow
    Write-Host "  -Safe      : Usa el script seguro con verificaciones adicionales"
    Write-Host "  -Backup    : Crea backup antes de truncar (solo con -Safe)"
    Write-Host "  -Server    : Servidor SQL Server (default: localhost)"
    Write-Host "  -Database  : Nombre de la base de datos (default: SkillSwapDB)"
    Write-Host "  -Help      : Muestra esta ayuda"
    Write-Host ""
    Write-Host "EJEMPLOS:" -ForegroundColor Green
    Write-Host "  .\truncate-database.ps1                    # Truncate básico"
    Write-Host "  .\truncate-database.ps1 -Safe              # Truncate seguro"
    Write-Host "  .\truncate-database.ps1 -Safe -Backup      # Truncate con backup"
    Write-Host ""
    return
}

Write-Host "🗃️  TRUNCATE ALL TABLES - SkillSwap Database" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si SQL Server está disponible
Write-Host "📡 Verificando conectividad con SQL Server..." -ForegroundColor Yellow

try {
    $connectionString = "Server=$Server;Database=master;Integrated Security=true;TrustServerCertificate=true;"
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    $connection.Close()
    Write-Host "✅ Conexión exitosa con SQL Server" -ForegroundColor Green
} catch {
    Write-Host "❌ Error de conexión con SQL Server:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Sugerencias:" -ForegroundColor Yellow
    Write-Host "  - Verificar que SQL Server esté ejecutándose"
    Write-Host "  - Verificar el nombre del servidor: $Server"
    Write-Host "  - Verificar permisos de acceso a la base de datos"
    return
}

# Seleccionar el script apropiado
if ($Safe) {
    $scriptPath = ".\database\truncate_all_tables_safe.sql"
    Write-Host "🛡️  Usando script SEGURO con verificaciones adicionales" -ForegroundColor Green
} else {
    $scriptPath = ".\database\truncate_all_tables.sql"
    Write-Host "⚡ Usando script BÁSICO (más rápido)" -ForegroundColor Yellow
}

# Verificar que el script existe
if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ Error: No se encontró el script SQL en: $scriptPath" -ForegroundColor Red
    return
}

Write-Host "📄 Script seleccionado: $scriptPath" -ForegroundColor Cyan
Write-Host "🎯 Servidor: $Server" -ForegroundColor Cyan
Write-Host "🗄️  Base de datos: $Database" -ForegroundColor Cyan
Write-Host ""

# Confirmación del usuario
Write-Host "⚠️  ADVERTENCIA: Esta operación eliminará TODOS los datos de la base de datos" -ForegroundColor Red
Write-Host "⚠️  Esta acción NO se puede deshacer" -ForegroundColor Red
Write-Host ""

if ($Backup -and $Safe) {
    Write-Host "📋 NOTA: Se crearán tablas de backup antes del truncate" -ForegroundColor Green
    Write-Host ""
}

$confirmation = Read-Host "¿Estás seguro de que quieres continuar? Escribe 'SI' para confirmar"

if ($confirmation -ne "SI") {
    Write-Host "❌ Operación cancelada por el usuario" -ForegroundColor Yellow
    return
}

Write-Host ""
Write-Host "🚀 Iniciando proceso de TRUNCATE..." -ForegroundColor Green
Write-Host ""

# Modificar el script si se solicita backup
if ($Backup -and $Safe) {
    $sqlContent = Get-Content $scriptPath -Raw
    $sqlContent = $sqlContent -replace '/\*[\s\S]*?\*/', ''  # Descomentar sección de backup
    $sqlContent = $sqlContent -replace '--\s*(SELECT \* INTO.*)', '$1'
    $tempScriptPath = ".\database\truncate_with_backup_temp.sql"
    $sqlContent | Out-File -FilePath $tempScriptPath -Encoding UTF8
    $scriptPath = $tempScriptPath
    Write-Host "📋 Backup habilitado en el script" -ForegroundColor Green
}

# Ejecutar el script SQL
try {
    Write-Host "⏳ Ejecutando script SQL..." -ForegroundColor Yellow

    # Usar sqlcmd para ejecutar el script
    $sqlcmdArgs = @(
        "-S", $Server
        "-d", $Database
        "-i", $scriptPath
        "-E"  # Integrated Security
    )

    $result = & sqlcmd @sqlcmdArgs 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ TRUNCATE COMPLETADO EXITOSAMENTE" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Resultado:" -ForegroundColor Cyan
        Write-Host $result -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Error durante la ejecución del script:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }

} catch {
    Write-Host ""
    Write-Host "❌ Error ejecutando el script:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
} finally {
    # Limpiar archivo temporal si se creó
    if ($Backup -and $Safe -and (Test-Path ".\database\truncate_with_backup_temp.sql")) {
        Remove-Item ".\database\truncate_with_backup_temp.sql" -Force
        Write-Host "🧹 Archivo temporal eliminado" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🎯 Proceso finalizado" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Para restaurar datos de prueba, ejecuta:" -ForegroundColor Yellow
Write-Host "  .\database\inserts.sql" -ForegroundColor White
Write-Host ""
