/**
 * Inicializador del modo preview
 * Este componente se renderiza una vez y se encarga de inicializar el sistema de preview
 */

'use client';

import { useEffect } from 'react';
import { PREVIEW_MODE } from '@/config/app-config';
import { ensurePreviewMode } from '@/utils/preview-initializer';

export function PreviewModeInitializer() {
  useEffect(() => {
    if (PREVIEW_MODE) {
      console.log('[PREVIEW] Inicializando modo preview...');
      ensurePreviewMode();
    }
  }, []);

  // Este componente no renderiza nada
  return null;
}
