const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

function getAuthHeader() {
  try {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (_) {
    return {};
  }
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = options.timeout || 15000; // 15s default
  const timer = setTimeout(() => controller.abort(), timeout);

  const headers = {
    ...DEFAULT_HEADERS,
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const opts = {
    credentials: options.credentials || 'include',
    signal: controller.signal,
    ...options,
    headers,
  };

  // If body is an object, stringify it
  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
    opts.body = JSON.stringify(opts.body);
  }

  try {
    const res = await fetch(`${BASE_URL}/${path}`, opts);
    clearTimeout(timer);

    // No content
    if (res.status === 204) return null;

    let data;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      // Prefer structured message if provided by server
      const errMsg = (data && (data.message || data.error)) || res.statusText || 'Request failed';
      throw new Error(errMsg);
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error(`Request timed out: ${path}`);
    } else {
      console.error(`Error fetching ${path}:`, err.message || err);
    }
    return null;
  }
}

export async function getData(type) {
  return await request(type, { method: 'GET' });
}

export async function getDataByEmail(type, email) {
  return await request(type, { method: 'POST', body: { email } });
}

export async function getDataById(type, id) {
  return await request(`${type}/${id}`, { method: 'GET' });
}

export async function postNewObject(type, object) {
  return await request(type, { method: 'POST', body: object });
}

export async function updateObject(type, id, object) {
  return await request(`${type}/${id}`, { method: 'PUT', body: object });
}

export async function deleteObject(type, id) {
  return await request(`${type}/${id}`, { method: 'DELETE' });
}

export async function getOrdersOfClient(userId) {
  return await request(`myDetails/${userId}/orders`, { method: 'GET' });
}

export async function getTurnsOfClient(userId) {
  return await request(`myDetails/${userId}/turns`, { method: 'GET' });
}
