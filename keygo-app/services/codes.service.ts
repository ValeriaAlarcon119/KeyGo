import api from './api';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type CodeMode = 'SINGLE_USE' | 'REUSABLE';

export interface CreatePickupCodePayload {
  key_id: string;
  code_mode?: CodeMode;
  label_name?: string;
  active_from?: string; // ISO 8601
}

export interface PickupCode {
  id: string;
  key_id: string;
  code_value: string;
  code_mode: CodeMode;
  label_name?: string;
  active_from?: string;
  status: 'ACTIVE' | 'USED' | 'CANCELLED' | 'PENDING_SCHEDULE';
  used_at?: string;
  cancelled_at?: string;
  created_at: string;
}

export interface PickupCodeResponse {
  pickup_code: PickupCode;
  store: {
    store_name?: string;
    address?: string;
    city?: string;
    opening_hours?: string;
    whatsapp?: string;
    google_maps_link?: string;
    instructions?: string;
  };
  share_message: string;
}

export interface ValidateResult {
  valid: boolean;
  message: string;
  key?: { id: string; key_name: string; key_status: string };
  owner?: { full_name: string; email: string };
  label_name?: string;
  is_reusable?: boolean;
  active_from?: string;
}

// ─── CODES SERVICE ────────────────────────────────────────────────────────────

export const codesService = {
  // Generar código de recogida
  async createPickupCode(
    payload: CreatePickupCodePayload,
    token: string,
  ): Promise<PickupCodeResponse> {
    const { data } = await api.post<PickupCodeResponse>('/codes/pickup', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  // Listar códigos por llave
  async getPickupCodesByKey(keyId: string, token: string): Promise<PickupCode[]> {
    const { data } = await api.get<PickupCode[]>(`/codes/pickup/key/${keyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  // Cancelar código de recogida
  async cancelPickupCode(codeId: string, token: string) {
    const { data } = await api.delete(`/codes/pickup/${codeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  // Validar código de depósito (para tienda) — recibe string plano
  async validateDeposit(codeValue: string, token: string): Promise<ValidateResult> {
    const { data } = await api.post<ValidateResult>(
      '/codes/validate/deposit',
      { code_value: codeValue },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data;
  },

  // Validar código de recogida (para tienda) — recibe string plano
  async validatePickup(codeValue: string, token: string): Promise<ValidateResult> {
    const { data } = await api.post<ValidateResult>(
      '/codes/validate/pickup',
      { code_value: codeValue },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data;
  },

  // Alias legacy por compatibilidad
  async validateDepositCode(payload: { code_value: string }, token: string) {
    return this.validateDeposit(payload.code_value, token);
  },

  async validatePickupCode(payload: { code_value: string }, token: string) {
    return this.validatePickup(payload.code_value, token);
  },
};
