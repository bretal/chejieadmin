import axios from 'axios';

export interface LoginParams {
  clientId: string;
  grantType: string;
  tenantId: string;
  username: string;
  password: string;
}

/** 从常见后端响应结构中提取 token（兼容 camelCase 与 snake_case） */
export function extractToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as Record<string, unknown>;

  if (typeof root.token === 'string' && root.token) return root.token;
  if (typeof root.accessToken === 'string' && root.accessToken) return root.accessToken;
  if (typeof root.access_token === 'string' && root.access_token) return root.access_token;

  const data = root.data;
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (typeof nested.token === 'string' && nested.token) return nested.token;
    if (typeof nested.accessToken === 'string' && nested.accessToken) return nested.accessToken;
    if (typeof nested.access_token === 'string' && nested.access_token) return nested.access_token;
  }

  return null;
}

/** 从响应中提取 clientId */
export function extractClientId(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as Record<string, unknown>;

  if (typeof root.clientId === 'string' && root.clientId) return root.clientId;
  if (typeof root.client_id === 'string' && root.client_id) return root.client_id;

  const data = root.data;
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (typeof nested.clientId === 'string' && nested.clientId) return nested.clientId;
    if (typeof nested.client_id === 'string' && nested.client_id) return nested.client_id;
  }

  return null;
}

/** 业务 code 非成功时抛出，便于登录页展示 msg */
export function assertBusinessSuccess(payload: unknown): void {
  if (!payload || typeof payload !== 'object') return;
  const root = payload as Record<string, unknown>;
  if (root.code === undefined) return;

  const code = root.code;
  const ok = code === 0 || code === 200 || code === '200' || code === '0';
  if (!ok) {
    const msg =
      (typeof root.msg === 'string' && root.msg) ||
      (typeof root.message === 'string' && root.message) ||
      '请求失败';
    throw new Error(msg);
  }
}

/**
 * 登录接口 - 直接请求 /auth/login（通过 vite proxy 转发到后端）
 * 不走 /admin 前缀的 axios 实例，避免白名单外的 token 拦截
 */
export async function login(params: LoginParams) {
  const res = await axios.post<unknown>('/auth/login', params, {
    headers: { 'Content-Type': 'application/json' },
  });
  // 脱壳 AxiosResponse，返回 data 层，与 extractToken/assertBusinessSuccess 期望一致
  return res.data;
}

/**
 * 登出接口 - 通知后端使 token 失效
 */
export function logout(token: string, clientId: string) {
  return axios.post<unknown>('/auth/logout', null, {
    headers: {
      Authorization: `Bearer ${token}`,
      clientid: clientId,
    },
  });
}
