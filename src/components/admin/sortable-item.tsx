import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as 'relative',
    touchAction: 'none', // Importante para evitar scroll en móviles al arrastrar
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative mb-3 flex items-stretch gap-2">
      {/* CAMBIO: El Handle (agarradera) ahora es un bloque visible a la izquierda
        de la tarjeta, no flotando en el vacío.
      */}
      <div 
        {...attributes} 
        {...listeners} 
        className="flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-300 hover:text-blue-500 hover:bg-gray-100 rounded px-1 transition-colors"
        title="Arrastrar para reordenar"
      >
        <GripVertical size={20} />
      </div>
      
      {/* El contenido de la tarjeta (los inputs) */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}