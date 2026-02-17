import { apiClient } from '@/lib/api-client';
import { RouteListItem, CreateRoutePayload } from '@/types/content';

export const contentService = {
  // Obtener el catálogo de rutas
  getRoutes: async (): Promise<RouteListItem[]> => {
    const response = await apiClient.get('/content/catalog');
    return response.data;
  },

  // Crear nueva ruta
  createRoute: async (data: CreateRoutePayload) => {
    const response = await apiClient.post('/content', data);
    return response.data;
  }
};