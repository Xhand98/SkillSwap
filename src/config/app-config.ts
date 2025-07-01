// Configuración global para el modo de vista previa
export const PREVIEW_MODE = process.env.NEXT_PUBLIC_PREVIEW === 'TRUE';

// Para compatibilidad con código existente
export const USE_REAL_API = !PREVIEW_MODE;

export const APP_CONFIG = {
  PREVIEW_MODE,
  USE_REAL_API,
  // URLs de API
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  
  // Configuración de Socket.IO
  SOCKET_AUTH_TOKEN: process.env.SOCKET_AUTH_TOKEN || 'default-secret-token',
} as const;

// Helper para logging condicional
export const debugLog = (message: string, ...args: any[]) => {
  if (PREVIEW_MODE) {
    console.log(`[PREVIEW MODE] ${message}`, ...args);
  }
};
