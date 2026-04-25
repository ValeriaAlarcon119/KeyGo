import api from './api';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type KeyStatus = 'WAITING_DEPOSIT' | 'DEPOSITED' | 'IN_USE' | 'DELETED';
export type PlanType = 'MONTHLY' | 'PAY_PER_USE';

export interface Key {
  id: string;
  key_name: string;
  key_status: KeyStatus;
  plan_type: PlanType;
  key_photo_url?: string;
  created_at: string;
  owner?: { id: string; full_name: string; email: string };
  store?: {
    id: string;
    store_name: string;
    address: string;
    city: string;
    opening_hours?: string;
    whatsapp?: string;
    google_maps_link?: string;
    instructions?: string;
  };
  deposit_codes?: Array<{ id: string; code_value: string; status: string }>;
  key_tags?: Array<{ id: string; tag_uid: string; tag_type: string; status: string }>;
  pickup_codes?: Array<{
    id: string;
    code_value: string;
    code_mode: string;
    label_name?: string;
    active_from?: string;
    status: string;
    used_at?: string;
    cancelled_at?: string;
    created_at: string;
  }>;
  _count?: { key_movements: number };
}

export interface CreateKeyPayload {
  key_name: string;
  store_id: string;
  plan_type?: PlanType;
  key_photo_url?: string;
}

export interface CreateKeyResponse {
  key: Key;
  deposit_code: string;
  store: {
    id: string;
    store_name: string;
    address: string;
    city: string;
    opening_hours?: string;
    google_maps_link?: string;
    instructions?: string;
    whatsapp?: string;
    main_phone?: string;
  };
  message: string;
}

// ─── KEY SERVICE ──────────────────────────────────────────────────────────────

export const keyService = {
  async create(payload: CreateKeyPayload, token: string): Promise<CreateKeyResponse> {
    const { data } = await api.post<CreateKeyResponse>('/keys', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  async getAll(token: string): Promise<Key[]> {
    const { data } = await api.get<Key[]>('/keys', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  // Alias getById → getOne (ambos apuntan al mismo endpoint)
  async getById(id: string, token: string): Promise<Key> {
    const { data } = await api.get<Key>(`/keys/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  async getOne(id: string, token: string): Promise<Key> {
    const { data } = await api.get<Key>(`/keys/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  async delete(id: string, token: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/keys/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  async getHistory(id: string, token: string) {
    const { data } = await api.get(`/keys/${id}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};
