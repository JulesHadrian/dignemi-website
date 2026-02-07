'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Activity } from '@/types/content';

// Mock data inicial (luego conectaremos con API)
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    title: 'Respiración Cuadrada',
    slug: 'respiracion-cuadrada',
    type: 'breathing_timer',
    topic_ids: ['ansiedad'],
    duration_minutes: 5,
    difficulty: 'basic',
    paywall: 'free',
    status: 'published',
    version: 1,
    instructions: { intro_text: 'Respira...' }
  },
  {
    id: '2',
    title: 'Checklist de Sueño',
    slug: 'checklist-sueno',
    type: 'checklist',
    topic_ids: ['sueno'],
    duration_minutes: 3,
    difficulty: 'basic',
    paywall: 'pro',
    status: 'draft',
    version: 1,
    instructions: { intro_text: 'Antes de dormir...' }
  }
];

export default function ActivitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado simple local por ahora
  const filteredActivities = MOCK_ACTIVITIES.filter(act => 
    act.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actividades</h1>
          <p className="text-sm text-gray-500">Gestiona el catálogo de ejercicios y herramientas.</p>
        </div>
        <Link 
          href="/dashboard/activities/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
        >
          <Plus size={18} />
          Nueva Actividad
        </Link>
      </div>

      {/* Barra de Herramientas (Búsqueda y Filtros) */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por título..."
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

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Título</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Duración</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredActivities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{activity.title}</div>
                  <div className="text-xs text-gray-500">{activity.slug}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {activity.type.replace('_', ' ')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {activity.duration_minutes} min
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={activity.status} />
                </td>
                <td className="px-6 py-4">
                  <Link 
                    href={`/dashboard/activities/${activity.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredActivities.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No se encontraron actividades.
          </div>
        )}
      </div>
    </div>
  );
}