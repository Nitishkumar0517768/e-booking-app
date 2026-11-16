import { api } from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  studentId?: string;
  department?: string;
  phone?: string;
  role: 'student' | 'admin';
  isActive: boolean;
}

export const authService = {
  async login(credentials: { email: string; password: string }) {
    return (await api.post('/auth/login', credentials)) as {
      success: boolean;
      data: { user: User; token: string };
    };
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    studentId: string;
    department: string;
    phone?: string;
  }) {
    return (await api.post('/auth/register', data)) as {
      success: boolean;
      data: { user: User; token: string };
    };
  },

  async getMe() {
    return (await api.get('/auth/me')) as {
      success: boolean;
      data: { user: User };
    };
  },

  async updateProfile(data: { name?: string; department?: string; phone?: string }) {
    return (await api.patch('/auth/profile', data)) as {
      success: boolean;
      data: { user: User };
    };
  },
};

