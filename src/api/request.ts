import axios, { type AxiosError } from 'axios';
import { clearToken, getClientId, getToken } from '../auth/token';

const api = axios.create({
  baseURL: '/admin',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/** 不需要携带 token 的接口白名单 */
const TOKEN_WHITELIST = ['/auth/login', '/auth/register', '/captcha', '/auth/tenant/list'];

function isInWhitelist(url?: string): boolean {
  if (!url) return false;
  return TOKEN_WHITELIST.some((p) => url.startsWith(p));
}

api.interceptors.request.use((config) => {
  // 白名单内的接口不携带 token
  if (isInWhitelist(config.url)) {
    return config;
  }
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const clientId = getClientId();
  if (clientId) {
    config.headers.clientid = clientId;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err: AxiosError<{ msg?: string; message?: string }>) => {
    if (err.response?.status === 401) {
      clearToken();
      const path = window.location.pathname;
      if (!path.startsWith('/login')) {
        window.location.replace(`/login?redirect=${encodeURIComponent(path)}`);
      }
    }
    console.error('API Error:', err);
    return Promise.reject(err);
  },
);

export function getErrorMessage(error: unknown, fallback = '请求失败'): string {
  if (error instanceof Error && error.message) return error.message;
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object') {
      const msg = (data as { msg?: string; message?: string }).msg ?? (data as { message?: string }).message;
      if (msg) return msg;
    }
    return error.message || fallback;
  }
  return fallback;
}

export default api;
