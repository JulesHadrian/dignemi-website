'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Map, Loader2, AlertCircle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { contentService } from '@/services/content-service';
import { Route } from '@/types/content';

export default function RoutesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch de datos usando React Query
  const { data: routes, isLoading, isError, error } = useQuery({
    queryKey: ['routes'], // Clave única para caché
    queryFn: contentService.getRoutes,
  });

  // 2. Filtrado local (se ejecuta sobre los datos traídos de la API)
  const filteredRoutes = routes?.filter((route) => 
    route.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Estado de Carga
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // Estado de Error
  if (isError) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
        <AlertCircle className="mx-auto mb-2" size={32} />
        <p className="font-bold">Error al cargar las rutas</p>
        <p className="text-sm">{(error as any)?.message || 'No se pudo conectar con el servidor'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programas y Rutas</h1>
          <p className="text-sm text-gray-500">
            {routes?.length 
              ? `Mostrando ${routes.length} rutas del catálogo.` 
              : 'Gestiona las rutas de aprendizaje.'}
          </p>
        </div>
        <Link 
          href="/dashboard/routes/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
        >
          <Plus size={18} />
          Nueva Ruta
        </Link>
      </div>

      {/* Barra de Herramientas */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar ruta por título..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
          <Filter size={18} />
          Filtros
        </button>
      </div>

      {/* Tabla de Datos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ruta</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tema</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Duración</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRoutes.length > 0 ? (
              filteredRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded">
                        <Map size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{route.title}</div>
                        <div className="text-xs text-gray-500 uppercase">{route.level}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                    {/* Ajusta esto si tu API devuelve el objeto topic o solo el ID */}
                    {typeof route.topic_id === 'string' ? route.topic_id : 'General'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {route.duration_days} días
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={route.status} />
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      href={`/dashboard/routes/${route.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No se encontraron rutas. Intenta crear una nueva.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}