const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  locations: {
    getAll: (params?: Record<string, string>) =>
      request(`/api/locations${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => request(`/api/locations/${id}`),
    create: (data: any) => request('/api/locations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/api/locations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/api/locations/${id}`, { method: 'DELETE' }),
    getStatistics: () => request('/api/locations/statistics'),
    checkCapacity: (id: string) => request(`/api/locations/${id}/capacity`),
  },

  people: {
    getAll: (params?: Record<string, string>) =>
      request(`/api/people${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => request(`/api/people/${id}`),
    create: (data: any) => request('/api/people', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/api/people/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/api/people/${id}`, { method: 'DELETE' }),
    getStatistics: () => request('/api/people/statistics'),
    getHighPriority: () => request('/api/people/high-priority'),
  },

  checkIns: {
    getAll: (params?: Record<string, string>) =>
      request(`/api/check-ins${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => request(`/api/check-ins/${id}`),
    checkIn: (data: { personId: string; locationId: string; notes?: string }) =>
      request('/api/check-ins', { method: 'POST', body: JSON.stringify(data) }),
    checkOut: (data: { recordId: string; notes?: string; confirmed?: boolean }) =>
      request('/api/check-ins/check-out', { method: 'POST', body: JSON.stringify(data) }),
    getStatistics: () => request('/api/check-ins/statistics'),
    getUnconfirmed: () => request('/api/check-ins/unconfirmed'),
    getByLocation: (locationId: string) => request(`/api/check-ins/location/${locationId}`),
    markReminderSent: (id: string) => request(`/api/check-ins/${id}/reminder-sent`, { method: 'PATCH' }),
  },

  materials: {
    getAll: (params?: Record<string, string>) =>
      request(`/api/materials${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => request(`/api/materials/${id}`),
    create: (data: any) => request('/api/materials', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/api/materials/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    updateQuantity: (id: string, delta: number) =>
      request(`/api/materials/${id}/quantity`, { method: 'PATCH', body: JSON.stringify({ delta }) }),
    getStatistics: () => request('/api/materials/statistics'),
    getLowStock: () => request('/api/materials/low-stock'),
    checkReplenishments: () => request('/api/materials/check-replenishments'),
  },

  allocations: {
    getAll: (params?: Record<string, string>) =>
      request(`/api/allocations${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => request(`/api/allocations/${id}`),
    create: (data: any) => request('/api/allocations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/api/allocations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    confirmDelivery: (id: string) => request(`/api/allocations/${id}/confirm-delivery`, { method: 'PATCH' }),
    getStatistics: () => request('/api/allocations/statistics'),
  },

  followUps: {
    getAll: (params?: Record<string, string>) =>
      request(`/api/follow-ups${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => request(`/api/follow-ups/${id}`),
    create: (data: any) => request('/api/follow-ups', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/api/follow-ups/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    getStatistics: () => request('/api/follow-ups/statistics'),
    getPending: () => request('/api/follow-ups/pending'),
  },

  replenishments: {
    getAll: (params?: Record<string, string>) =>
      request(`/api/replenishments${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => request(`/api/replenishments/${id}`),
    create: (data: any) => request('/api/replenishments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/api/replenishments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    cancel: (id: string) => request(`/api/replenishments/${id}/cancel`, { method: 'DELETE' }),
    getStatistics: () => request('/api/replenishments/statistics'),
  },
};
