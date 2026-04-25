import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, LoginPayload, RegisterPayload, AuthResponse } from '../services/auth.service';

type Role = 'OWNER' | 'STORE' | 'ADMIN';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        if (AsyncStorage) {
          const savedToken = await AsyncStorage.getItem('token').catch(() => null);
          const savedUser = await AsyncStorage.getItem('user').catch(() => null);
          
          if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authService.login(payload);
      
      // Save state
      setToken(response.access_token);
      setUser(response.user);
      
      // Persist data
      if (AsyncStorage) {
        await AsyncStorage.setItem('token', response.access_token).catch(e => console.warn('AsyncStorage error', e));
        await AsyncStorage.setItem('user', JSON.stringify(response.user)).catch(e => console.warn('AsyncStorage error', e));
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      await authService.register(payload);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      
      // Verificación de seguridad para evitar el crash del módulo nativo
      if (AsyncStorage) {
        await AsyncStorage.removeItem('token').catch(e => console.warn('AsyncStorage: error removing token', e));
        await AsyncStorage.removeItem('user').catch(e => console.warn('AsyncStorage: error removing user', e));
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
