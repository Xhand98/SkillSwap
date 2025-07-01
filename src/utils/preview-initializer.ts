/**
 * Preview Initializer
 * 
 * Inicializa el sistema de preview y verifica que todo funcione correctamente
 */

import { PREVIEW_MODE, debugLog } from '../config/app-config';
import { PreviewCache } from '../lib/preview-data';
import { previewApi } from '../lib/preview-api';
import previewFetchInterceptor from '../lib/preview-fetch-interceptor';

/**
 * Función para inicializar el sistema de preview
 * Debe ser llamada al iniciar la aplicación
 */
export async function initializePreviewSystem(): Promise<boolean> {
    if (!PREVIEW_MODE) {
        console.log('No estamos en modo preview, omitiendo inicialización');
        return false;
    }

    try {
        debugLog('🚀 Inicializando sistema de preview...');

        // 1. Instalar interceptor de fetch
        previewFetchInterceptor.install();
        debugLog('✅ Interceptor de fetch instalado');

        // 2. Verificar que el cache tiene datos
        const cache = PreviewCache.getInstance();
        const dataStats = {
            users: cache.getUsers().length,
            posts: cache.getPosts().length,
            comments: cache.getComments().length,
            matches: cache.getMatches().length,
            messages: cache.getMessages().length,
            notifications: cache.getNotifications().length,
        };
        debugLog('✅ Cache inicializado con datos:', dataStats);

        // 3. Verificar usuario por defecto
        const defaultUser = cache.getUserById(1);
        if (defaultUser) {
            cache.setCurrentUser(defaultUser);
            debugLog('✅ Usuario por defecto configurado:', defaultUser.nombre_usuario);
        } else {
            debugLog('❌ No se encontró el usuario por defecto. Creando uno...');
            const newUser = {
                id: 1,
                nombre_usuario: "demo_user",
                primer_nombre: "Demo",
                primer_apellido: "User",
                correo_electronico: "demo@example.com",
                ciudad_trabajo: "Madrid",
                rol: "usuario",
                fecha_creacion: new Date().toISOString(),
                activo: true
            };
            cache.addUser(newUser);
            cache.setCurrentUser(newUser);
            debugLog('✅ Usuario por defecto creado:', newUser.nombre_usuario);
        }

        // 4. Verificar API mock
        try {
            const verificationResult = await previewApi.verifyData();
            if (verificationResult.success) {
                debugLog('✅ API mock verificada correctamente:', verificationResult.data);
            } else {
                debugLog('❌ Error al verificar API mock:', verificationResult.error);
            }
        } catch (err) {
            debugLog('❌ Error al verificar API mock:', err);
        }

        // 5. Probar obtención de matches
        try {
            const matchesResult = await previewApi.getMatches();
            if (matchesResult.success) {
                debugLog(`✅ Obtención de matches exitosa: ${matchesResult.data?.length || 0} matches encontrados`);
            } else {
                debugLog('❌ Error al obtener matches:', matchesResult.error);
            }
        } catch (err) {
            debugLog('❌ Error al obtener matches:', err);
        }

        debugLog('🎉 Sistema de preview inicializado correctamente');
        return true;
    } catch (err) {
        debugLog('❌ Error al inicializar el sistema de preview:', err);
        return false;
    }
}

/**
 * Versión sincrónica para importar en cualquier lugar
 */
export function ensurePreviewMode(): void {
    if (PREVIEW_MODE && typeof window !== 'undefined') {
        // Comprobar si ya se ha inicializado
        const previewInitialized = window.localStorage.getItem('preview_initialized');
        
        if (!previewInitialized) {
            // Inicializar y marcar como inicializado
            initializePreviewSystem().then(success => {
                if (success) {
                    window.localStorage.setItem('preview_initialized', Date.now().toString());
                }
            });
        }
    }
}

// Auto-inicializar en el lado del cliente
if (typeof window !== 'undefined') {
    ensurePreviewMode();
}
