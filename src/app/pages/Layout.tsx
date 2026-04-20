import { Outlet, NavLink, useNavigate, Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Flame, LayoutDashboard, Map, Settings, LogOut } from 'lucide-react';

export default function Layout() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/map', icon: Map, label: 'Ver Mapa' },
    { to: '/settings', icon: Settings, label: 'Configuraciones' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg mr-3">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl">Sistema Incendios</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex items-center px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'border-b-2 border-orange-500 text-gray-900'
                          : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
