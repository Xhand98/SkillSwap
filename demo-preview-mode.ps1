#!/usr/bin/env pwsh
# Script para demostrar el modo PREVIEW y preparar despliegue en Vercel

param(
    [switch]$PrepareVercel = $false
)

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

# Preparar configuración para despliegue en Vercel si se especifica
if ($PrepareVercel) {
    Write-Host ""
    Write-Host "🚀 Preparando configuración para despliegue en Vercel" -ForegroundColor Magenta
    Write-Host "=================================================" -ForegroundColor Magenta
    
    # Crear archivo .env.preview
    $previewEnvContent = @"
# Variables de entorno para modo preview en Vercel
NEXT_PUBLIC_PREVIEW=TRUE
NEXT_PUBLIC_SITE_URL=https://skillswap-preview.vercel.app
NEXT_PUBLIC_API_URL=https://no-usado-en-preview.com
"@

    Set-Content -Path ".env.preview" -Value $previewEnvContent
    Write-Host "✅ Archivo .env.preview creado para Vercel" -ForegroundColor Green
    
    # Verificar archivos necesarios
    $requiredFiles = @(
        "src\lib\preview-data.ts",
        "src\lib\preview-api.ts", 
        "src\lib\preview-fetch-interceptor.ts",
        "src\components\PreviewModeInitializer.tsx",
        "src\components\PreviewModeIndicator.tsx"
    )
    
    $allFilesExist = $true
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            Write-Host "❌ Falta archivo: $file" -ForegroundColor Red
            $allFilesExist = $false
        }
    }
    
    if ($allFilesExist) {
        Write-Host "✅ Todos los archivos necesarios para el modo preview están presentes" -ForegroundColor Green
    } else {
        Write-Host "❌ Faltan algunos archivos necesarios para el modo preview (ver arriba)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "📋 Instrucciones para desplegar en Vercel:" -ForegroundColor White
    Write-Host ""
    Write-Host "1. Crea un nuevo proyecto en Vercel conectado a tu repositorio" -ForegroundColor White
    Write-Host "2. Configura las siguientes variables de entorno:" -ForegroundColor White
    Write-Host "   NEXT_PUBLIC_PREVIEW=TRUE" -ForegroundColor Cyan
    Write-Host "   NEXT_PUBLIC_SITE_URL=[URL-DE-TU-PROYECTO]" -ForegroundColor Cyan
    Write-Host "3. Despliega el proyecto" -ForegroundColor White
    Write-Host "4. Una vez desplegado, verifica que todo funciona navegando a /preview-debug" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Para más información, consulta PREVIEW_MODE_README.md y DEPLOY_README.md" -ForegroundColor White
}
