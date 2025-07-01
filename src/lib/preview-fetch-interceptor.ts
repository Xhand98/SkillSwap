/**
 * Interceptor para modo preview
 * Intercepta todas las llamadas fetch cuando está en modo preview
 */

import { PREVIEW_MODE, debugLog } from '../config/app-config';

// Guardar el fetch original
const originalFetch = globalThis.fetch;

// Función para interceptar fetch en modo preview
function previewFetchInterceptor(url: string | URL | Request, options?: RequestInit): Promise<Response> {
    if (PREVIEW_MODE) {
        debugLog('🚫 FETCH INTERCEPTADO en modo preview:', url);
        
        // En modo preview, no permitir ninguna llamada fetch real
        return Promise.reject(new Error(
            `FETCH BLOQUEADO: En modo preview no se permiten llamadas reales a APIs. URL: ${url}`
        ));
    }
    
    // Si no estamos en modo preview, usar fetch normal
    return originalFetch(url, options);
}

// Función para instalar el interceptor
export function installPreviewFetchInterceptor(): void {
    if (PREVIEW_MODE && typeof window !== 'undefined') {
        debugLog('🔧 Instalando interceptor de fetch para modo preview');
        globalThis.fetch = previewFetchInterceptor;
        
        // También interceptar XMLHttpRequest si es necesario
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = class extends originalXHR {
            open(method: string, url: string | URL, async: boolean = true, user?: string | null, password?: string | null): void {
                if (PREVIEW_MODE) {
                    debugLog('🚫 XMLHttpRequest INTERCEPTADO en modo preview:', url);
                    throw new Error(`XMLHttpRequest BLOQUEADO: En modo preview no se permiten llamadas reales a APIs. URL: ${url}`);
                }
                super.open(method, url, async, user, password);
            }
        };
    }
}

// Función para restaurar fetch original
export function restoreOriginalFetch(): void {
    if (typeof window !== 'undefined') {
        globalThis.fetch = originalFetch;
        debugLog('🔄 Fetch original restaurado');
    }
}

// Auto-instalación en modo preview
if (PREVIEW_MODE && typeof window !== 'undefined') {
    // Instalar el interceptor cuando se importe este módulo
    window.addEventListener('DOMContentLoaded', () => {
        installPreviewFetchInterceptor();
    });
    
    // Si ya se cargó el DOM, instalar inmediatamente
    if (document.readyState === 'loading') {
        installPreviewFetchInterceptor();
    }
}

export default {
    install: installPreviewFetchInterceptor,
    restore: restoreOriginalFetch,
    isInstalled: () => PREVIEW_MODE && globalThis.fetch === previewFetchInterceptor
};
