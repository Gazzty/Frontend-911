import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { SensorProvider } from './context/SensorContext';
import { Toaster } from './components/ui/sonner';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <SensorProvider>
        <RouterProvider router={router} />
        <Toaster />
      </SensorProvider>
    </AuthProvider>
  );
}