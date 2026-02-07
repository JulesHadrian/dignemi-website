'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { authService } from '@/services/auth-service';

// Esquema de validación
const loginSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      await authService.requestMagicLink(data.email);
      setIsSent(true);
    } catch (err) {
      setError('Error al conectar con el servidor. Revisa la consola.');
      console.error(err);
    }
  };

  if (isSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">¡Enlace enviado!</h2>
          <p className="text-gray-600 mb-6">
            Revisa tu correo (o la consola del servidor) y haz clic en el enlace mágico para entrar.
          </p>
          <button 
            onClick={() => setIsSent(false)}
            className="text-blue-600 hover:underline text-sm"
          >
            Intentar con otro correo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Dignemi Admin</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              {...register('email')}
              type="email"
              placeholder="admin@dignemi.com"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {error && <div className="p-2 bg-red-50 text-red-600 text-sm rounded">{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Magic Link'}
          </button>
        </form>
      </div>
    </div>
  );
}