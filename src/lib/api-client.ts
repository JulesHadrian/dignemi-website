import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Interceptor de Petición: Inyectar el Token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Debug: Descomenta esto si quieres ver si se envía el token
        // console.log('Enviando token:', token.substring(0, 10) + '...');
      } else {
        console.warn('No hay token en localStorage');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor de Respuesta: Manejar el 401 (Token inválido/expirado)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si la API devuelve 401 Unauthorized
    if (error.response?.status === 401) {
      console.error('Sesión expirada o inválida (401). Redirigiendo al login...');
      
      if (typeof window !== 'undefined') {
        // Borramos el token basura
        localStorage.removeItem('auth_token');
        localStorage.removeItem('dignemi-auth-storage');
        
        // Forzamos la redirección al login
        // Usamos window.location para asegurar un refresh completo
        if (!window.location.pathname.includes('/login')) {
           window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);