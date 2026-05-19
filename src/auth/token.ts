const TOKEN_KEY = 'chejie_admin_token';
const CLIENT_KEY = 'chejie_admin_clientid';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CLIENT_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function getClientId(): string | null {
  return localStorage.getItem(CLIENT_KEY);
}

export function setClientId(clientId: string): void {
  localStorage.setItem(CLIENT_KEY, clientId);
}
