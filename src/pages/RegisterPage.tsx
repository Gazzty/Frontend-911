import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createToaster } from '@chakra-ui/react';
import { authService } from '../services/authService';
import AuthForm, { AuthFormData } from '../components/auth/AuthForm';

const toaster = createToaster({
  placement: 'top',
  duration: 3000,
});

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await authService.register(data.email, data.password, data.name || '');
      // Auto-login after registration
      authService.saveUser(user);
      
      toaster.create({
        title: 'Registro exitoso',
        description: 'Tu cuenta ha sido creada correctamente',
        type: 'success',
        duration: 2000,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Error al registrar el usuario');
      toaster.create({
        title: 'Error',
        description: err.message || 'Error al registrar el usuario',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      type="register"
      onSubmit={handleRegister}
      isLoading={isLoading}
      error={error}
      onNavigate={() => navigate('/login')}
    />
  );
};

export default RegisterPage;
