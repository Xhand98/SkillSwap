# Script de despliegue para el backend de SkillSwap
Write-Host "Iniciando despliegue del backend SkillSwap..." -ForegroundColor Cyan

# Directorio raíz del proyecto backend
$apiDir = "c:\Users\hendr\OneDrive\Documents\proyectos\Web\Nextjs\skillswap\api"
Set-Location -Path $apiDir

# Construir para producción
Write-Host "Construyendo binario de la API Go..." -ForegroundColor Yellow
$env:GOOS = "linux"  # Cambia según tu servidor de producción (windows, linux, darwin)
$env:GOARCH = "amd64"
go build -o skillswap-api main.go

# Comprobar si la compilación fue exitosa
if ($LASTEXITCODE -eq 0) {
    Write-Host "La construcción del backend se ha completado correctamente" -ForegroundColor Green
    Write-Host "El binario 'skillswap-api' está listo para ser desplegado" -ForegroundColor Cyan
} else {
    Write-Host "Error al construir el backend" -ForegroundColor Red
    exit 1
}

# Si deseas desplegar en un servidor remoto, puedes añadir aquí comandos adicionales
# Por ejemplo: rsync, scp, o comandos de despliegue específicos de tu plataforma

# Ejemplo de copia a un servidor remoto (descomentado y adaptado a tu entorno):
# $remoteServer = "usuario@tu-servidor.com"
# $remotePath = "/ruta/en/servidor"
# scp skillswap-api .env $remoteServer:$remotePath
