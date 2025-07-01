// AuthServices.ts - Servicios de autenticación para SkillSwap

// Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre_usuario: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  correo_electronico: string;
  ciudad_trabajo: string;
  hash_contrasena: string;
}

export interface User {
  id: number;
  nombre_usuario: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  correo_electronico: string;
  ciudad_trabajo: string;
  rol: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expires_at: string;
}

// Importar configuración centralizada de la API
import { API_CONFIG } from "./api-config";

// URL base de la API
const API_URL = API_CONFIG.API_URL;

// Servicios de autenticación
export const AuthService = {
  // Obtener el ID del usuario actual desde caché (con respaldo)
  getCurrentUserId(): number | null {
    // Intentar primero desde localStorage
    let userId = localStorage.getItem("currentUserId");

    // Si no existe en localStorage, intentar desde sessionStorage
    if (!userId) {
      try {
        userId = sessionStorage.getItem("currentUserId");
      } catch (e) {
        // Error silencioso en producción
      }
    }

    // Si no existe en ninguna caché, intentar extraerlo del objeto usuario
    if (!userId) {
      const user = this.getCurrentUser();
      if (user && user.id) {
        this.setCurrentUserId(user.id); // Guardarlo en caché para futuros usos
        return user.id;
      }
    }

    return userId ? parseInt(userId, 10) : null;
  },

  // Guardar el ID del usuario en localStorage y sessionStorage para mayor disponibilidad
  setCurrentUserId(userId: number): void {
    if (!userId) return;
    const userIdStr = userId.toString();
    localStorage.setItem("currentUserId", userIdStr);
    try {
      // También guardar en sessionStorage para redundancia
      sessionStorage.setItem("currentUserId", userIdStr);
    } catch (e) {
      // Error silencioso en producción
    }
  },

  // Iniciar sesión con email y contraseña
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al iniciar sesión");
      }

      const data = await response.json();

      // Guardar datos en localStorage
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Usar el nuevo método para almacenar el ID del usuario
      this.setCurrentUserId(data.user.id);

      return data;
    } catch (error: any) {
      // Error silencioso en producción
      throw error;
    }
  },

  // Registrar nuevo usuario
  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        let errorMessage = "Error al registrar usuario";

        try {
          const errorData = await response.text();
          errorMessage = errorData || errorMessage;
        } catch (e) {
          // Error silencioso en producción
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      // Error silencioso en producción
      throw error;
    }
  },

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUserId");

    // También limpiar sessionStorage
    try {
      sessionStorage.removeItem("currentUserId");
    } catch (e) {
      // Error silencioso en producción
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token");
  },

  // Obtener usuario actual desde localStorage
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (e) {
        // Error silencioso en producción
        return null;
      }
    }
    return null;
  },

  // Validar token del usuario
  async validateToken(): Promise<User | null> {
    const token = localStorage.getItem("auth_token");
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/auth/validate`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const user = await response.json();
      localStorage.setItem("user", JSON.stringify(user));

      // Actualizar el ID del usuario en caché
      this.setCurrentUserId(user.id);

      return user;
    } catch (error) {
      // Error silencioso en producción
      this.logout();
      return null;
    }
  }
};
