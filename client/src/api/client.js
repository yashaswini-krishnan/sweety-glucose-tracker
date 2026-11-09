import axios from 'axios';

const TOKEN_KEY = 'token';

// AuthContext sets this so a 401 can clear the logged-in user.
let onUnauthorized = () => {};

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export function readToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const failedLogin = url.includes('/auth/login') || url.includes('/auth/register');

    // A wrong password is a 401 too. Only an expired or rejected session should log the user out.
    if (error.response?.status === 401 && !failedLogin) {
      clearToken();
      onUnauthorized();
    }

    return Promise.reject(error);
  },
);

export function apiErrorMessage(error) {
  return error.response?.data?.error || 'Something went wrong.';
}

export default api;
