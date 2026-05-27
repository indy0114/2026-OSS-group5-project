const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
const TOKEN_KEY = 'quizzly_access_token';
const DEFAULT_ERROR_MESSAGE = '요청을 처리하지 못했습니다.';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function formatErrorDetail(detail) {
  if (!detail) {
    return DEFAULT_ERROR_MESSAGE;
  }

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item?.msg) return item.msg;
        return DEFAULT_ERROR_MESSAGE;
      })
      .join('\n');
  }

  if (typeof detail === 'object') {
    return detail.message || detail.msg || DEFAULT_ERROR_MESSAGE;
  }

  return DEFAULT_ERROR_MESSAGE;
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(formatErrorDetail(data.detail));
  }

  return data;
}

export async function signup({ id, email, password }) {
  const data = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username: id, email, password }),
  });

  setToken(data.access_token);
  return data.user;
}

export async function login({ id, password }) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: id, password }),
  });

  setToken(data.access_token);
  return data.user;
}

export async function logout() {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } finally {
    clearToken();
  }
}

export async function getMe() {
  return request('/api/auth/me');
}

export async function deleteAccount() {
  try {
    await request('/api/users/me', { method: 'DELETE' });
  } finally {
    clearToken();
  }
}

export { clearToken, getToken };
