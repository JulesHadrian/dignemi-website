import { apiClient } from '@/lib/api-client';
import { Route } from '@/types/content'; // Asegúrate de tener tus tipos definidos

export const contentService = {
  // Obtener el catálogo de rutas
  getRoutes: async (): Promise<Route[]> => {
    // Según tu imagen, el endpoint es /content/catalog
    // Como apiClient ya tiene la base URL /v1, solo ponemos el resto
    const response = await apiClient.get('/content/catalog');
    
    // NOTA: Aquí asumo que la API devuelve el array directamente en response.data
    // Si tu API devuelve { data: [...] }, cambia esto a: return response.data.data;
    return response.data;
  },

  // Dejo preparado el de crear para el siguiente módulo
  createRoute: async (data: any) => {
    return await apiClient.post('/content', data);
  }
};