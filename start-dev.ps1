# Script para iniciar ambos servidores de desarrollo de SkillSwap
# Uso: .\start-dev.ps1

Write-Host "🚀 Iniciando servidores de desarrollo de SkillSwap..." -ForegroundColor Green

# Función para iniciar el backend en una nueva ventana de terminal
$backendScript = {
    Set-Location "c:\Users\hendr\OneDrive\Documents\proyectos\Web\Nextjs\skillswap\api"
    Write-Host "🔧 Iniciando servidor backend (API Go) en puerto 8000..." -ForegroundColor Yellow
    go run main.go
}

# Función para iniciar el frontend en una nueva ventana de terminal
$frontendScript = {
    Set-Location "c:\Users\hendr\OneDrive\Documents\proyectos\Web\Nextjs\skillswap"
    Write-Host "⚛️ Iniciando servidor frontend (Next.js) en puerto 3001..." -ForegroundColor Cyan
    npm run dev
}

Write-Host "📋 Información de los servidores:" -ForegroundColor White
Write-Host "   • Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   • Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "   • Health:   http://localhost:8000/health" -ForegroundColor Green
Write-Host ""

# Iniciar backend en nueva ventana
Write-Host "🔧 Iniciando backend en nueva ventana..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {$($backendScript.ToString())}"

# Esperar un momento antes de iniciar el frontend
Start-Sleep -Seconds 2

# Iniciar frontend en nueva ventana
Write-Host "⚛️ Iniciando frontend en nueva ventana..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {$($frontendScript.ToString())}"

Write-Host ""
Write-Host "✅ Ambos servidores están iniciándose en ventanas separadas." -ForegroundColor Green
Write-Host "📱 Una vez que ambos estén listos, puedes acceder a:" -ForegroundColor White
Write-Host "   • Aplicación: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   • API Health: http://localhost:8000/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "🛑 Para detener los servidores, cierra las ventanas de terminal correspondientes." -ForegroundColor Red
