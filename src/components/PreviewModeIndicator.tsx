/**
 * Componente que muestra el estado del modo PREVIEW
 */
import { PREVIEW_MODE } from '@/config/app-config';

export function PreviewModeIndicator() {
  if (!PREVIEW_MODE) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium shadow-lg border border-yellow-600">
        🧪 PREVIEW MODE
      </div>
    </div>
  );
}

export function PreviewBanner() {
  if (!PREVIEW_MODE) {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>Modo Vista Previa Activo:</strong> Estás viendo datos de demostración. 
            Cambia <code className="bg-yellow-200 px-1 rounded">NEXT_PUBLIC_PREVIEW=FALSE</code> en tu archivo <code className="bg-yellow-200 px-1 rounded">.env.development</code> para usar la API real.
          </p>
        </div>
      </div>
    </div>
  );
}
