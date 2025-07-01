/**
 * Configuración centralizada para la API de SkillSwap
 */
import { PREVIEW_MODE } from '@/config/app-config';

export const API_CONFIG = {
    /**
     * URL base de la API
     * @description Esta URL se utiliza para todas las llamadas a la API
     * En producción, utiliza la variable de entorno NEXT_PUBLIC_API_URL
     * En modo PREVIEW, las llamadas a la API serán interceptadas o mockeadas
     */
    API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",

    /**
     * Indica si estamos en modo preview (usando datos mock)
     */
    PREVIEW_MODE,

    /**
     * Función helper para determinar si debe hacer llamadas reales a la API
     */
    shouldUseRealAPI: () => !PREVIEW_MODE,
};
