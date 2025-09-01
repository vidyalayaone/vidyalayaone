import { env } from './env';

export interface ApiResult<T=any>{ success:boolean; data?:T; error?:{message:string}; message?:string }

const jsonHeaders = { 'Content-Type':'application/json', 'X-Context':'platform' } as const;

async function post<T>(path:string, body:any):Promise<ApiResult<T>>{
  const res = await fetch(`${env.AUTH_API_URL}${path}`, { method:'POST', headers: jsonHeaders, body: JSON.stringify(body) });
  let payload: any = null;
  try { payload = await res.json(); } catch { payload = { success:false, error:{ message:'Invalid JSON'} }; }
  if(!res.ok) return payload;
  return payload;
}

export const authClient = {
  register: (username:string, phone:string, password:string) => post<{user_id:string; phone:string}>(`/auth/register`, { username, phone, password }),
  resendOtp: (username:string) => post<{}>(`/auth/resend-otp`, { username, purpose:'registration' }),
  verifyRegistrationOtp: (username:string, otp:string) => post<{}>(`/auth/verify-otp/registration`, { username, otp }),
  login: (username:string, password:string) => post(`/auth/login`, { username, password }),
};
