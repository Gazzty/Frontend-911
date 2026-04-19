import type { User } from '../types';

// Credenciales mock
const MOCK_USERS = [
  {
    email: 'admin@incendios.com',
    password: 'admin123',
    name: 'Administrador',
  },
  {
    email: 'usuario@incendios.com',
    password: 'usuario123',
    name: 'Usuario Sistema',
  },
];

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Buscar usuario en el mock
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    
    if (user) {
      return {
        email: user.email,
        name: user.name,
      };
    }
    
    throw new Error('Credenciales inválidas');
  },

  logout: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  saveUser: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },
};