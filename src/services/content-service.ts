import { apiClient } from '@/lib/api-client';
import { RouteListItem, CreateContentPayload, ContentDetail, UpdateContentPayload } from '@/types/content';

export const contentService = {
  // Obtener el catálogo de rutas
  getRoutes: async (): Promise<RouteListItem[]> => {
    const response = await apiClient.get('/content/catalog');
    return response.data;
  },

  // Obtener detalle de un contenido por ID
  getContentById: async (id: string): Promise<ContentDetail> => {
    const response = await apiClient.get(`/content/routes/${id}`);
    return response.data;
  },

  // Crear nuevo contenido (ruta, ejercicio o artículo)
  createContent: async (data: CreateContentPayload) => {
    const response = await apiClient.post('/content', data);
    return response.data;
  },

  // Actualizar contenido existente (todos los campos opcionales)
  updateContent: async (id: string, data: UpdateContentPayload) => {
    const response = await apiClient.patch(`/content/${id}`, data);
    return response.data;
  }
};