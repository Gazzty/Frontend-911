import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from './theme/themes';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashBoard';
import MapaPage from './pages/MapaPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import { authService } from './services/authService';
import { SensorDataProvider } from './context/SensorDataContext';
import { Toaster } from './lib/toaster';
import GlobalFireAlert from './components/GlobalFireAlert';

const AUTH_ROUTES = ['/login', '/register'];

const RouteAwareToaster = () => {
  const { pathname } = useLocation();
  if (AUTH_ROUTES.includes(pathname)) return null;
  return <Toaster />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ChakraProvider value={system}>
      <BrowserRouter>
        <SensorDataProvider>
          <GlobalFireAlert />
          <RouteAwareToaster />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mapa"
              element={
                <ProtectedRoute>
                  <MapaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion"
              element={
                <ProtectedRoute>
                  <ConfiguracionPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </SensorDataProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;