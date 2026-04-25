import api from './api';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface Store {
  id: string;
  store_name: string;
  address: string;
  city: string;
  main_phone: string;
  owner_phone?: string;
  whatsapp?: string;
  email?: string;
  opening_hours?: string;
  google_maps_link?: string;
  instructions?: string;
  status: boolean;
  _count?: { keys: number };
}

export interface CreateStorePayload {
  store_name: string;
  address: string;
  city: string;
  main_phone: string;
  owner_phone?: string;
  whatsapp?: string;
  email?: string;
  opening_hours?: string;
  google_maps_link?: string;
  instructions?: string;
}

// ─── STORE SERVICE ────────────────────────────────────────────────────────────

export const storeService = {
  async getAll(token: string): Promise<Store[]> {
    const { data } = await api.get<Store[]>('/stores', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  async getOne(id: string, token: string): Promise<Store> {
    const { data } = await api.get<Store>(`/stores/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  async create(payload: CreateStorePayload, token: string): Promise<Store> {
    const { data } = await api.post<Store>('/stores', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  async update(id: string, payload: Partial<CreateStorePayload>, token: string): Promise<Store> {
    const { data } = await api.patch<Store>(`/stores/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};
