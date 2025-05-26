/**
 * Configuración centralizada para la API de SkillSwap
 */

export const API_CONFIG = {
  /**
   * URL base de la API
   * @description Esta URL se utiliza para todas las llamadas a la API
   * En producción, utiliza la variable de entorno NEXT_PUBLIC_API_URL
   */
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
};
