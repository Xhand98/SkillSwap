#!/usr/bin/env pwsh
# Script para demostrar el modo PREVIEW

Write-Host "🧪 Demostrando PREVIEW MODE en SkillSwap" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow

# Verificar el estado actual
$envFile = ".env.development"
if (Test-Path $envFile) {
    $currentPreview = (Get-Content $envFile | Where-Object { $_ -match "NEXT_PUBLIC_PREVIEW" })
    Write-Host "📄 Estado actual: $currentPreview" -ForegroundColor Cyan
} else {
    Write-Host "❌ No se encontró el archivo .env.development" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 ¿Qué hace el modo PREVIEW?" -ForegroundColor Green
Write-Host "  • PREVIEW=TRUE  → Usa datos mockup/demostración" -ForegroundColor White
Write-Host "  • PREVIEW=FALSE → Usa la API real del backend" -ForegroundColor White
Write-Host ""

Write-Host "📊 Características del modo PREVIEW:" -ForegroundColor Green
Write-Host "  ✓ Datos de demostración predefinidos" -ForegroundColor White
Write-Host "  ✓ No requiere backend funcionando" -ForegroundColor White
Write-Host "  ✓ Indicador visual en la interfaz" -ForegroundColor White
Write-Host "  ✓ Simula delay de red para realismo" -ForegroundColor White
Write-Host "  ✓ Logging detallado en consola" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Para probar la aplicación:" -ForegroundColor Green
Write-Host "  1. Abre http://localhost:3000" -ForegroundColor White
Write-Host "  2. Ve al Dashboard o Matches" -ForegroundColor White
Write-Host "  3. Observa el indicador '🧪 PREVIEW MODE'" -ForegroundColor White
Write-Host "  4. Revisa la consola del navegador para logs" -ForegroundColor White
Write-Host ""

Write-Host "🔄 Para cambiar entre modos:" -ForegroundColor Green
Write-Host "  • Edita $envFile" -ForegroundColor White
Write-Host "  • Cambia NEXT_PUBLIC_PREVIEW=TRUE/FALSE" -ForegroundColor White
Write-Host "  • Reinicia el servidor de desarrollo" -ForegroundColor White
Write-Host ""

Write-Host "✨ Modo PREVIEW configurado y listo para usar!" -ForegroundColor Green
