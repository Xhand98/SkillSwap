#!/usr/bin/env pwsh
# Script para alternar entre PREVIEW MODE y API REAL

param(
    [switch]$Preview,
    [switch]$Real,
    [switch]$Status
)

$envFile = ".env.development"

function Show-Status {
    if (Test-Path $envFile) {
        $currentPreview = (Get-Content $envFile | Where-Object { $_ -match "NEXT_PUBLIC_PREVIEW" })
        if ($currentPreview -match "TRUE") {
            Write-Host "📊 Estado actual: PREVIEW MODE (datos mockup)" -ForegroundColor Yellow
        } else {
            Write-Host "🔌 Estado actual: API REAL (backend requerido)" -ForegroundColor Green
        }
        Write-Host "   Configuración: $currentPreview" -ForegroundColor Gray
    } else {
        Write-Host "❌ No se encontró $envFile" -ForegroundColor Red
    }
}

function Set-PreviewMode {
    param([bool]$enable)

    if (-not (Test-Path $envFile)) {
        Write-Host "❌ No se encontró $envFile" -ForegroundColor Red
        return
    }

    $content = Get-Content $envFile
    $newContent = @()
    $found = $false

    foreach ($line in $content) {
        if ($line -match "NEXT_PUBLIC_PREVIEW") {
            if ($enable) {
                $newContent += "NEXT_PUBLIC_PREVIEW=TRUE"
                Write-Host "✅ Activando PREVIEW MODE..." -ForegroundColor Yellow
            } else {
                $newContent += "NEXT_PUBLIC_PREVIEW=FALSE"
                Write-Host "✅ Activando API REAL..." -ForegroundColor Green
            }
            $found = $true
        } else {
            $newContent += $line
        }
    }

    if (-not $found) {
        if ($enable) {
            $newContent += "NEXT_PUBLIC_PREVIEW=TRUE"
        } else {
            $newContent += "NEXT_PUBLIC_PREVIEW=FALSE"
        }
    }

    $newContent | Set-Content $envFile
    Write-Host "📝 Archivo $envFile actualizado" -ForegroundColor Cyan
    Write-Host "🔄 Reinicia el servidor con: npm run dev" -ForegroundColor Magenta
}

# Mostrar ayuda si no hay parámetros
if (-not $Preview -and -not $Real -and -not $Status) {
    Write-Host "🔧 Toggle PREVIEW MODE - SkillSwap" -ForegroundColor Blue
    Write-Host "=================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Uso:" -ForegroundColor White
    Write-Host "  .\toggle-preview.ps1 -Preview    # Activar modo PREVIEW (datos mock)" -ForegroundColor Yellow
    Write-Host "  .\toggle-preview.ps1 -Real       # Activar modo API REAL" -ForegroundColor Green
    Write-Host "  .\toggle-preview.ps1 -Status     # Ver estado actual" -ForegroundColor Cyan
    Write-Host ""
    Show-Status
    exit 0
}

if ($Status) {
    Show-Status
    exit 0
}

if ($Preview) {
    Set-PreviewMode $true
    Write-Host ""
    Write-Host "🧪 PREVIEW MODE activado:" -ForegroundColor Yellow
    Write-Host "  • Datos de demostración" -ForegroundColor White
    Write-Host "  • Sin backend requerido" -ForegroundColor White
    Write-Host "  • Indicador visual activo" -ForegroundColor White
}

if ($Real) {
    Set-PreviewMode $false
    Write-Host ""
    Write-Host "🔌 API REAL activada:" -ForegroundColor Green
    Write-Host "  • Conecta al backend real" -ForegroundColor White
    Write-Host "  • Requiere API funcionando" -ForegroundColor White
    Write-Host "  • Datos dinámicos de BD" -ForegroundColor White
}

Write-Host ""
Show-Status
