/**
 * Componente indicador de modo preview
 * Muestra un banner cuando la aplicación está en modo preview
 */

'use client';

import React, { useState } from 'react';
import { PREVIEW_MODE, debugLog } from '../config/app-config';
import { usePreview } from '@/hooks/usePreview';

interface PreviewBannerProps {
  className?: string;
  showControls?: boolean;
}

export const PreviewBanner: React.FC<PreviewBannerProps> = ({
  className = '',
  showControls = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const {
    generateRandomData,
    clearCache,
    simulateMessage,
    simulateNotification,
    cache
  } = usePreview();

  if (!PREVIEW_MODE) {
    return null;
  }

  const handleAction = (action: string, callback: () => void) => {
    callback();
    setLastAction(action);
    setTimeout(() => setLastAction(''), 2000);
  };

  const currentUser = cache?.getCurrentUser();

  return (
    <div className={`bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 ${className}`}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">
              Modo Preview Activo - Sin conexión a BD
            </p>
            {currentUser && (
              <p className="text-xs mt-1">
                Usuario: {currentUser.primer_nombre} {currentUser.primer_apellido} (ID: {currentUser.id})
              </p>
            )}
            {lastAction && (
              <p className="text-xs mt-1 text-green-600">
                ✓ {lastAction}
              </p>
            )}
          </div>
        </div>

        {showControls && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              {isExpanded ? 'Ocultar' : 'Controles'}
            </button>
          </div>
        )}
      </div>

      {isExpanded && showControls && (
        <div className="px-3 pb-3 border-t border-yellow-200">
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => handleAction('Datos aleatorios generados', generateRandomData)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
            >
              Generar Datos
            </button>

            <button
              onClick={() => handleAction('Cache limpiado', clearCache)}
              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
            >
              Limpiar Cache
            </button>

            <button
              onClick={() => {
                simulateMessage(2, '¡Hola! Este es un mensaje simulado');
                handleAction('Mensaje simulado enviado', () => {});
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
            >
              Simular Mensaje
            </button>

            <button
              onClick={() => {
                simulateNotification('Test', 'Esta es una notificación de prueba', 'info');
                handleAction('Notificación simulada', () => {});
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs transition-colors"
            >
              Simular Notif.
            </button>
          </div>

          <div className="mt-3 text-xs text-yellow-600">
            <p><strong>Modo Preview:</strong> Todos los datos son simulados. No se conecta a la base de datos real.</p>
            <p><strong>Login:</strong> Cualquier email/contraseña válidos funcionarán.</p>
            <p><strong>Registro:</strong> Se creará un usuario mock automáticamente.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente flotante para desarrolladores
export const PreviewFloatingControls: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const {
    generateRandomData,
    clearCache,
    simulateMessage,
    simulateNotification
  } = usePreview();

  if (!PREVIEW_MODE) {
    return null;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setPosition({
        x: moveEvent.clientX - offsetX,
        y: moveEvent.clientY - offsetY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full shadow-lg z-50 transition-colors"
        title="Mostrar controles de preview"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
      </button>
    );
  }

  return (
    <div
      className="fixed bg-yellow-100 border-2 border-yellow-500 rounded-lg p-3 shadow-lg z-50 select-none"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-yellow-800">Preview Controls</h4>
        <button
          onClick={() => setIsVisible(false)}
          className="text-yellow-600 hover:text-yellow-800 ml-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={generateRandomData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
          title="Agregar usuarios y posts aleatorios"
        >
          + Datos
        </button>

        <button
          onClick={clearCache}
          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
          title="Resetear todos los datos a valores iniciales"
        >
          Reset
        </button>

        <button
          onClick={() => simulateMessage(2, 'Mensaje de prueba desde María')}
          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
          title="Simular mensaje entrante"
        >
          Mensaje
        </button>

        <button
          onClick={() => simulateNotification('Preview', 'Notificación de prueba', 'info')}
          className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs transition-colors"
          title="Simular notificación"
        >
          Notif.
        </button>
      </div>

      <div className="mt-2 text-xs text-yellow-700">
        <p>🟡 Modo Preview Activo</p>
      </div>
    </div>
  );
};

// Hook para usar el banner de preview en cualquier componente
export const usePreviewBanner = () => {
  return {
    isPreviewMode: PREVIEW_MODE,
    PreviewBanner,
    PreviewFloatingControls
  };
};
