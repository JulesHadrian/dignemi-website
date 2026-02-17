'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  BookOpen,
  Music,
  FileText,
  PenLine,
  Wind,
  Video,
  Loader2
} from 'lucide-react';

import { contentService } from '@/services/content-service';
import { CreateRoutePayload, StepType } from '@/types/content';

// === SCHEMAS ===
const stepContentSchema = z.object({
  instruction: z.string().optional(),
  extra_prompt: z.string().optional(),
  media_url: z.string().url().optional().or(z.literal('')),
  article: z.string().optional(),
  task: z.string().optional(),
});

const stepSchema = z.object({
  day: z.number().min(1),
  title: z.string().min(3, 'Título requerido'),
  type: z.enum([
    'reflection_exercise',
    'audio_meditation',
    'article_and_task',
    'journaling',
    'breathing_exercise',
    'video_lesson'
  ]),
  content: stepContentSchema,
});

const routeFormSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  topic: z.string().min(1, 'Selecciona un tema'),
  intro: z.string().min(10, 'La introducción debe tener al menos 10 caracteres'),
  version: z.string().default('1.0'),
  sources: z.array(z.string().min(1, 'Fuente no puede estar vacía')).min(1, 'Agrega al menos una fuente'),
  steps: z.array(stepSchema).min(1, 'Agrega al menos un paso'),
});

type RouteFormValues = z.infer<typeof routeFormSchema>;

