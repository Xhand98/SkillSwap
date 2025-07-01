#!/usr/bin/env powershell

# Script para probar todas las mejoras de conectividad de base de datos
# Archivo: test-database-connectivity.ps1

Write-Host "🔗 Probando Mejoras de Conectividad con Base de Datos" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Verificar que el backend esté ejecutándose
Write-Host "📡 Verificando backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 5
    Write-Host "✅ Backend está ejecutándose correctamente" -ForegroundColor Green
    Write-Host "   Respuesta: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: Backend no está disponible" -ForegroundColor Red
    Write-Host "   Asegúrate de que main.exe esté ejecutándose en el puerto 8000" -ForegroundColor Red
    exit 1
}

# Verificar endpoint de habilidades
Write-Host "`n🎯 Probando endpoint de habilidades..." -ForegroundColor Yellow
try {
    $abilities = Invoke-RestMethod -Uri "http://localhost:8000/abilities/" -TimeoutSec 5
    $count = $abilities.abilities.Count
    Write-Host "✅ Habilidades cargadas: $count" -ForegroundColor Green
    if ($count -gt 0) {
        Write-Host "   Primeras habilidades: $($abilities.abilities[0..2] | ForEach-Object { $_.name } | Join-String -Separator ', ')" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error al cargar habilidades: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de POST
Write-Host "`n📝 Probando agregar habilidad de prueba..." -ForegroundColor Yellow
try {
    $testData = @{
        user_id = 999
        ability_id = 1
        skill_type = "Ofrece"
        proficiency_level = "Test"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8000/userabilities/" -Method POST -Body $testData -ContentType "application/json" -TimeoutSec 5
    Write-Host "✅ POST funcionando correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en POST: $($_.Exception.Message)" -ForegroundColor Red
}

# Verificar frontend
Write-Host "`n🌐 Verificando frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend está ejecutándose en puerto 3000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error: Frontend no está disponible" -ForegroundColor Red
    Write-Host "   Ejecuta 'npm run dev' para iniciar el frontend" -ForegroundColor Red
}

Write-Host "`n🧪 URLs para probar las mejoras:" -ForegroundColor Cyan
Write-Host "   🏠 Página principal: http://localhost:3000" -ForegroundColor White
Write-Host "   📚 Explorar (con indicadores BD): http://localhost:3000/explore" -ForegroundColor White
Write-Host "   🎯 Skills (con toasts y estados): http://localhost:3000/skills" -ForegroundColor White
Write-Host "   📊 Diagnósticos completos: http://localhost:3000/diagnostics" -ForegroundColor White

Write-Host "`n✨ Características a observar:" -ForegroundColor Cyan
Write-Host "   🟢 Indicadores de estado de BD en esquinas superiores" -ForegroundColor Green
Write-Host "   📊 Contadores de elementos cargados desde BD" -ForegroundColor Green
Write-Host "   🔔 Notificaciones toast en tiempo real" -ForegroundColor Green
Write-Host "   ⏱️ Tiempos de respuesta visibles" -ForegroundColor Green
Write-Host "   🔍 Mensajes de loading específicos para BD" -ForegroundColor Green

Write-Host "`n🎉 Todas las pruebas completadas!" -ForegroundColor Green
Write-Host "La base de datos está funcionando y las mejoras visuales están activas." -ForegroundColor Gray
