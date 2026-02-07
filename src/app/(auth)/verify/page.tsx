'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { jwtDecode } from 'jwt-decode'; // Necesitarás instalar esto: npm install jwt-decode

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [manualToken, setManualToken] = useState('');

  // Caso 1: El token viene en la URL (si configuras redirect en API)
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      handleLogin(tokenFromUrl);
    }
  }, [searchParams]);

  const handleLogin = (token: string) => {
    try {
      // Decodificamos el JWT para sacar info básica (si tu token tiene esa info)
      // Si el token es opaco, necesitaríamos llamar a /auth/me
      const decoded: any = jwtDecode(token);
      
      // Construimos el usuario base (ajusta según los claims de tu JWT)
      const user = {
        id: decoded.sub || 'unknown',
        email: decoded.email || '',
        role: decoded.role || 'EDITOR', // Default temporal si no viene en el token
      };

      login(token, user);
      router.push('/dashboard'); // Redirigir al dashboard
    } catch (error) {
      alert('Token inválido');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 flex-col gap-4">
      <h2 className="text-xl font-bold">Verificando Acceso...</h2>
      
      {/* Opción Manual para Dev */}
      <div className="p-4 bg-white shadow rounded w-96">
        <p className="text-sm text-gray-600 mb-2">¿Estás en modo manual? Pega el token aquí:</p>
        <textarea 
          value={manualToken}
          onChange={(e) => setManualToken(e.target.value)}
          className="w-full border p-2 text-xs h-24 text-black"
          placeholder="eyJhbGciOiJIUzI1..."
        />
        <button 
          onClick={() => handleLogin(manualToken)}
          className="w-full mt-2 bg-green-600 text-white py-1 rounded"
        >
          Entrar Manualmente
        </button>
      </div>
    </div>
  );
}