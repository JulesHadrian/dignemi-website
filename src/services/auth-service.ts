import { apiClient } from '@/lib/api-client';

export const authService = {
  // Pide el Magic Link a tu API
  requestMagicLink: async (email: string) => {
    // Como apiClient ya tiene la baseURL '.../v1', aquí solo ponemos la ruta relativa
    return await apiClient.post('/auth/login', { email });
  },

  // (Opcional) Obtener datos del usuario actual
  getMe: async () => {
    return await apiClient.get('/auth/me');
  }
};