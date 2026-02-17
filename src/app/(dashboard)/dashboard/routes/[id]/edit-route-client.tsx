'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';

import { contentService } from '@/services/content-service';
import { UpdateContentPayload } from '@/types/content';

// === SCHEMAS (igual que en new/page.tsx) ===
const routeDaySchema = z.object({
  day: z.number().min(1),
  title: z.string().min(1, 'Título requerido'),
  description: z.string().min(1, 'Descripción requerida'),
  exerciseId: z.string().optional(),
  estimatedTime: z.string().min(1, 'Tiempo estimado requerido'),
  objectives: z.array(z.string()).optional(),
});

const routeFormSchema = z.object({
  // Campos requeridos
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  intro: z.string().min(10, 'La introducción debe tener al menos 10 caracteres'),
  days: z.array(routeDaySchema).min(1, 'Agrega al menos un día'),

  // Campos opcionales
  description: z.string().optional(),
  topic: z.string().optional(),
  locale: z.enum(['es-LATAM', 'pt-BR']).optional(),
  isPremium: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  version: z.number().min(1).optional(),
  disclaimerId: z.string().optional(),
  duration: z.string().optional(),
  difficulty: z.enum(['principiante', 'intermedio', 'avanzado']).optional(),
  estimatedDailyTime: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
});

type RouteFormValues = z.infer<typeof routeFormSchema>;

interface EditRouteClientProps {
  id: string;
}

