const TOKEN_KEY = 'chejie_admin_token';
const CLIENT_KEY = 'chejie_admin_clientid';
const GUEST_KEY = 'chejie_admin_guest';
const USER_ID_KEY = 'chejie_admin_user_id';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CLIENT_KEY);
  localStorage.removeItem(GUEST_KEY);
  localStorage.removeItem(USER_ID_KEY);
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

export function setGuest(): void {
  localStorage.setItem(GUEST_KEY, '1');
}

export function isGuest(): boolean {
  return localStorage.getItem(GUEST_KEY) === '1';
}

export function setUserId(id: string): void {
  localStorage.setItem(USER_ID_KEY, id);
}

export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}
