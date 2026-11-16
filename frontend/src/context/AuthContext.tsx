import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, authService } from '../services/authService';
import { Storage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    studentId: string;
    department: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      setIsLoading(true);
      const storedToken = await Storage.getItem('auth_token');
      const storedUser = await Storage.getItem('auth_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify with backend silently
        authService
          .getMe()
          .then((res) => {
            if (res.data?.user) {
              setUser(res.data.user);
              Storage.setItem('auth_user', JSON.stringify(res.data.user));
            }
          })
          .catch(() => {
            // Token expired or invalid
            logout();
          });
      }
    } catch (e) {
      console.warn('[AuthContext] Load session error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const { user: loggedInUser, token: authToken } = response.data;

      setUser(loggedInUser);
      setToken(authToken);

      await Storage.setItem('auth_token', authToken);
      await Storage.setItem('auth_user', JSON.stringify(loggedInUser));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    studentId: string;
    department: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      const { user: registeredUser, token: authToken } = response.data;

      setUser(registeredUser);
      setToken(authToken);

      await Storage.setItem('auth_token', authToken);
      await Storage.setItem('auth_user', JSON.stringify(registeredUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await Storage.removeItem('auth_token');
    await Storage.removeItem('auth_user');
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getMe();
      if (response.data?.user) {
        setUser(response.data.user);
        await Storage.setItem('auth_user', JSON.stringify(response.data.user));
      }
    } catch (e) {
      console.warn('[AuthContext] Refresh user error:', e);
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

