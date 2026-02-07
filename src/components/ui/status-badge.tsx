import { ContentStatus } from '@/types/content';

const statusStyles: Record<ContentStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  published: 'bg-green-100 text-green-800 border-green-200',
  archived: 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusLabels: Record<ContentStatus, string> = {
  draft: 'Borrador',
  review: 'En Revisión',
  published: 'Publicado',
  archived: 'Archivado',
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.draft}`}>
      {statusLabels[status] || status}
    </span>
  );
}