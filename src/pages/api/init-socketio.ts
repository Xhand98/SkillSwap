import { NextApiRequest, NextApiResponse } from 'next';

// Endpoint para inicializar Socket.IO manualmente
const initSocketIOHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🚀 Inicializando Socket.IO...');
    
    // Hacer una petición al endpoint socket para forzar la inicialización
    const response = await fetch('http://localhost:3000/api/socket', {
      method: 'GET',
    });

    // Esperar un poco para asegurar la inicialización
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('✅ Inicialización de Socket.IO completada');

    res.status(200).json({
      success: true,
      initialized: true,
      message: 'Socket.IO inicializado correctamente'
    });
  } catch (error) {
    console.error('❌ Error al inicializar Socket.IO:', error);
    res.status(500).json({
      success: false,
      initialized: false,
      error: 'Error al inicializar Socket.IO',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export default initSocketIOHandler;
