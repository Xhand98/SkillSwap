/**
 * API Client que maneja automáticamente el modo PREVIEW
 * Cuando PREVIEW_MODE=true, retorna datos mockup en lugar de hacer llamadas reales
 */
import { API_CONFIG } from './api-config';
import { debugLog } from '@/config/app-config';

// Datos mockup para diferentes endpoints
const MOCK_DATA = {
  // Dashboard stats
  '/users/\\d+/matches/': {
    status: 'success',
    data: [
      { id: 1, user1_id: 1, user2_id: 2, status: 'active', created_at: '2025-06-01' },
      { id: 2, user1_id: 1, user2_id: 3, status: 'active', created_at: '2025-06-02' },
      { id: 3, user1_id: 1, user2_id: 4, status: 'pending', created_at: '2025-06-03' }
    ]
  },
  
  // Sessions
  '/matches/\\d+/sessions/': {
    status: 'success',
    data: [
      { id: 1, match_id: 1, status: 'completed', date: '2025-06-01', duration: 60 },
      { id: 2, match_id: 1, status: 'pending', date: '2025-06-15', duration: 45 },
      { id: 3, match_id: 2, status: 'cancelled', date: '2025-06-10', duration: 30 }
    ]
  },

  // User abilities
  '/userabilities/user/\\d+': {
    status: 'success',
    data: [
      { id: 1, user_id: 1, ability_id: 1, type: 'Ofrece', level: 'Experto', ability: { name: 'JavaScript', category: 'Tecnología' } },
      { id: 2, user_id: 1, ability_id: 2, type: 'Busca', level: 'Principiante', ability: { name: 'Python', category: 'Tecnología' } },
      { id: 3, user_id: 1, ability_id: 3, type: 'Ofrece', level: 'Intermedio', ability: { name: 'React', category: 'Tecnología' } }
    ]
  },

  // Abilities list
  '/abilities/': {
    status: 'success',
    data: [
      { id: 1, name: 'JavaScript', category: 'Tecnología', description: 'Lenguaje de programación' },
      { id: 2, name: 'Python', category: 'Tecnología', description: 'Lenguaje de programación' },
      { id: 3, name: 'React', category: 'Tecnología', description: 'Framework de JavaScript' },
      { id: 4, name: 'Cocina Italiana', category: 'Gastronomía', description: 'Arte culinario italiano' },
      { id: 5, name: 'Guitarra', category: 'Artes', description: 'Instrumento musical' }
    ]
  },

  // Notifications
  '/users/\\d+/notifications': {
    status: 'success',
    data: [
      { id: 1, type: 'match', title: 'Nuevo match', message: 'Tienes un nuevo match con Juan', read: false, created_at: '2025-06-03T10:00:00Z' },
      { id: 2, type: 'session', title: 'Sesión programada', message: 'Tu sesión con María es mañana', read: true, created_at: '2025-06-02T15:30:00Z' }
    ]
  },

  // Health check
  '/health': {
    status: 'ok',
    message: 'API funcionando correctamente (MOCK)',
    timestamp: new Date().toISOString(),
    database: 'connected (MOCK)',
    version: '1.0.0'
  }
};

/**
 * Función para encontrar datos mock que coincidan con el endpoint
 */
function findMockData(endpoint: string): any {
  for (const [pattern, data] of Object.entries(MOCK_DATA)) {
    const regex = new RegExp(pattern);
    if (regex.test(endpoint)) {
      debugLog(`Mock data found for endpoint: ${endpoint}`, data);
      return data;
    }
  }
  
  // Si no hay datos específicos, retornar estructura genérica
  debugLog(`No specific mock data for endpoint: ${endpoint}, returning generic response`);
  return {
    status: 'success',
    message: 'Mock response - no specific data configured',
    data: [],
    timestamp: new Date().toISOString()
  };
}

/**
 * Cliente de API que maneja automáticamente el modo PREVIEW
 */
export class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.API_URL;
  }

  /**
   * Realizar una petición HTTP
   */
  async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    // Si estamos en modo PREVIEW, retornar datos mock
    if (API_CONFIG.PREVIEW_MODE) {
      debugLog(`PREVIEW MODE: Intercepting API call to ${endpoint}`);
      
      const mockData = findMockData(endpoint);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
      
      // Crear una respuesta mock
      const mockResponse = new Response(JSON.stringify(mockData), {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return mockResponse;
    }

    // Modo normal: hacer llamada real a la API
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    debugLog(`Making real API call to: ${url}`);
    
    return fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  }

  /**
   * GET request
   */
  async get(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint: string, data?: any, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put(endpoint: string, data?: any, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Instancia singleton del cliente API
export const apiClient = new APIClient();

// Helper function para compatibilidad con código existente
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  return apiClient.request(endpoint, options);
}
