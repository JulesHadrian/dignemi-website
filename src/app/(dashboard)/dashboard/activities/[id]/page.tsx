'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { Save, Eye, ArrowLeft, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// === SCHEMAS DE VALIDACIÓN (ZOD) ===
const activitySchema = z.object({
  title: z.string().min(3, 'El título es muy corto'),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug inválido (solo a-z, 0-9, -)'),
  type: z.enum(['breathing_timer', 'grounding', 'checklist', 'reflection', 'psychoeducation']),
  duration_minutes: z.coerce.number().min(1),
  difficulty: z.enum(['basic', 'intermediate', 'advanced']),
  status: z.enum(['draft', 'review', 'published']),
  intro_text: z.string().min(10, 'La introducción debe ser descriptiva'),
  cover_image: z.string().optional(),
  // Config específica para Breathing (opcional)
  breathing_inhale: z.coerce.number().optional(),
  breathing_hold: z.coerce.number().optional(),
  breathing_exhale: z.coerce.number().optional(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

export default function ActivityEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === 'new';
  
  // Setup Form
  const { register, handleSubmit, watch, formState: { errors, isDirty } } = useForm<ActivityFormValues>({
  resolver: zodResolver(activitySchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      type: 'breathing_timer',
      duration_minutes: 5,
      difficulty: 'basic',
      status: 'draft',
      intro_text: '',
      breathing_inhale: 4,
      breathing_hold: 4,
      breathing_exhale: 4,
    }
  });

  // Watch values para el Preview en tiempo real
  const formValues = watch();

  const onSubmit = (data: ActivityFormValues) => {
    console.log('Guardando...', data);
    // Aquí iría la llamada a la API (PUT/POST)
    alert('Actividad guardada (simulación)');
    router.push('/dashboard/activities');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header del Editor */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/activities" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isNew ? 'Nueva Actividad' : 'Editar Actividad'}
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-2">
              {isDirty ? <span className="text-orange-500">● Cambios sin guardar</span> : <span className="text-green-500">● Sincronizado</span>}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleSubmit(onSubmit)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Save size={18} />
            Guardar
          </button>
        </div>
      </div>

      {/* Layout Split: Form vs Preview */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
        
        {/* COLUMNA IZQ: Formulario (Scrollable) */}
        <div className="overflow-y-auto pr-4 pb-10 space-y-6">
          
          {/* Card: Información Básica */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-800 border-b pb-2">Configuración General</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input {...register('title')} className="w-full p-2 border rounded mt-1 text-black" placeholder="Ej: Respiración 4-7-8" />
                {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <input {...register('slug')} className="w-full p-2 border rounded mt-1 text-black" placeholder="respiracion-478" />
                {errors.slug && <p className="text-red-500 text-xs">{errors.slug.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select {...register('type')} className="w-full p-2 border rounded mt-1 text-black">
                  <option value="breathing_timer">Respiración (Timer)</option>
                  <option value="grounding">Grounding (Pasos)</option>
                  <option value="checklist">Checklist</option>
                  <option value="reflection">Reflexión</option>
                  <option value="psychoeducation">Psicoeducación</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Duración (min)</label>
                <input type="number" {...register('duration_minutes')} className="w-full p-2 border rounded mt-1 text-black" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Dificultad</label>
                <select {...register('difficulty')} className="w-full p-2 border rounded mt-1 text-black">
                  <option value="basic">Básico</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado (Workflow)</label>
                <select {...register('status')} className="w-full p-2 border rounded mt-1 text-black bg-gray-50">
                  <option value="draft">Borrador</option>
                  <option value="review">En Revisión</option>
                  <option value="published">Publicado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card: Contenido */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-800 border-b pb-2">Contenido e Instrucciones</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Texto Introductorio</label>
              <textarea 
                {...register('intro_text')} 
                className="w-full p-2 border rounded mt-1 h-32 text-black" 
                placeholder="Explica al usuario de qué trata este ejercicio..."
              />
              {errors.intro_text && <p className="text-red-500 text-xs">{errors.intro_text.message}</p>}
            </div>

            {/* Configuración condicional según Tipo */}
            {formValues.type === 'breathing_timer' && (
              <div className="bg-blue-50 p-4 rounded border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800 mb-2">Configuración del Timer</h4>
                <div className="flex gap-4">
                  <div>
                    <label className="text-xs text-blue-700">Inhala (s)</label>
                    <input type="number" {...register('breathing_inhale')} className="w-full p-1 border rounded text-black" />
                  </div>
                  <div>
                    <label className="text-xs text-blue-700">Sostén (s)</label>
                    <input type="number" {...register('breathing_hold')} className="w-full p-1 border rounded text-black" />
                  </div>
                  <div>
                    <label className="text-xs text-blue-700">Exhala (s)</label>
                    <input type="number" {...register('breathing_exhale')} className="w-full p-1 border rounded text-black" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DER: Preview Móvil */}
        <div className="hidden lg:flex justify-center items-start pt-4 bg-gray-100 rounded-xl border border-gray-200 sticky top-0 h-full overflow-hidden">
          <div className="relative w-[320px] h-[640px] bg-white rounded-[3rem] shadow-2xl border-8 border-gray-800 overflow-hidden flex flex-col">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10"></div>
            
            {/* App Header */}
            <div className="bg-white pt-10 pb-4 px-4 shadow-sm z-0">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">DIGNEMI APP</div>
            </div>

            {/* App Content Simulation */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              {formValues.cover_image && (
                 <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
              )}
              
              <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                {formValues.title || 'Título del Ejercicio'}
              </h2>
              
              <div className="flex gap-2 mt-2 mb-6">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase">
                  {formValues.difficulty}
                </span>
                <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase">
                  {formValues.duration_minutes} min
                </span>
              </div>

              <div className="prose prose-sm text-gray-600 mb-6">
                <p>{formValues.intro_text || 'Aquí aparecerá la introducción...'}</p>
              </div>

              {/* Simulador de Componente Nativo */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                {formValues.type === 'breathing_timer' ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-32 h-32 rounded-full border-4 border-blue-200 flex items-center justify-center relative">
                      <span className="text-2xl font-light text-blue-600">Inhala</span>
                      <div className="absolute -bottom-8 text-xs text-gray-400">
                        {formValues.breathing_inhale}s - {formValues.breathing_hold}s - {formValues.breathing_exhale}s
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-gray-400 text-sm">
                    [Componente interactivo: {formValues.type}]
                  </div>
                )}
              </div>
              
              <button className="w-full bg-slate-900 text-white py-3 rounded-full mt-8 font-semibold shadow-lg">
                Comenzar
              </button>
            </div>

            {/* Bottom Bar */}
            <div className="h-1 bg-gray-200 mx-auto w-1/3 rounded mb-2"></div>
          </div>
          
          <div className="absolute top-4 right-4 bg-white/80 p-2 rounded backdrop-blur text-xs font-mono">
            Preview Interactivo
          </div>
        </div>

      </div>
    </div>
  );
}