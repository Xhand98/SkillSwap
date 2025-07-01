# Script de despliegue para el frontend de SkillSwap
Write-Host "Iniciando despliegue del frontend SkillSwap..." -ForegroundColor Cyan

# Directorio raíz del proyecto
$rootDir = "c:\Users\hendr\OneDrive\Documents\proyectos\Web\Nextjs\skillswap"
Set-Location -Path $rootDir

# Instalar dependencias
Write-Host "Instalando dependencias..." -ForegroundColor Yellow
pnpm install

# Construir para producción
Write-Host "Construyendo para producción..." -ForegroundColor Yellow
pnpm run build

Write-Host "La construcción del frontend se ha completado correctamente" -ForegroundColor Green
Write-Host "Para iniciar el servidor de producción ejecuta: pnpm run start" -ForegroundColor Cyan

# Si deseas desplegar en un servidor remoto, puedes añadir aquí comandos adicionales
# Por ejemplo: rsync, scp, o comandos de despliegue específicos de tu plataforma
