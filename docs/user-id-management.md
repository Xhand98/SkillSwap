# Gestión de ID de Usuario en SkillSwap

Este documento explica cómo implementar y utilizar el sistema de gestión de ID de usuario en la aplicación SkillSwap.

## Índice

1. [Introducción](#introducción)
2. [Almacenamiento del ID de Usuario](#almacenamiento-del-id-de-usuario)
3. [Uso del Hook `useCurrentUserId`](#uso-del-hook-usecurrentuserid)
4. [Funciones de utilidad en AuthService](#funciones-de-utilidad-en-authservice)
5. [Ejemplos prácticos](#ejemplos-prácticos)

## Introducción

La gestión consistente del ID de usuario es crucial para el funcionamiento de SkillSwap. El sistema implementado proporciona acceso confiable al ID del usuario actual desde cualquier componente, con redundancia para garantizar disponibilidad.

## Almacenamiento del ID de Usuario

El ID de usuario se almacena en múltiples ubicaciones para mayor confiabilidad:

- **localStorage**: Persistencia entre sesiones
- **sessionStorage**: Respaldo dentro de la sesión actual
- **Objeto usuario**: Como última opción, se extrae del objeto usuario completo

## Uso del Hook `useCurrentUserId`

El hook `useCurrentUserId` facilita el acceso al ID del usuario desde cualquier componente:

```tsx
import useCurrentUserId from "@/hooks/useCurrentUserId";

function MyComponent() {
  const userId = useCurrentUserId();

  if (userId === null) {
    return <div>Usuario no autenticado</div>;
  }

  return <div>ID de usuario: {userId}</div>;
}
```

Características:

- Obtiene automáticamente el ID de usuario
- Actualiza el componente si el ID cambia
- Devuelve `null` si el usuario no está autenticado

## Funciones de utilidad en AuthService

El servicio AuthService incluye funciones para gestionar el ID:

### getCurrentUserId

```typescript
const userId = AuthService.getCurrentUserId();
```

Busca el ID en todas las fuentes disponibles, devolviendo `null` si no se encuentra.

### setCurrentUserId

```typescript
AuthService.setCurrentUserId(123);
```

Almacena el ID en localStorage y sessionStorage para redundancia.

## Ejemplos prácticos

### Obtener detalles del usuario actual

```typescript
const userId = useCurrentUserId();
const fetchUserData = async () => {
  if (userId) {
    const response = await fetch(`/api/users/${userId}`);
    const userData = await response.json();
    return userData;
  }
  return null;
};
```

### Filtrar datos por usuario

```typescript
const userId = useCurrentUserId();
const myPosts = allPosts.filter((post) => post.userId === userId);
```

### Verificar propiedad de un recurso

```typescript
const userId = useCurrentUserId();
const canEdit = post.authorId === userId;
```

## Consideraciones de seguridad

- El ID almacenado en cliente es una conveniencia para la UX, pero todas las operaciones críticas deben validar la identidad del usuario en el servidor.
- Nunca confíes ciegamente en el ID de usuario almacenado en el cliente para operaciones que impliquen seguridad.
