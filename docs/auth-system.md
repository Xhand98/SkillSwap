# Sistema de Autenticación en SkillSwap

## Descripción General

El sistema de autenticación implementado en SkillSwap permite a los usuarios registrarse, iniciar sesión y mantener su estado de autenticación a lo largo de la aplicación. Utiliza JWT (JSON Web Tokens) para manejar las sesiones y protege las rutas que requieren autenticación. Este sistema ahora incluye una gestión avanzada del ID de usuario mediante un hook personalizado.

## Componentes Principales

### Backend

- **auth-handler.go**: Contiene los endpoints para login y validación de tokens.
- Rutas implementadas:
  - `POST /auth/login`: Para autenticar usuarios
  - `GET /auth/validate`: Para validar tokens JWT

### Frontend

- **AuthService.ts**: Servicio para manejar operaciones de autenticación.

  - Métodos para login, registro, validación de token y gestión de sesión
  - Almacenamiento de datos en localStorage y sessionStorage
  - Gestión del ID de usuario con redundancia y consistencia

- **AuthContext.tsx**: Contexto de React que provee el estado de autenticación a toda la aplicación.

  - Funciones para login, logout y registro
  - Estado compartido para información del usuario
  - Integración con el sistema de gestión de ID de usuario

- **ProtectedRoute.tsx**: Componente para proteger rutas privadas.

  - Redirige a usuarios no autenticados a la página de login
  - Guarda la URL actual para redireccionar después del login exitoso
  - Utiliza el hook `useCurrentUserId` para una verificación adicional

- **useCurrentUserId.ts**: Hook personalizado para la gestión del ID del usuario actual.
  - Proporciona acceso consistente al ID del usuario desde cualquier componente
  - Maneja actualizaciones reactivas cuando cambia el estado de autenticación
  - Almacenamiento con redundancia (localStorage + sessionStorage)

## Flujos de Autenticación

### Registro de Usuario

1. Usuario completa formulario de registro
2. Se validan los datos en el frontend
3. Los datos se envían al endpoint `POST /users/`
4. Se crea el usuario y se redirige a la página de login

### Inicio de Sesión

1. Usuario proporciona credenciales
2. Datos enviados al endpoint `POST /auth/login`
3. Backend valida las credenciales y genera un JWT
4. Token JWT se almacena en localStorage
5. Datos del usuario se guardan en estado compartido

### Protección de Rutas

1. Al acceder a rutas privadas, el componente `ProtectedRoute` verifica autenticación
2. Si no hay token o este es inválido, redirige al login
3. Si hay redirección, guarda la URL actual para volver después del login

### Validación Continua

1. Al cargar la aplicación, se verifica el token mediante `AuthService.validateToken()`
2. Si el token es válido, se recupera información del usuario
3. Si ha expirado, se elimina la sesión

## Implementación en Componentes

- Páginas como `/feed` y `/matches` están protegidas con el componente `ProtectedRoute`
- El header muestra opciones diferentes dependiendo del estado de autenticación
- El menú de usuario permite acceder rápidamente a funciones principales y cerrar sesión

## Seguridad

- Los tokens JWT tienen un tiempo de expiración definido en el backend
- Las contraseñas se almacenan con hash (usando bcrypt) en la base de datos
- Las rutas protegidas verifican la autenticación antes de mostrar contenido sensible

## Uso para Desarrolladores

Para proteger una página nueva:

1. Importa el componente `ProtectedRoute`
2. Envuelve el contenido de la página con este componente:

```tsx
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ProtectedPage() {
  return (
    <ProtectedRoute>{/* Contenido de la página protegida */}</ProtectedRoute>
  );
}
```

Para acceder al estado de autenticación en cualquier componente:

```tsx
import { useAuth } from "@/lib/AuthContext";

export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  // Uso del contexto de autenticación
}
```
