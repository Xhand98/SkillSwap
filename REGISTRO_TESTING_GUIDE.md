# SkillSwap - Guía de Testing del Registro de Usuarios

## 🎯 Estado Actual

✅ **PROBLEMA RESUELTO** - El registro de usuarios ahora funciona correctamente.

## 🐛 Problema Original

El registro devolvía error "Method Not Allowed" porque:

- La API en modo TEST_MODE solo tenía configuradas rutas GET
- No había endpoint POST para `/users/` en modo test
- El frontend no podía crear usuarios

## ✅ Solución Implementada

### 1. Añadido Mock Handler para POST

```go
// CreateMockUser simula la creación de un usuario en modo test
func (h *MockDataHandler) CreateMockUser(w http.ResponseWriter, r *http.Request) {
    // Procesa datos reales del request
    // Genera respuesta realista con los datos enviados
    // Devuelve usuario creado con ID simulado
}
```

### 2. Configuración de Rutas en Modo Test

```go
// En routes/api.go - modo TEST_MODE
router.HandleFunc("POST /users/", mockHandler.CreateMockUser)
router.HandleFunc("POST /users", mockHandler.CreateMockUser)
```

### 3. Procesamiento de Datos Reales

- El mock handler ahora lee y procesa los datos del formulario
- Genera nombre de usuario automáticamente: `primer_nombre_primer_apellido`
- Devuelve respuesta con los datos proporcionados

## 🧪 Cómo Probar el Registro

### Opción 1: Desde la Aplicación Web

1. **Abrir**: http://localhost:3000/register
2. **Llenar el formulario** con:
   - Primer Nombre: Tu nombre
   - Primer Apellido: Tu apellido
   - Email: tu@email.com
   - Contraseña: (mínimo 8 caracteres)
   - Confirmar contraseña
   - Aceptar términos
3. **Hacer clic en "Registrarse"**
4. **Resultado esperado**: Redirección a login con mensaje de éxito

### Opción 2: Prueba Manual con API

```powershell
# Usando PowerShell
$body = @{
    primer_nombre = "Juan"
    primer_apellido = "Perez"
    correo_electronico = "juan@ejemplo.com"
    ciudad_trabajo = "Madrid"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/users/" -Method POST -Body $body -ContentType "application/json"
```

### Opción 3: Verificar Logs

Monitorear la salida del terminal donde corre la API:

```
2025/05/24 14:06:21 Solicitud recibida: POST /users/ desde [::1]:50370
2025/05/24 14:06:21 Content-Length: 144
```

## 📊 Respuesta Esperada

Cuando el registro es exitoso, la API devuelve:

```json
{
  "id": 999,
  "nombre_usuario": "juan_perez",
  "primer_nombre": "Juan",
  "primer_apellido": "Perez",
  "correo_electronico": "juan@ejemplo.com",
  "ciudad_trabajo": "Madrid",
  "rol": "user",
  "created_at": "2025-05-24T14:06:21-04:00",
  "updated_at": "2025-05-24T14:06:21-04:00"
}
```

## 🔧 Servidores Requeridos

Asegúrate de que ambos servidores estén corriendo:

```powershell
# Terminal 1 - API Backend
cd "c:\Users\hendr\OneDrive\Documents\proyectos\Web\Nextjs\skillswap\api"
go run main.go

# Terminal 2 - Frontend
cd "c:\Users\hendr\OneDrive\Documents\proyectos\Web\Nextjs\skillswap"
npm run dev
```

**URLs de acceso:**

- Frontend: http://localhost:3000
- API: http://localhost:8000
- Health Check: http://localhost:8000/health

## ⚠️ Notas Importantes

1. **Modo Test**: La aplicación está corriendo en modo TEST_MODE

   - No se conecta a base de datos real
   - Usa datos simulados
   - Todos los IDs de usuario serán 999

2. **CORS**: Configurado para permitir cualquier origen (desarrollo)

3. **Datos Persistencia**: Los datos no se guardan realmente, se simulan

## 🚀 Script Rápido de Inicio

Usar el script automatizado:

```powershell
.\start-dev.ps1
```

Este script inicia ambos servidores automáticamente en ventanas separadas.
