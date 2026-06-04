import { assertBusinessSuccess, extractClientId, extractToken, guestLogin } from '../api/auth';
import { setClientId, setGuest, setToken, setUserId } from './token';

/** 调用访客登录接口并写入本地会话（与登录页「访客登录」一致） */
export async function enterAsGuest(): Promise<void> {
  const res = await guestLogin();
  assertBusinessSuccess(res);
  const token = extractToken(res);
  if (!token) {
    throw new Error('访客登录失败，请稍后重试');
  }
  setToken(token);
  setGuest();
  setUserId(`guest_${crypto.randomUUID()}`);
  const cid = extractClientId(res);
  if (cid) {
    setClientId(cid);
  }
}
