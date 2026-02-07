'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { 
  ArrowLeft, Save, Plus, Trash2, Clock, 
  BookOpen, Activity as ActivityIcon, MessageCircle, CheckSquare 
} from 'lucide-react';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors 
} from '@dnd-kit/core';
import { 
  arrayMove, SortableContext, verticalListSortingStrategy 
} from '@dnd-kit/sortable';

import { SortableItem } from '@/components/admin/sortable-item';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

// === 1. Tipos y Esquemas ===

const routeSchema = z.object({
  title: z.string().min(5, 'Título requerido'),
  slug: z.string().min(3),
  topic: z.string().min(1, 'Selecciona un tema'),
  level: z.enum(['basic', 'intermediate', 'advanced']),
  paywall: z.enum(['free', 'pro']),
  status: z.enum(['draft', 'review', 'published']),
  summary: z.string().optional(),
});

type RouteFormValues = z.infer<typeof routeSchema>;

// Tipos locales para el estado del Builder
type BlockType = 'lesson' | 'activity' | 'reflection' | 'checklist';

interface BuilderBlock {
  id: string; // ID temporal único (ej: block-123)
  type: BlockType;
  title: string;
  duration: number;
  content?: string; // Para lecciones o reflexiones
}

interface BuilderDay {
  id: string;
  day_number: number;
  title: string;
  blocks: BuilderBlock[];
}

