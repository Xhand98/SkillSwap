# Script principal de despliegue para SkillSwap
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "     DESPLIEGUE COMPLETO DE SKILLSWAP" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Directorio raíz del proyecto
$rootDir = "c:\Users\hendr\OneDrive\Documents\proyectos\Web\Nextjs\skillswap"
Set-Location -Path $rootDir

# 1. Ejecutar el despliegue del backend
Write-Host "`nIniciando despliegue del BACKEND..." -ForegroundColor Yellow
& "$rootDir\deploy-backend.ps1"

# Comprobar si el despliegue del backend fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en el despliegue del backend. Abortando." -ForegroundColor Red
    exit 1
}

# 2. Ejecutar el despliegue del frontend
Write-Host "`nIniciando despliegue del FRONTEND..." -ForegroundColor Yellow
& "$rootDir\deploy-frontend.ps1"

# Comprobar si el despliegue del frontend fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en el despliegue del frontend. Abortando." -ForegroundColor Red
    exit 1
}

Write-Host "`n===============================================" -ForegroundColor Green
Write-Host "     DESPLIEGUE COMPLETO FINALIZADO" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "`nRecuerda revisar los logs para verificar que todo funciona correctamente." -ForegroundColor Cyan
Write-Host "Para iniciar la aplicación en producción:" -ForegroundColor Cyan
Write-Host "1. Backend: En el servidor, ejecuta './skillswap-api'" -ForegroundColor White
Write-Host "2. Frontend: En el servidor, ejecuta 'pnpm run start'" -ForegroundColor White