export function EditRouteClient({ id }: EditRouteClientProps) {
  const router = useRouter();
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Cargar datos del contenido
  const { data: content, isLoading: isLoadingContent } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentService.getContentById(id),
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema),
  });

  // Inicializar formulario con datos del servidor
  useEffect(() => {
    if (content && content.type === 'route') {
      const body = content.body as any; // RouteBodyContent
      reset({
        title: content.title,
        description: content.description || '',
        topic: content.topic || '',
        locale: content.locale || 'es-LATAM',
        isPremium: content.isPremium || false,
        isPublished: content.isPublished || false,
        version: content.version || 1,
        disclaimerId: content.disclaimerId || '',
        intro: body.intro || '',
        duration: body.duration || '',
        difficulty: body.difficulty || 'principiante',
        estimatedDailyTime: body.estimatedDailyTime || '',
        days: body.days || [],
        benefits: body.benefits || [''],
        requirements: body.requirements || [''],
        sources: content.sources || [''],
      });
    }
  }, [content, reset]);

  const {
    fields: sourceFields,
    append: appendSource,
    remove: removeSource
  } = useFieldArray({ control, name: 'sources' as any });

  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit
  } = useFieldArray({ control, name: 'benefits' as any });

  const {
    fields: requirementFields,
    append: appendRequirement,
    remove: removeRequirement
  } = useFieldArray({ control, name: 'requirements' as any });

  const {
    fields: dayFields,
    append: appendDay,
    remove: removeDay
  } = useFieldArray({ control, name: 'days' });

  const {
    fields: objectiveFields,
    append: appendObjective,
    remove: removeObjective
  } = useFieldArray({ control, name: `days.${activeDayIndex}.objectives` as any });

  // Mutation para actualizar
  const updateMutation = useMutation({
    mutationFn: (data: UpdateContentPayload) => contentService.updateContent(id, data),
    onSuccess: () => {
      alert('Ruta actualizada exitosamente');
      router.push('/dashboard/routes');
    },
    onError: (error: any) => {
      alert(`Error al actualizar: ${error.response?.data?.message || error.message}`);
    }
  });

  const onSubmit = (data: RouteFormValues) => {
    console.log('Actualizando ruta...', data);

    // Construir payload solo con campos modificados
    const payload: UpdateContentPayload = {};

    // Siempre incluir estos si tienen valor
    if (data.title) payload.title = data.title;
    if (data.description?.trim()) payload.description = data.description;
    if (data.topic) payload.topic = data.topic;
    if (data.locale) payload.locale = data.locale;
    if (data.isPremium !== undefined) payload.isPremium = data.isPremium;
    if (data.isPublished !== undefined) payload.isPublished = data.isPublished;
    if (data.version) payload.version = data.version;
    if (data.disclaimerId?.trim()) payload.disclaimerId = data.disclaimerId;

    // Body
    payload.body = {
      intro: data.intro,
      duration: data.duration || '',
      difficulty: data.difficulty || 'principiante',
      estimatedDailyTime: data.estimatedDailyTime || '',
      days: data.days.map(day => ({
        day: day.day,
        title: day.title,
        description: day.description,
        exerciseId: day.exerciseId || '',
        estimatedTime: day.estimatedTime,
        objectives: day.objectives?.filter(obj => obj.trim() !== '') || []
      })) as any,
      benefits: data.benefits?.filter(b => b.trim() !== '') || [],
      requirements: data.requirements?.filter(r => r.trim() !== '') || []
    } as any;

    // Sources
    if (data.sources && data.sources.length > 0) {
      const filteredSources = data.sources.filter(s => s.trim() !== '');
      if (filteredSources.length > 0) payload.sources = filteredSources;
    }

    console.log('Payload a enviar:', JSON.stringify(payload, null, 2));
    updateMutation.mutate(payload);
  };

  const handleSaveClick = () => {
    console.log('Botón clickeado!');
    console.log('Errores:', errors);
    handleSubmit(onSubmit)();
  };

  if (isLoadingContent) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!content || content.type !== 'route') {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Contenido no encontrado o no es una ruta</p>
        <Link href="/dashboard/routes" className="text-blue-600 hover:underline">
          Volver a rutas
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[calc(100vh-8rem)]">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 px-1">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/routes" className="text-gray-500 hover:text-gray-800">
            <ArrowLeft />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Editar Ruta</h1>
            <p className="text-xs text-gray-500">ID: {id}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={updateMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2 hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto justify-center"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save size={18} />
              Guardar Cambios
            </>
          )}
        </button>
      </div>

      {/* FORMULARIO - Igual que en new/page.tsx */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-1 min-h-0">
        {/* COL 1: METADATA */}
        <div className="lg:col-span-4 bg-white p-4 lg:p-6 rounded-xl border border-gray-200 shadow-sm overflow-y-auto max-h-[60vh] lg:max-h-full scrollbar-thin">
          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 sticky top-0 bg-white z-10 -mx-4 lg:-mx-6 px-4 lg:px-6">
            Información General
          </h3>
          <form className="space-y-4">
            {/* Título */}
            <div>
              <label className="text-sm font-medium text-gray-700">Título *</label>
              <input
                {...register('title')}
                className="w-full p-2 border rounded mt-1 text-sm text-black"
              />
              {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
            </div>

            {/* Descripción */}
            <div>
              <label className="text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                {...register('description')}
                className="w-full p-2 border rounded mt-1 text-sm h-20 text-black"
              />
            </div>

            {/* Tema */}
            <div>
              <label className="text-sm font-medium text-gray-700">Tema</label>
              <select {...register('topic')} className="w-full p-2 border rounded mt-1 text-sm text-black">
                <option value="">Seleccionar...</option>
                <option value="ansiedad">Ansiedad</option>
                <option value="autoestima">Autoestima</option>
                <option value="sueño">Sueño</option>
                <option value="estres">Estrés</option>
              </select>
            </div>

            {/* Locale y Versión */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Idioma</label>
                <select {...register('locale')} className="w-full p-2 border rounded mt-1 text-sm text-black">
                  <option value="es-LATAM">Español (LATAM)</option>
                  <option value="pt-BR">Portugués (BR)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Versión</label>
                <input
                  type="number"
                  {...register('version', { valueAsNumber: true })}
                  className="w-full p-2 border rounded mt-1 text-sm text-black"
                  min="1"
                />
              </div>
            </div>

            {/* Premium y Published */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('isPremium')} className="rounded" />
                <span className="text-sm text-gray-700">Contenido Premium</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('isPublished')} className="rounded" />
                <span className="text-sm text-gray-700">Publicado</span>
              </label>
            </div>

            {/* Disclaimer */}
            <div>
              <label className="text-sm font-medium text-gray-700">ID de Disclaimer</label>
              <input
                {...register('disclaimerId')}
                className="w-full p-2 border rounded mt-1 text-sm text-black"
              />
            </div>

            {/* Introducción */}
            <div>
              <label className="text-sm font-medium text-gray-700">Introducción *</label>
              <textarea
                {...register('intro')}
                className="w-full p-2 border rounded mt-1 text-sm h-24 text-black"
              />
              {errors.intro && <span className="text-red-500 text-xs">{errors.intro.message}</span>}
            </div>

            {/* Duración */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Duración</label>
                <input
                  {...register('duration')}
                  className="w-full p-2 border rounded mt-1 text-sm text-black"
                  placeholder="7 días"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tiempo Diario</label>
                <input
                  {...register('estimatedDailyTime')}
                  className="w-full p-2 border rounded mt-1 text-sm text-black"
                  placeholder="15 minutos"
                />
              </div>
            </div>

            {/* Dificultad */}
            <div>
              <label className="text-sm font-medium text-gray-700">Dificultad</label>
              <select {...register('difficulty')} className="w-full p-2 border rounded mt-1 text-sm text-black">
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>

            {/* Beneficios */}
            <div>
              <label className="text-sm font-medium text-gray-700">Beneficios</label>
              <div className="space-y-2 mt-2">
                {benefitFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      {...register(`benefits.${index}`)}
                      className="flex-1 p-2 border rounded text-sm text-black"
                    />
                    {benefitFields.length > 1 && (
                      <button type="button" onClick={() => removeBenefit(index)} className="text-red-500">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => appendBenefit('' as any)} className="text-blue-600 text-sm flex items-center gap-1">
                  <Plus size={16} /> Agregar
                </button>
              </div>
            </div>

            {/* Requisitos */}
            <div>
              <label className="text-sm font-medium text-gray-700">Requisitos</label>
              <div className="space-y-2 mt-2">
                {requirementFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      {...register(`requirements.${index}`)}
                      className="flex-1 p-2 border rounded text-sm text-black"
                    />
                    {requirementFields.length > 1 && (
                      <button type="button" onClick={() => removeRequirement(index)} className="text-red-500">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => appendRequirement('' as any)} className="text-blue-600 text-sm flex items-center gap-1">
                  <Plus size={16} /> Agregar
                </button>
              </div>
            </div>

            {/* Fuentes */}
            <div>
              <label className="text-sm font-medium text-gray-700">Fuentes</label>
              <div className="space-y-2 mt-2">
                {sourceFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      {...register(`sources.${index}`)}
                      className="flex-1 p-2 border rounded text-sm text-black"
                    />
                    {sourceFields.length > 1 && (
                      <button type="button" onClick={() => removeSource(index)} className="text-red-500">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => appendSource('' as any)} className="text-blue-600 text-sm flex items-center gap-1">
                  <Plus size={16} /> Agregar
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* COL 2: DÍAS */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
          {/* Navegación */}
          <div className="bg-white p-2 rounded-lg border flex gap-2 overflow-x-auto scrollbar-thin">
            {dayFields.map((field, idx) => (
              <button
                key={field.id}
                type="button"
                onClick={() => setActiveDayIndex(idx)}
                className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                  idx === activeDayIndex ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Día {watch(`days.${idx}.day`)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => appendDay({ day: dayFields.length + 1, title: '', description: '', estimatedTime: '10 minutos', objectives: [''] })}
              className="px-2 py-1.5 text-blue-600 rounded flex-shrink-0"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Editor de Día */}
          <div className="flex-1 bg-gray-50 rounded-xl border p-4 lg:p-6 overflow-y-auto scrollbar-thin max-h-[70vh] lg:max-h-full">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Día {watch(`days.${activeDayIndex}.day`)}</h3>
              {dayFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    removeDay(activeDayIndex);
                    if (activeDayIndex > 0) setActiveDayIndex(activeDayIndex - 1);
                  }}
                  className="text-red-500 text-sm flex items-center gap-1"
                >
                  <Trash2 size={16} /> Eliminar
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Número de Día *</label>
                <input
                  type="number"
                  {...register(`days.${activeDayIndex}.day`, { valueAsNumber: true })}
                  className="w-full sm:w-24 p-2 border rounded mt-1 text-sm text-black"
                  min="1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Título *</label>
                <input
                  {...register(`days.${activeDayIndex}.title`)}
                  className="w-full p-2 border rounded mt-1 text-sm text-black"
                />
                {errors.days?.[activeDayIndex]?.title && (
                  <span className="text-red-500 text-xs">{errors.days[activeDayIndex]?.title?.message}</span>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Descripción *</label>
                <textarea
                  {...register(`days.${activeDayIndex}.description`)}
                  className="w-full p-2 border rounded mt-1 text-sm h-20 text-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">ID Ejercicio (UUID)</label>
                  <input
                    {...register(`days.${activeDayIndex}.exerciseId`)}
                    className="w-full p-2 border rounded mt-1 text-sm text-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tiempo *</label>
                  <input
                    {...register(`days.${activeDayIndex}.estimatedTime`)}
                    className="w-full p-2 border rounded mt-1 text-sm text-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Objetivos</label>
                <div className="space-y-2 mt-2">
                  {objectiveFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        {...register(`days.${activeDayIndex}.objectives.${index}`)}
                        className="flex-1 p-2 border rounded text-sm text-black"
                      />
                      {objectiveFields.length > 1 && (
                        <button type="button" onClick={() => removeObjective(index)} className="text-red-500">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => appendObjective('' as any)} className="text-blue-600 text-sm flex items-center gap-1">
                    <Plus size={16} /> Agregar objetivo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