export default function RouteEditorPage({ params }: { params: { id: string } }) {
  // === 2. Estado del Formulario (Metadata) ===
  const { register, handleSubmit, formState: { errors } } = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      status: 'draft',
      level: 'basic',
      paywall: 'free'
    }
  });

  // === 3. Estado del Builder (Días y Bloques) ===
  const [days, setDays] = useState<BuilderDay[]>([
    { id: 'day-1', day_number: 1, title: 'Introducción', blocks: [] }
  ]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  
  const activeDay = days[activeDayIndex];

  // === 4. Sensores DnD ===
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // El arrastre solo empieza si mueves el mouse 8px. Esto permite hacer clic en inputs sin activar el drag.
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // === 5. Funciones Auxiliares ===

  const addDay = () => {
    const newDayNum = days.length + 1;
    setDays([...days, { 
      id: `day-${Date.now()}`, 
      day_number: newDayNum, 
      title: `Día ${newDayNum}`, 
      blocks: [] 
    }]);
    setActiveDayIndex(days.length); // Ir al nuevo día
  };

  const addBlock = (type: BlockType) => {
    const newBlock: BuilderBlock = {
      id: `blk-${Date.now()}`,
      type,
      title: type === 'lesson' ? 'Nueva Lección' : 'Nuevo Ejercicio',
      duration: 5,
    };

    const updatedDays = [...days];
    updatedDays[activeDayIndex].blocks.push(newBlock);
    setDays(updatedDays);
  };

  const updateBlock = (blockId: string, field: keyof BuilderBlock, value: any) => {
    const updatedDays = [...days];
    const day = updatedDays[activeDayIndex];
    const blockIndex = day.blocks.findIndex(b => b.id === blockId);
    if (blockIndex > -1) {
      day.blocks[blockIndex] = { ...day.blocks[blockIndex], [field]: value };
      setDays(updatedDays);
    }
  };

  const removeBlock = (blockId: string) => {
    const updatedDays = [...days];
    updatedDays[activeDayIndex].blocks = updatedDays[activeDayIndex].blocks.filter(b => b.id !== blockId);
    setDays(updatedDays);
  };

  // Lógica DnD
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = activeDay.blocks.findIndex((b) => b.id === active.id);
      const newIndex = activeDay.blocks.findIndex((b) => b.id === over.id);
      
      const updatedDays = [...days];
      updatedDays[activeDayIndex].blocks = arrayMove(updatedDays[activeDayIndex].blocks, oldIndex, newIndex);
      setDays(updatedDays);
    }
  };

  const calculateTotalMinutes = (day: BuilderDay) => day.blocks.reduce((acc, b) => acc + b.duration, 0);

  const onSubmit = (data: RouteFormValues) => {
    console.log('Guardando Ruta Completa:', { metadata: data, structure: days });
    alert('Ruta guardada (mira la consola)');
  };

  // === RENDER ===
  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* HEADER SUPERIOR */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/routes" className="text-gray-500 hover:text-gray-800"><ArrowLeft /></Link>
          <h1 className="text-xl font-bold text-gray-900">Editor de Rutas</h1>
        </div>
        <button onClick={handleSubmit(onSubmit)} className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2 hover:bg-blue-700">
          <Save size={18} /> Guardar
        </button>
      </div>

      {/* LAYOUT 3 COLUMNAS */}
      <div className="grid grid-cols-12 gap-6 h-full overflow-hidden">
        
        {/* COL 1: METADATA (Izquierda - 25%) */}
        <div className="col-span-12 lg:col-span-3 overflow-y-auto bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-full">
          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Configuración</h3>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Título de la Ruta</label>
              <input {...register('title')} className="w-full p-2 border rounded mt-1 text-sm text-black" />
              {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Slug</label>
              <input {...register('slug')} className="w-full p-2 border rounded mt-1 text-sm text-black" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Tema Principal</label>
              <select {...register('topic')} className="w-full p-2 border rounded mt-1 text-sm text-black">
                <option value="">Seleccionar...</option>
                <option value="ansiedad">Ansiedad</option>
                <option value="sueno">Sueño</option>
                <option value="autoestima">Autoestima</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Nivel</label>
                <select {...register('level')} className="w-full p-2 border rounded mt-1 text-sm text-black">
                  <option value="basic">Básico</option>
                  <option value="intermediate">Intermedio</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Acceso</label>
                <select {...register('paywall')} className="w-full p-2 border rounded mt-1 text-sm text-black">
                  <option value="free">Gratis</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Resumen</label>
              <textarea {...register('summary')} className="w-full p-2 border rounded mt-1 text-sm h-24 text-black" />
            </div>
          </form>
        </div>

        {/* COL 2: BUILDER (Centro - 41%) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col h-full gap-4">
          
          {/* Navegación de Días */}
          <div className="bg-white p-2 rounded-lg border border-gray-200 flex gap-2 overflow-x-auto whitespace-nowrap">
            {days.map((day, idx) => (
              <button
                key={day.id}
                onClick={() => setActiveDayIndex(idx)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                  idx === activeDayIndex 
                    ? 'bg-slate-800 text-white shadow' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Día {day.day_number}
              </button>
            ))}
            <button onClick={addDay} className="px-2 py-1.5 text-blue-600 hover:bg-blue-50 rounded">
              <Plus size={18} />
            </button>
          </div>

          {/* Área de Edición del Día Activo */}
          <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div>
                <input 
                  value={activeDay.title}
                  onChange={(e) => {
                    const newDays = [...days];
                    newDays[activeDayIndex].title = e.target.value;
                    setDays(newDays);
                  }}
                  className="bg-transparent text-lg font-bold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none w-full"
                />
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock size={12} /> {calculateTotalMinutes(activeDay)} min estimados
                </p>
              </div>
            </div>

            {/* Lista de Bloques (Drag & Drop Area) */}
            <div className="flex-1 overflow-y-auto pr-2">
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={activeDay.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  {activeDay.blocks.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 text-sm">
                      Este día está vacío. Añade bloques abajo.
                    </div>
                  )}
                  
                  {activeDay.blocks.map((block) => (
                    <SortableItem key={block.id} id={block.id}>
                      <div className="bg-white p-3 rounded shadow-sm border border-gray-200 group-hover:border-blue-400 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {getBlockIcon(block.type)}
                            <span className="text-xs uppercase font-bold text-gray-400">{block.type}</span>
                          </div>
                          <button onClick={() => removeBlock(block.id)} className="text-gray-300 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <input 
                          value={block.title}
                          onChange={(e) => updateBlock(block.id, 'title', e.target.value)}
                          className="w-full text-sm font-medium text-gray-800 border-none p-0 focus:ring-0 mb-2"
                          placeholder="Título del bloque"
                        />
                        
                        <div className="flex gap-2">
                          <input 
                            type="number"
                            value={block.duration}
                            onChange={(e) => updateBlock(block.id, 'duration', parseInt(e.target.value))}
                            className="w-16 bg-gray-50 border border-gray-200 rounded px-1 text-xs text-right"
                          />
                          <span className="text-xs text-gray-500 self-center">min</span>
                        </div>
                      </div>
                    </SortableItem>
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            {/* Toolbar de Insertar */}
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-4 gap-2">
              <button onClick={() => addBlock('lesson')} className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 text-gray-600 hover:text-blue-600 transition text-xs gap-1">
                <BookOpen size={18} /> Lección
              </button>
              <button onClick={() => addBlock('activity')} className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded hover:bg-purple-50 hover:border-purple-200 text-gray-600 hover:text-purple-600 transition text-xs gap-1">
                <ActivityIcon size={18} /> Actividad
              </button>
              <button onClick={() => addBlock('reflection')} className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded hover:bg-orange-50 hover:border-orange-200 text-gray-600 hover:text-orange-600 transition text-xs gap-1">
                <MessageCircle size={18} /> Reflexión
              </button>
              <button onClick={() => addBlock('checklist')} className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded hover:bg-green-50 hover:border-green-200 text-gray-600 hover:text-green-600 transition text-xs gap-1">
                <CheckSquare size={18} /> Checklist
              </button>
            </div>
          </div>
        </div>

        {/* COL 3: PREVIEW (Derecha - 33%) */}
        <div className="col-span-12 lg:col-span-4 hidden lg:flex justify-center bg-gray-100 rounded-xl border border-gray-200 pt-8 overflow-hidden sticky top-0 h-full">
           <div className="relative w-[300px] h-[600px] bg-white rounded-[2.5rem] shadow-xl border-8 border-slate-800 overflow-hidden flex flex-col">
              {/* Header App */}
              <div className="bg-slate-50 p-4 pt-10 border-b">
                 <h2 className="font-bold text-gray-900 text-lg leading-none">{activeDay.title}</h2>
                 <p className="text-xs text-gray-500 mt-1">Día {activeDay.day_number} • {calculateTotalMinutes(activeDay)} min</p>
              </div>

              {/* Timeline Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
                 {/* Línea conectora */}
                 <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-200 -z-0"></div>

                 {activeDay.blocks.map((block, idx) => (
                    <div key={block.id} className="relative z-10 flex gap-3">
                       {/* Icono Timeline */}
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm ${
                          block.type === 'activity' ? 'bg-purple-100 text-purple-600' :
                          block.type === 'reflection' ? 'bg-orange-100 text-orange-600' :
                          'bg-blue-100 text-blue-600'
                       }`}>
                          {getMiniIcon(block.type)}
                       </div>
                       
                       {/* Card Contenido */}
                       <div className="flex-1 bg-white border border-gray-100 shadow-sm rounded-lg p-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-0.5">
                             {block.type === 'activity' ? 'Práctica' : block.type}
                          </span>
                          <p className="text-sm font-medium text-gray-800 leading-tight">
                             {block.title || '(Sin título)'}
                          </p>
                          <div className="mt-2 flex items-center text-[10px] text-gray-400 gap-1">
                             <Clock size={10} /> {block.duration} min
                          </div>
                       </div>
                    </div>
                 ))}

                 {activeDay.blocks.length === 0 && (
                    <div className="text-center mt-20 text-gray-400 text-xs px-8">
                       La vista previa aparecerá aquí cuando agregues contenido.
                    </div>
                 )}
              </div>
              
              {/* Botón Flotante */}
              <div className="absolute bottom-6 right-4">
                 <div className="w-12 h-12 bg-slate-900 rounded-full shadow-lg flex items-center justify-center text-white">
                    <ActivityIcon size={20} />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// Icon Helpers
function getBlockIcon(type: BlockType) {
  switch(type) {
    case 'lesson': return <BookOpen size={16} className="text-blue-500" />;
    case 'activity': return <ActivityIcon size={16} className="text-purple-500" />;
    case 'reflection': return <MessageCircle size={16} className="text-orange-500" />;
    case 'checklist': return <CheckSquare size={16} className="text-green-500" />;
  }
}

function getMiniIcon(type: BlockType) {
  switch(type) {
    case 'lesson': return <BookOpen size={12} />;
    case 'activity': return <ActivityIcon size={12} />;
    case 'reflection': return <MessageCircle size={12} />;
    case 'checklist': return <CheckSquare size={12} />;
  }
}