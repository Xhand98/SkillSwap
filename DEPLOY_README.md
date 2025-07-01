# SkillSwap: Plataforma de Intercambio de Habilidades

## Descripción

SkillSwap es una plataforma que permite a los usuarios intercambiar habilidades y conocimientos. Los usuarios pueden publicar las habilidades que tienen para compartir y las que quieren aprender, y la plataforma les ayuda a encontrar coincidencias para realizar intercambios.

## Estructura del Proyecto

Este proyecto consta de dos partes principales:

1. **Frontend**: Desarrollado con Next.js y TypeScript
2. **Backend**: API REST desarrollada con Go y SQL Server

## Requisitos para Desarrollo

### Frontend

- Node.js (v18 o superior)
- pnpm (v8 o superior)

### Backend

- Go (v1.20 o superior)
- SQL Server

## Configuración para Desarrollo

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/tuusuario/skillswap.git
   cd skillswap
   ```

2. **Instalar dependencias del frontend**:

   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**:

   - Crear un archivo `.env.development` basado en `.env.development.example`
   - Crear un archivo `.env` en la carpeta `/api` basado en `.env.example`

4. **Iniciar servidor de desarrollo del frontend**:

   ```bash
   pnpm dev
   ```

5. **Iniciar servidor de desarrollo del backend**:
   ```bash
   cd api
   go run main.go
   ```

## Despliegue en Producción

### Preparar el Entorno de Producción

1. **Configurar variables de entorno**:

   - Frontend: Crear un archivo `.env.production` con las variables necesarias
   - Backend: Configurar el archivo `.env` para producción

2. **Configuración de Base de Datos**:
   - Asegúrate de tener una instancia de SQL Server configurada y accesible

### Opciones de Despliegue

#### Opción 1: Despliegue Automatizado (Recomendado)

Ejecuta el script de despliegue completo que compilará y preparará tanto el frontend como el backend:

```powershell
./deploy.ps1
```

#### Opción 2: Despliegue Manual por Componentes

1. **Desplegar el Backend**:

   ```powershell
   ./deploy-backend.ps1
   ```

2. **Desplegar el Frontend**:
   ```powershell
   ./deploy-frontend.ps1
   ```

## Despliegue en Vercel (Modo Preview)

Si quieres desplegar solo el frontend en Vercel sin necesidad del backend Go, puedes usar el modo preview que funciona completamente con datos mock.

### Configuración de Vercel

1. **Variables de Entorno en Vercel**:

   - `NEXT_PUBLIC_PREVIEW=TRUE` (Activar el modo preview)
   - `NEXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app` 

2. **Despliegue**:

   - Conecta tu repositorio a Vercel
   - Configura las variables de entorno anteriores
   - Despliega el proyecto

3. **Verificación**:
   - Navega a `https://tu-proyecto.vercel.app/preview-debug` para verificar el funcionamiento
   
### Características del Modo Preview

En modo preview, la aplicación:
- Bloquea todas las llamadas a la API real
- Usa datos mock para todas las funcionalidades
- Genera datos automáticamente cuando es necesario
- Simula el login/registro sin requerir credenciales reales
- Proporciona una experiencia completa sin backend

### Iniciar en Producción

1. **Iniciar el Backend**:

   ```
   ./skillswap-api
   ```

2. **Iniciar el Frontend**:
   ```
   pnpm run start
   ```

## Consideraciones de Seguridad para Producción

1. **CORS**: El backend está configurado para aceptar solicitudes solo del origen especificado en la variable de entorno `ALLOWED_ORIGIN`.

2. **Variables Sensibles**: Asegúrate de que las credenciales de la base de datos y otras variables sensibles estén adecuadamente protegidas y no se incluyan en el control de versiones.

3. **HTTPS**: Configura HTTPS en tu servidor de producción para proteger la comunicación entre el frontend y el backend.

## Mantenimiento

### Logs y Monitoreo

El backend genera logs detallados que pueden ayudar a diagnosticar problemas:

- Los logs de la API se muestran en la consola y pueden redirigirse a un archivo
- Para un monitoreo más avanzado, considera integrar servicios como Prometheus, Grafana o Datadog

### Respaldos

Es recomendable configurar respaldos automáticos de la base de datos SQL Server.

## Resolución de Problemas

### Problemas Comunes

1. **Error de Conexión a la Base de Datos**: Verifica las credenciales y la disponibilidad del servidor SQL.

2. **Problemas de CORS**: Asegúrate de que la variable `ALLOWED_ORIGIN` esté configurada correctamente.

3. **Puerto en Uso**: Si el puerto 8000 (API) o 3000 (Frontend) está en uso, puedes cambiarlos en la configuración.

## Licencia

[Especificar la licencia del proyecto]
