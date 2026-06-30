const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error de API');
  }

  return data;
}

// Auth
export const auth = {
  login: (username: string, password: string) =>
    request<{ success: boolean; data: { token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  setup: (username: string, password: string) =>
    request<{ success: boolean; data: { message: string } }>('/auth/setup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

// Dashboard
export const dashboard = {
  stats: () => request<any>('/dashboard/stats'),
};

// Products
export const products = {
  list: () => request<any>('/products'),
  get: (id: string) => request<any>(`/products/${id}`),
  create: (data: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' }),
  getKeys: (id: string) => request<any>(`/products/${id}/keys`),
  addKeys: (id: string, codes: string[]) =>
    request<any>(`/products/${id}/keys`, { method: 'POST', body: JSON.stringify({ codes }) }),
};

// Orders
export const orders = {
  list: (params?: string) => request<any>(`/orders${params ? `?${params}` : ''}`),
  get: (id: string) => request<any>(`/orders/${id}`),
  approve: (id: string) => request<any>(`/orders/${id}/approve`, { method: 'POST' }),
  reject: (id: string) => request<any>(`/orders/${id}/reject`, { method: 'POST' }),
  exportCsv: () => '/api/orders/export/csv',
};

// Customers
export const customers = {
  list: (search?: string) => request<any>(`/customers${search ? `?search=${search}` : ''}`),
  get: (id: string) => request<any>(`/customers/${id}`),
};

// Resellers
export const resellers = {
  list: () => request<any>('/resellers'),
  create: (data: any) => request<any>('/resellers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/resellers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<any>(`/resellers/${id}`, { method: 'DELETE' }),
};

// Giveaways
export const giveaways = {
  list: () => request<any>('/giveaways'),
  create: (data: any) => request<any>('/giveaways', { method: 'POST', body: JSON.stringify(data) }),
  end: (id: string) => request<any>(`/giveaways/${id}/end`, { method: 'POST' }),
};

// Logs
export const logs = {
  orders: () => request<any>('/logs/orders'),
  keys: () => request<any>('/logs/keys'),
};

// Server Config
export const serverConfig = {
  get: (guildId: string) => request<any>(`/server-config?guildId=${guildId}`),
  set: (guildId: string, key: string, value: string) =>
    request<any>('/server-config', { method: 'PUT', body: JSON.stringify({ guildId, key, value }) }),
};
