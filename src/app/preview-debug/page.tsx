/**
 * preview-debug.tsx
 * 
 * Página para diagnosticar el modo preview y verificar que los matches funcionen correctamente
 */

'use client';

import { useState, useEffect } from 'react';
import { usePreview } from '@/hooks/usePreview_new';
import { PreviewCache } from '@/lib/preview-data';
import { initializePreviewSystem } from '@/utils/preview-initializer';

export default function PreviewDebugPage() {
  const preview = usePreview();
  const [systemStatus, setSystemStatus] = useState<Record<string, any>>({});
  const [userInfo, setUserInfo] = useState<any>(null);
  const [matchesData, setMatchesData] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
      setLoading(true);
      addLog('Inicializando diagnóstico del modo preview...');

      try {
        // Obtener estado del sistema
        const isPreviewMode = preview.isPreviewMode;
        addLog(`Modo preview: ${isPreviewMode ? 'ACTIVADO' : 'DESACTIVADO'}`);
        
        if (isPreviewMode) {
          // Reinicializar el sistema
          await initializePreviewSystem();
          addLog('Sistema preview reinicializado');
          
          // Verificar datos
          if (preview.api) {
            const verificationResult = await preview.api.verifyData();
            setSystemStatus(verificationResult.data || {});
            addLog('Datos del sistema verificados');
          }
          
          // Obtener usuario actual
          const cache = PreviewCache.getInstance();
          const currentUser = cache.getCurrentUser();
          setUserInfo(currentUser);
          addLog(currentUser 
            ? `Usuario actual: ${currentUser.nombre_usuario} (ID: ${currentUser.id})` 
            : 'No hay usuario autenticado');
            
          // Probar obtención de matches
          if (preview.api) {
            addLog('Obteniendo matches...');
            const matchesResult = await preview.api.getMatches();
            
            if (matchesResult.success) {
              const matches = matchesResult.data || [];
              setMatchesData(matches);
              addLog(`Matches obtenidos correctamente: ${matches.length} matches encontrados`);
            } else {
              addLog(`Error al obtener matches: ${matchesResult.error}`);
            }
          }
        } else {
          addLog('ADVERTENCIA: No estamos en modo preview. Activa NEXT_PUBLIC_PREVIEW=TRUE en .env.development');
        }
      } catch (error) {
        addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    }
    
    initialize();
  }, [preview]);
  
  function addLog(message: string) {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.log(`[PREVIEW DEBUG] ${message}`);
  }
  
  async function handleReinitialize() {
    setLoading(true);
    addLog('Reinicializando sistema...');
    
    try {
      await initializePreviewSystem();
      addLog('Sistema reinicializado correctamente');
      
      // Actualizar datos
      if (preview.api) {
        const verificationResult = await preview.api.verifyData();
        setSystemStatus(verificationResult.data || {});
      }
      
      const cache = PreviewCache.getInstance();
      setUserInfo(cache.getCurrentUser());
      
      // Refrescar matches
      if (preview.api) {
        const matchesResult = await preview.api.getMatches();
        if (matchesResult.success) {
          setMatchesData(matchesResult.data || []);
          addLog(`Matches actualizados: ${matchesResult.data?.length || 0} encontrados`);
        }
      }
    } catch (error) {
      addLog(`Error al reinicializar: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleResetData() {
    setLoading(true);
    addLog('Reseteando datos...');
    
    try {
      const cache = PreviewCache.getInstance();
      cache.clear();
      addLog('Cache limpiado');
      
      // Reinicializar todo
      await initializePreviewSystem();
      
      // Actualizar UI
      if (preview.api) {
        const verificationResult = await preview.api.verifyData();
        setSystemStatus(verificationResult.data || {});
      }
      
      setUserInfo(cache.getCurrentUser());
      
      if (preview.api) {
        const matchesResult = await preview.api.getMatches();
        if (matchesResult.success) {
          setMatchesData(matchesResult.data || []);
        }
      }
      
      addLog('Datos reseteados correctamente');
    } catch (error) {
      addLog(`Error al resetear datos: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }
  
  async function testMatches() {
    setLoading(true);
    addLog('Probando obtención de matches...');
    
    try {
      if (preview.api) {
        const matchesResult = await preview.api.getMatches();
        
        if (matchesResult.success) {
          setMatchesData(matchesResult.data || []);
          addLog(`✅ Matches obtenidos correctamente: ${matchesResult.data?.length || 0} matches`);
        } else {
          addLog(`❌ Error al obtener matches: ${matchesResult.error}`);
        }
      } else {
        addLog('❌ API de preview no disponible');
      }
    } catch (error) {
      addLog(`❌ Exception: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Diagnóstico de Modo Preview</h1>
      
      {/* Estado del modo preview */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Estado del Sistema</h2>
        <div className="flex items-center mb-4">
          <div className={`w-4 h-4 rounded-full mr-2 ${preview.isPreviewMode ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Modo Preview: {preview.isPreviewMode ? 'ACTIVADO' : 'DESACTIVADO'}</span>
        </div>
        
        {loading ? (
          <p className="text-gray-500">Cargando información del sistema...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
              <h3 className="font-medium mb-2">Datos en Cache:</h3>
              <ul className="list-disc list-inside">
                <li>Usuarios: {systemStatus.users || 0}</li>
                <li>Posts: {systemStatus.posts || 0}</li>
                <li>Matches: {systemStatus.matches || 0}</li>
                <li>Mensajes: {systemStatus.messages || 0}</li>
              </ul>
            </div>
            
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
              <h3 className="font-medium mb-2">Usuario Actual:</h3>
              {userInfo ? (
                <ul className="list-disc list-inside">
                  <li>ID: {userInfo.id}</li>
                  <li>Nombre: {userInfo.primer_nombre} {userInfo.primer_apellido}</li>
                  <li>Usuario: {userInfo.nombre_usuario}</li>
                  <li>Email: {userInfo.correo_electronico}</li>
                </ul>
              ) : (
                <p className="text-yellow-500">No hay usuario autenticado</p>
              )}
            </div>
            
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
              <h3 className="font-medium mb-2">Acciones:</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handleReinitialize}
                  disabled={loading}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Reinicializar
                </button>
                <button 
                  onClick={handleResetData}
                  disabled={loading}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Reset Datos
                </button>
                <button 
                  onClick={testMatches}
                  disabled={loading}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Test Matches
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Matches */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Matches ({matchesData.length})</h2>
        
        {matchesData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Usuario 1</th>
                  <th className="p-2 text-left">Usuario 2</th>
                  <th className="p-2 text-left">Estado</th>
                  <th className="p-2 text-left">Fecha</th>
                  <th className="p-2 text-left">Post ID</th>
                </tr>
              </thead>
              <tbody>
                {matchesData.map(match => (
                  <tr key={match.id} className="border-b dark:border-gray-700">
                    <td className="p-2">{match.id}</td>
                    <td className="p-2">{match.usuario1_id}</td>
                    <td className="p-2">{match.usuario2_id}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        match.estado === 'aceptado' ? 'bg-green-100 text-green-800' :
                        match.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {match.estado}
                      </span>
                    </td>
                    <td className="p-2">{new Date(match.fecha_creacion).toLocaleString()}</td>
                    <td className="p-2">{match.post_relacionado_id || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded">
            No se encontraron matches.
          </div>
        )}
      </div>
      
      {/* Logs */}
      <div className="p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Logs</h2>
        <div className="bg-black text-green-400 p-3 rounded font-mono text-sm h-64 overflow-y-auto">
          {logs.length > 0 ? logs.map((log, index) => (
            <div key={index}>{log}</div>
          )) : (
            <div className="text-gray-500">No hay logs disponibles</div>
          )}
        </div>
      </div>
    </div>
  );
}
