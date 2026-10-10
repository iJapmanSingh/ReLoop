const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const tokenStore = {
  get: () => localStorage.getItem('token'),
  set: (t) => localStorage.setItem('token', t),
  clear: () => localStorage.removeItem('token'),
};

async function request(path, { method = 'GET', body } = {}) {
  const token = tokenStore.get();
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error || 'Something went wrong. Please try again.');
    err.status = res.status;
    throw err;
  }
  return data;
}

const qs = (o) => {
  const p = new URLSearchParams(Object.entries(o).filter(([, v]) => v));
  return p.toString() ? `?${p}` : '';
};

export const api = {
  login: (b) => request('/auth/login', { method: 'POST', body: b }),
  register: (b) => request('/auth/register', { method: 'POST', body: b }),
  me: () => request('/auth/me'),
  // items (citizen)
  myItems: () => request('/items/mine'),
  getItem: (id) => request(`/items/${id}`),
  createItem: (b) => request('/items', { method: 'POST', body: b }),
  updateItem: (id, b) => request(`/items/${id}`, { method: 'PUT', body: b }),
  generateAdvice: (id) => request(`/items/${id}/advice`, { method: 'POST' }),
  // pickups
  createPickup: (b) => request('/pickups', { method: 'POST', body: b }),
  myPickups: () => request('/pickups/mine'),
  getPickup: (id) => request(`/pickups/${id}`),
  cancelPickup: (id) => request(`/pickups/${id}/cancel`, { method: 'PATCH' }),
  // pickups (collector)
  availablePickups: (city, pincode) => request(`/pickups/available${qs({ city, pincode })}`),
  assignedPickups: () => request('/pickups/assigned'),
  acceptPickup: (id) => request(`/pickups/${id}/accept`, { method: 'PATCH' }),
  setStatus: (id, status) => request(`/pickups/${id}/status`, { method: 'PATCH', body: { status } }),
  adminStats: () => request('/admin/stats'),
};
