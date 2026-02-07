'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Map, 
  Zap, 
  Library, 
  ShieldAlert, 
  LifeBuoy, 
  Tags, 
  History, 
  Eye, 
  Settings,
  LogOut, 
  Menu
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Protección de ruta: Si no está autenticado, al login
  useEffect(() => {
    const checkAuth = setTimeout(() => {
      if (!isAuthenticated) {
        router.push('/login'); // Ojo: asegura que esta ruta sea correcta (/auth/login o /login)
      }
    }, 100);
    return () => clearTimeout(checkAuth);
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Rutas', href: '/dashboard/routes', icon: Map },
    { name: 'Actividades', href: '/dashboard/activities', icon: Zap },
    { name: 'Biblioteca', href: '/dashboard/library', icon: Library },
    { name: 'Disclaimers', href: '/dashboard/disclaimers', icon: ShieldAlert },
    { name: 'Ayuda Ahora', href: '/dashboard/help', icon: LifeBuoy },
    { name: 'Temas y Tags', href: '/dashboard/topics', icon: Tags },
    { name: 'Publicaciones', href: '/dashboard/releases', icon: History },
    { name: 'Auditoría', href: '/dashboard/audit', icon: Eye },
    { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside 
        className={`bg-slate-900 text-white transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col fixed h-full z-10`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          {isSidebarOpen && <span className="font-bold text-xl tracking-wider">DIGNEMI</span>}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-800 rounded">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {isSidebarOpen && <span className="text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={() => { logout(); router.push('/login'); }}
            className="flex items-center gap-3 w-full p-2 text-red-400 hover:bg-slate-800 rounded transition"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {menuItems.find(i => pathname.startsWith(i.href))?.name || 'Panel'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-500 uppercase">{user?.role || 'Admin'}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}