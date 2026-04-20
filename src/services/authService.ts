import type { User } from '../types';

const INITIAL_MOCK_USERS = [
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

const getMockUsers = () => {
  const stored = localStorage.getItem('mock_users');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('mock_users', JSON.stringify(INITIAL_MOCK_USERS));
  return INITIAL_MOCK_USERS;
};

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const users = getMockUsers();
    const user = users.find(
      (u: any) => u.email === email && u.password === password
    );
    
    if (user) {
      return {
        email: user.email,
        name: user.name,
      };
    }
    
    throw new Error('Credenciales inválidas');
  },

  register: async (email: string, password: string, name: string): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const users = getMockUsers();
    
    if (users.some((u: any) => u.email === email)) {
      throw new Error('El correo electrónico ya está registrado');
    }
    
    const newUser = { email, password, name };
    users.push(newUser);
    localStorage.setItem('mock_users', JSON.stringify(users));
    
    return {
      email: newUser.email,
      name: newUser.name,
    };
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