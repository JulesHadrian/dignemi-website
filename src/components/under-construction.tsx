import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface UnderConstructionProps {
  title: string;
  description?: string;
}

export function UnderConstruction({ title, description }: UnderConstructionProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 rounded-full"></div>
        <Construction className="text-yellow-500 relative" size={80} strokeWidth={1.5} />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        {title}
      </h1>

      <p className="text-gray-600 mb-2 max-w-md">
        {description || 'Esta sección está en desarrollo y estará disponible pronto.'}
      </p>

      <p className="text-sm text-gray-500 mb-8">
        Estamos trabajando para traerte nuevas funcionalidades.
      </p>

      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        <ArrowLeft size={18} />
        Volver al Dashboard
      </Link>
    </div>
  );
}
