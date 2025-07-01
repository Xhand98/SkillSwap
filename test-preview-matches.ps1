# Script para probar el modo preview y matches
# test-preview-matches.ps1

Write-Host "=== Test de Modo Preview - Matches ===" -ForegroundColor Green

# Verificar variables de entorno
Write-Host "`n1. Verificando configuración..." -ForegroundColor Yellow
$envFile = ".env.development"
if (Test-Path $envFile) {
    $content = Get-Content $envFile
    $previewLine = $content | Where-Object { $_ -match "NEXT_PUBLIC_PREVIEW" }
    if ($previewLine) {
        Write-Host "   ✅ Encontrado: $previewLine" -ForegroundColor Green
    } else {
        Write-Host "   ❌ No se encontró NEXT_PUBLIC_PREVIEW en .env.development" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ No se encontró el archivo .env.development" -ForegroundColor Red
}

# Verificar archivos de preview
Write-Host "`n2. Verificando archivos de preview..." -ForegroundColor Yellow
$previewFiles = @(
    "src/config/app-config.ts",
    "src/lib/preview-data.ts", 
    "src/lib/preview-api.ts",
    "src/hooks/usePreview_new.ts"
)

foreach ($file in $previewFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file" -ForegroundColor Red
    }
}

# Verificar datos mock de matches
Write-Host "`n3. Verificando datos mock de matches..." -ForegroundColor Yellow
$previewDataFile = "src/lib/preview-data.ts"
if (Test-Path $previewDataFile) {
    $content = Get-Content $previewDataFile -Raw
    
    if ($content -match "MOCK_MATCHES") {
        Write-Host "   ✅ MOCK_MATCHES definido" -ForegroundColor Green
        
        # Contar matches en el archivo
        $matchesSection = ($content -split "MOCK_MATCHES.*?=.*?\[")[1]
        if ($matchesSection) {
            $matchCount = ([regex]::Matches($matchesSection, "\{\s*id:")).Count
            Write-Host "   ✅ Encontrados $matchCount matches mock" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ MOCK_MATCHES no encontrado" -ForegroundColor Red
    }
    
    if ($content -match "getMatches") {
        Write-Host "   ✅ Método getMatches() definido" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Método getMatches() no encontrado" -ForegroundColor Red
    }
    
    if ($content -match "getMatchesByUserId") {
        Write-Host "   ✅ Método getMatchesByUserId() definido" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Método getMatchesByUserId() no encontrado" -ForegroundColor Red
    }
}

# Verificar preview-api
Write-Host "`n4. Verificando preview-api..." -ForegroundColor Yellow
$previewApiFile = "src/lib/preview-api.ts"
if (Test-Path $previewApiFile) {
    $content = Get-Content $previewApiFile -Raw
    
    if ($content -match "async getMatches") {
        Write-Host "   ✅ Método async getMatches() en preview-api" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Método async getMatches() no encontrado en preview-api" -ForegroundColor Red
    }
    
    if ($content -match "previewApi.*getInstance") {
        Write-Host "   ✅ Singleton previewApi exportado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Singleton previewApi no encontrado" -ForegroundColor Red
    }
}

# Verificar hook usePreviewMatches
Write-Host "`n5. Verificando hook usePreviewMatches..." -ForegroundColor Yellow
$hooksFile = "src/hooks/usePreview_new.ts"
if (Test-Path $hooksFile) {
    $content = Get-Content $hooksFile -Raw
    
    if ($content -match "usePreviewMatches") {
        Write-Host "   ✅ Hook usePreviewMatches definido" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Hook usePreviewMatches no encontrado" -ForegroundColor Red
    }
    
    if ($content -match "previewApi\.getMatches") {
        Write-Host "   ✅ Llamada a previewApi.getMatches() en hook" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Llamada a previewApi.getMatches() no encontrada" -ForegroundColor Red
    }
}

# Mostrar resumen
Write-Host "`n=== RESUMEN ===" -ForegroundColor Cyan
Write-Host "El modo preview debe estar configurado con:" -ForegroundColor White
Write-Host "- NEXT_PUBLIC_PREVIEW=TRUE en .env.development" -ForegroundColor White
Write-Host "- Datos mock en MOCK_MATCHES" -ForegroundColor White
Write-Host "- Métodos getMatches() y getMatchesByUserId()" -ForegroundColor White
Write-Host "- Hook usePreviewMatches que use previewApi" -ForegroundColor White

Write-Host "`nSi el error 'Failed to fetch' persiste:" -ForegroundColor Yellow
Write-Host "1. Verificar que PREVIEW_MODE sea true" -ForegroundColor White
Write-Host "2. Verificar que no haya llamadas a fetch() reales" -ForegroundColor White
Write-Host "3. Usar solo previewApi.getMatches() en modo preview" -ForegroundColor White
Write-Host "4. Revisar logs de consola con debugLog()" -ForegroundColor White

Write-Host "`n✅ Script completado" -ForegroundColor Green
