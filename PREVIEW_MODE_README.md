# 🔍 Modo Preview - SkillSwap

El **Modo Preview** permite que la aplicación SkillSwap funcione completamente **sin conexión a base de datos**, utilizando datos simulados y APIs mock. Es ideal para desarrollo, demos y testing.

## 🎯 ¿Qué es el Modo Preview?

Cuando el modo preview está activado (`NEXT_PUBLIC_PREVIEW=TRUE`), la aplicación:

- ✅ **No se conecta a la base de datos**
- ✅ **Usa datos simulados en memoria**
- ✅ **Login/registro funcionan con cualquier credencial**
- ✅ **WebSocket simulado para tiempo real**
- ✅ **Todas las funcionalidades disponibles**
- ✅ **Indicador visual activo**

## 🚀 Activación Rápida

### Usando el Script PowerShell (Recomendado)

```powershell
# Activar modo preview
.\toggle-preview.ps1 on

# Desactivar modo preview
.\toggle-preview.ps1 off

# Ver estado actual
.\toggle-preview.ps1 status

# Alternar entre estados
.\toggle-preview.ps1

# Ver ayuda completa
.\toggle-preview.ps1 help
```

### Configuración Manual

Edita el archivo `.env.development`:

## 📊 Características

### ✅ Cuando PREVIEW=TRUE

- **Datos mockup**: Usa datos de demostración predefinidos
- **Sin backend**: No requiere API funcionando
- **Indicador visual**: Muestra "🧪 PREVIEW MODE" en la interfaz
- **Delay simulado**: Simula latencia de red realista (300-1000ms)
- **Logging detallado**: Mensajes de debug en consola del navegador
- **Banner informativo**: Aviso amarillo en páginas que usan API
- **Generación dinámica**: Crea datos para usuarios sin actividad
- **Interceptor de red**: Bloquea llamadas reales a APIs externas

## 🌐 Despliegue en Vercel

El modo preview es **ideal para desplegar en Vercel**, donde no es posible configurar un backend Go.

### Configuración en Vercel

1. Crea un nuevo proyecto conectado a tu repositorio
2. Configura las siguientes variables de entorno:
   ```
   NEXT_PUBLIC_PREVIEW=TRUE
   NEXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app
   ```
3. Despliega la aplicación
4. Verifica que todo funciona en la página `/preview-debug`

### Ventajas para despliegue en Vercel

- ✅ **Sin backend**: No necesitas configurar servidores adicionales
- ✅ **Sin BD**: No requiere conexión a base de datos
- ✅ **Rápido**: Deploys instantáneos sin preocupaciones de infraestructura
- ✅ **Completo**: Todas las funcionalidades disponibles para demostración
- ✅ **Seguro**: No expones credenciales de BD en el frontend

> **⚠️ Nota importante**: El modo preview está diseñado solo para desarrollo y demostración. Para un entorno de producción real, deberás usar la configuración completa con backend Go y base de datos.

### ❌ Cuando PREVIEW=FALSE

- **API real**: Hace llamadas HTTP al backend
- **Autenticación**: Requiere tokens válidos
- **Base de datos**: Necesita conexión a BD
- **Sin indicadores**: Funcionamiento normal de producción

## 🎯 Datos Mock Incluidos

### Dashboard
- **Matches**: 3 matches de ejemplo (activos/pendientes)
- **Sesiones**: 3 sesiones (completada/pendiente/cancelada)
- **Estadísticas**: Tasas de cancelación calculadas

### Skills/Habilidades
- **Lista de habilidades**: 5 habilidades de diferentes categorías
- **Habilidades de usuario**: JavaScript, Python, React (con niveles)

### Notificaciones
- **Nuevos matches**: Notificación de match con Juan
- **Sesiones programadas**: Recordatorio de sesión con María

### Health Check
- **Estado de API**: Respuesta mock de salud del sistema

## 🔧 Implementación Técnica

### Estructura de Archivos

```
src/
├── config/
│   └── app-config.ts          # Configuración global PREVIEW_MODE
├── lib/
│   ├── api-client.ts          # Cliente API con interceptación mock
│   └── api-config.ts          # Configuración API actualizada
└── components/
    └── PreviewModeIndicator.tsx # Indicadores visuales
```

### Cliente API Inteligente

```typescript
// Intercepta automáticamente las llamadas API
import { apiClient } from '@/lib/api-client';

// Funciona igual en ambos modos
const response = await apiClient.get('/users/1/matches/');
```

### Configuración Global

```typescript
import { PREVIEW_MODE } from '@/config/app-config';

// Usar en cualquier componente
if (PREVIEW_MODE) {
  console.log('Modo demostración activo');
}
```

## 🎨 Indicadores Visuales

### Indicador Flotante
- Esquina superior derecha
- Badge amarillo "🧪 PREVIEW MODE"
- Solo visible cuando PREVIEW=TRUE

### Banner Informativo
- Aparece en páginas que usan API
- Explica el modo activo
- Instrucciones para cambiar modo

### Texto en Headers
- Etiqueta adicional en títulos de página
- Indicador de datos de demostración

## 🚀 Casos de Uso

### Desarrollo Frontend
```bash
# Trabajar en UI sin backend
NEXT_PUBLIC_PREVIEW=TRUE
npm run dev
```

### Testing de Integración
```bash
# Probar con API real
NEXT_PUBLIC_PREVIEW=FALSE
npm run dev
```

### Demos y Presentaciones
- Mostrar funcionalidad sin setup complejo
- Datos consistentes y predecibles
- Sin dependencias externas

## 🔄 Cambio de Modos

### Método 1: Variable de Entorno
```bash
# Editar .env.development
NEXT_PUBLIC_PREVIEW=TRUE/FALSE

# Reiniciar servidor
npm run dev
```

### Método 2: Script Helper
```bash
# Usar script de demostración
./demo-preview-mode.ps1
```

## 📝 Logging y Debug

### Consola del Navegador
```javascript
// Buscar mensajes con prefijo
[PREVIEW MODE] Intercepting API call to /users/1/matches/
[PREVIEW MODE] Mock data found for endpoint: /users/1/matches/
```

### Debug Helper
```typescript
import { debugLog } from '@/config/app-config';

debugLog('Mi mensaje', { data: 'ejemplo' });
// Solo aparece en modo PREVIEW
```

## ⚡ Performance

### Modo PREVIEW
- **Tiempo de respuesta**: 300-1000ms simulado
- **Sin red**: Todas las "llamadas" son locales
- **Cacheable**: Los datos son estáticos

### Modo Normal
- **Tiempo de respuesta**: Depende de la red/API
- **Conexiones HTTP**: Llamadas reales al backend
- **Variables**: Datos dinámicos de BD

## 🎯 Próximos Pasos

1. **Probar la aplicación**: Navega a http://localhost:3000
2. **Explorar componentes**: Dashboard, Matches, Skills
3. **Verificar logging**: Abre DevTools → Console
4. **Cambiar modos**: Experimenta con ambas configuraciones
5. **Desarrollar**: Agrega nuevos endpoints mock según necesites

---

## 🤝 Contribución

Para agregar nuevos datos mock:

1. Edita `src/lib/api-client.ts`
2. Agrega entrada en `MOCK_DATA`
3. Usa regex pattern para el endpoint
4. Incluye estructura de respuesta esperada

Ejemplo:
```typescript
'/my-endpoint/\\d+': {
  status: 'success',
  data: { /* tu data aquí */ }
}
```
