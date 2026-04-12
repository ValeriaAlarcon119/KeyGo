import api from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role?: 'OWNER' | 'STORE' | 'ADMIN';
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: 'OWNER' | 'STORE' | 'ADMIN';
  };
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<Omit<AuthResponse['user'], never>> {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },
};
