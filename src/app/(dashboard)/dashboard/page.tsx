import { FileText, Map, Users } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Resumen Operativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Rutas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Rutas Activas</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">3</p>
            <div className="mt-2 text-green-600 text-xs flex items-center bg-green-50 w-fit px-2 py-1 rounded">
              En producción
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Map size={24} />
          </div>
        </div>

        {/* Card 2: Contenido en revisión */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Pendientes de Revisión</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">12</p>
            <div className="mt-2 text-orange-600 text-xs flex items-center bg-orange-50 w-fit px-2 py-1 rounded">
              Requiere acción
            </div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
            <FileText size={24} />
          </div>
        </div>

        {/* Card 3: Métricas (Fake) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Usuarios Registrados</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">--</p>
            <div className="mt-2 text-gray-400 text-xs flex items-center">
              Datos de solo lectura
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Sección inferior: Accesos rápidos o tareas recientes */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Mis Tareas Recientes</h3>
        <p className="text-gray-500 text-sm">No hay tareas pendientes asignadas a tu usuario.</p>
      </div>
    </div>
  );
}