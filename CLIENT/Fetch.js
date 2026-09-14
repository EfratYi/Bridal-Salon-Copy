const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const headers = options.headers || {};
  const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Network response was not ok');
      err.info = data;
      throw err;
    }
    // unwrap API responses of form { success: true, data: ... }
    if (data && typeof data === 'object') {
      if ('success' in data && data.success && 'data' in data) return data.data;
      if ('data' in data && !('success' in data)) return data.data;
    }
    return data;
  }

  if (!res.ok) throw new Error('Network response was not ok');
  return res.text();
}

export const getData = (type) => request(`/${type}`);
export const getDataById = (type, id) => request(`/${type}/${id}`);
export const postNewObject = (type, object) => request(`/${type}`, { method: 'POST', body: JSON.stringify(object) });
export const updateObject = (type, id, object) => request(`/${type}/${id}`, { method: 'PUT', body: JSON.stringify(object) });
export const deleteObject = (type, id) => request(`/${type}/${id}`, { method: 'DELETE' });
export const getOrdersOfClient = (userId) => request(`/myDetails/${userId}/orders`);
export const getTurnsOfClient = (userId) => request(`/myDetails/${userId}/turns`);