// === COMPONENT ===
export default function NewRoutePage() {
  const router = useRouter();
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      version: '1.0',
      sources: [''],
      steps: [
        {
          day: 1,
          title: '',
          type: 'reflection_exercise',
          content: {}
        }
      ]
    }
  });

  const {
    fields: sourceFields,
    append: appendSource,
    remove: removeSource
  } = useFieldArray({ control, name: 'sources' });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep
  } = useFieldArray({ control, name: 'steps' });

  // Mutation para crear ruta
  const createMutation = useMutation({
    mutationFn: contentService.createRoute,
    onSuccess: () => {
      router.push('/dashboard/routes');
    },
    onError: (error: any) => {
      alert(`Error al crear la ruta: ${error.response?.data?.message || error.message}`);
    }
  });

  const onSubmit = (data: RouteFormValues) => {
    const payload: CreateRoutePayload = {
      type: 'route',
      title: data.title,
      topic: data.topic,
      sources: data.sources.filter(s => s.trim() !== ''),
      body: {
        version: data.version,
        intro: data.intro,
        steps: data.steps
      }
    };

    console.log('Payload a enviar:', JSON.stringify(payload, null, 2));
    createMutation.mutate(payload);
  };

  const currentStepType = watch(`steps.${activeStepIndex}.type`);

  return (
    <div className="flex flex-col max-h-[calc(100vh-8rem)]">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 px-1">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/routes" className="text-gray-500 hover:text-gray-800">
            <ArrowLeft />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Nueva Ruta</h1>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={createMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save size={18} />
              Guardar Ruta
            </>
          )}
        </button>
      </div>

      {/* LAYOUT 2 COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-1 min-h-0">
        {/* COL 1: METADATA */}
        <div className="lg:col-span-4 bg-white p-4 lg:p-6 rounded-xl border border-gray-200 shadow-sm overflow-y-auto max-h-[60vh] lg:max-h-full scrollbar-thin">
          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 sticky top-0 bg-white z-10 -mx-4 lg:-mx-6 px-4 lg:px-6">Información General</h3>
          <form className="space-y-4">
            {/* Título */}
            <div>
              <label className="text-sm font-medium text-gray-700">Título de la Ruta *</label>
              <input
                {...register('title')}
                className="w-full p-2 border rounded mt-1 text-sm text-black"
                placeholder="Ej: Camino hacia la Confianza"
              />
              {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
            </div>

            {/* Tema */}
            <div>
              <label className="text-sm font-medium text-gray-700">Tema Principal *</label>
              <select {...register('topic')} className="w-full p-2 border rounded mt-1 text-sm text-black">
                <option value="">Seleccionar...</option>
                <option value="ansiedad">Ansiedad</option>
                <option value="autoestima">Autoestima</option>
                <option value="sueno">Sueño</option>
                <option value="estres">Estrés</option>
                <option value="relaciones">Relaciones</option>
              </select>
              {errors.topic && <span className="text-red-500 text-xs">{errors.topic.message}</span>}
            </div>

            {/* Versión */}
            <div>
              <label className="text-sm font-medium text-gray-700">Versión</label>
              <input
                {...register('version')}
                className="w-full p-2 border rounded mt-1 text-sm text-black"
                placeholder="1.0"
              />
            </div>

            {/* Introducción */}
            <div>
              <label className="text-sm font-medium text-gray-700">Introducción *</label>
              <textarea
                {...register('intro')}
                className="w-full p-2 border rounded mt-1 text-sm h-32 text-black"
                placeholder="Describe el propósito y objetivo de esta ruta..."
              />
              {errors.intro && <span className="text-red-500 text-xs">{errors.intro.message}</span>}
            </div>

            {/* Fuentes */}
            <div>
              <label className="text-sm font-medium text-gray-700">Fuentes y Referencias *</label>
              <div className="space-y-2 mt-2">
                {sourceFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      {...register(`sources.${index}`)}
                      className="flex-1 p-2 border rounded text-sm text-black"
                      placeholder="URL o referencia bibliográfica"
                    />
                    {sourceFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSource(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => appendSource('')}
                  className="text-blue-600 text-sm hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus size={16} /> Agregar fuente
                </button>
              </div>
              {errors.sources && <span className="text-red-500 text-xs">{errors.sources.message}</span>}
            </div>
          </form>
        </div>

        {/* COL 2: STEPS BUILDER */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
          {/* Navegación de Steps */}
          <div className="bg-white p-2 rounded-lg border border-gray-200 flex gap-2 overflow-x-auto scrollbar-thin">
            {stepFields.map((field, idx) => (
              <button
                key={field.id}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                  idx === activeStepIndex
                    ? 'bg-slate-800 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Día {watch(`steps.${idx}.day`)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => appendStep({
                day: stepFields.length + 1,
                title: '',
                type: 'reflection_exercise',
                content: {}
              })}
              className="px-2 py-1.5 text-blue-600 hover:bg-blue-50 rounded flex-shrink-0"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Editor del Step Activo */}
          <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 p-4 lg:p-6 overflow-y-auto min-h-0 max-h-[70vh] lg:max-h-full scrollbar-thin">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="text-lg font-bold text-gray-800">
                Día {watch(`steps.${activeStepIndex}.day`)}
              </h3>
              {stepFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    removeStep(activeStepIndex);
                    if (activeStepIndex > 0) setActiveStepIndex(activeStepIndex - 1);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 self-end sm:self-auto"
                >
                  <Trash2 size={16} /> Eliminar día
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Número de día */}
              <div>
                <label className="text-sm font-medium text-gray-700">Número de Día</label>
                <input
                  type="number"
                  {...register(`steps.${activeStepIndex}.day`, { valueAsNumber: true })}
                  className="w-full sm:w-24 p-2 border rounded mt-1 text-sm text-black"
                  min="1"
                />
              </div>

              {/* Título */}
              <div>
                <label className="text-sm font-medium text-gray-700">Título del Paso *</label>
                <input
                  {...register(`steps.${activeStepIndex}.title`)}
                  className="w-full p-2 border rounded mt-1 text-sm text-black"
                  placeholder="Ej: Reconociendo tus Fortalezas"
                />
                {errors.steps?.[activeStepIndex]?.title && (
                  <span className="text-red-500 text-xs">
                    {errors.steps[activeStepIndex]?.title?.message}
                  </span>
                )}
              </div>

              {/* Tipo */}
              <div>
                <label className="text-sm font-medium text-gray-700">Tipo de Actividad *</label>
                <select
                  {...register(`steps.${activeStepIndex}.type`)}
                  className="w-full p-2 border rounded mt-1 text-sm text-black"
                >
                  <option value="reflection_exercise">Ejercicio de Reflexión</option>
                  <option value="audio_meditation">Meditación de Audio</option>
                  <option value="article_and_task">Artículo + Tarea</option>
                  <option value="journaling">Diario Personal</option>
                  <option value="breathing_exercise">Ejercicio de Respiración</option>
                  <option value="video_lesson">Lección en Video</option>
                </select>
              </div>

              {/* Contenido dinámico según tipo */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  {getStepIcon(currentStepType)}
                  Contenido del Paso
                </h4>

                {/* Campos comunes */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Instrucción Principal</label>
                    <textarea
                      {...register(`steps.${activeStepIndex}.content.instruction`)}
                      className="w-full p-2 border rounded mt-1 text-sm h-24 text-black"
                      placeholder="Instrucciones claras para el usuario..."
                    />
                  </div>

                  {/* Campos específicos por tipo */}
                  {(currentStepType === 'reflection_exercise' || currentStepType === 'journaling') && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Pregunta Adicional</label>
                      <input
                        {...register(`steps.${activeStepIndex}.content.extra_prompt`)}
                        className="w-full p-2 border rounded mt-1 text-sm text-black"
                        placeholder="¿Qué te han dicho amigos o familiares que admiran de ti?"
                      />
                    </div>
                  )}

                  {(currentStepType === 'audio_meditation' || currentStepType === 'video_lesson') && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">URL del Media</label>
                      <input
                        {...register(`steps.${activeStepIndex}.content.media_url`)}
                        className="w-full p-2 border rounded mt-1 text-sm text-black"
                        placeholder="https://example.com/audio.mp3"
                      />
                    </div>
                  )}

                  {currentStepType === 'article_and_task' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Artículo</label>
                        <textarea
                          {...register(`steps.${activeStepIndex}.content.article`)}
                          className="w-full p-2 border rounded mt-1 text-sm h-32 text-black"
                          placeholder="Contenido del artículo educativo..."
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Tarea</label>
                        <textarea
                          {...register(`steps.${activeStepIndex}.content.task`)}
                          className="w-full p-2 border rounded mt-1 text-sm h-20 text-black"
                          placeholder="Tarea práctica relacionada..."
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper para iconos
function getStepIcon(type: StepType) {
  switch (type) {
    case 'reflection_exercise':
      return <PenLine size={18} className="text-purple-500" />;
    case 'audio_meditation':
      return <Music size={18} className="text-blue-500" />;
    case 'article_and_task':
      return <FileText size={18} className="text-green-500" />;
    case 'journaling':
      return <BookOpen size={18} className="text-orange-500" />;
    case 'breathing_exercise':
      return <Wind size={18} className="text-cyan-500" />;
    case 'video_lesson':
      return <Video size={18} className="text-red-500" />;
    default:
      return <BookOpen size={18} />;
  }
}
