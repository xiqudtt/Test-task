import React, { createContext, useContext, useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: 'https://reqres.in/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': 'reqres-free-v1'
  },
});

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string }>;
      console.error('Ошибка запроса:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        headers: axiosError.response?.headers
      });

      if (axiosError.response?.status === 400) {
        throw new Error('Пожалуйста, проверьте правильность введенных данных');
      } else if (axiosError.response?.status === 401) {
        throw new Error('Для тестового входа используйте:\nEmail: eve.holt@reqres.in\nPassword: cityslicka');
      } else if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
    }
    throw new Error('Произошла ошибка при подключении к серверу');
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Отправка запроса входа:', { email, password });
      
      const response = await api.post('/login', {
        email: email.trim(),
        password: password.trim()
      });

      console.log('Ответ сервера:', response.data);

      if (!response.data?.token) {
        throw new Error('Токен не получен от сервера');
      }

      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Ошибка при входе:', error);
      handleAuthError(error);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      console.log('Отправка запроса регистрации:', { email, password });
      
      const response = await api.post('/register', {
        email: email.trim(),
        password: password.trim()
      });

      console.log('Ответ сервера:', response.data);

      if (!response.data?.token) {
        throw new Error('Токен не получен от сервера');
      }

      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      handleAuthError(error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 