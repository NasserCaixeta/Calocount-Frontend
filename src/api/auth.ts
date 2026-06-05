import api from './axios';
import type { TokenResponse, User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  daily_calorie_goal?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateMePayload {
  name?: string;
  daily_calorie_goal?: number;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export const register = (data: RegisterPayload) =>
  api.post<User>('/auth/register', data).then((r) => r.data);

export const login = (data: LoginPayload) =>
  api.post<TokenResponse>('/auth/login', data).then((r) => r.data);

export const getMe = () =>
  api.get<User>('/auth/me').then((r) => r.data);

export const updateMe = (data: UpdateMePayload) =>
  api.patch<User>('/auth/me', data).then((r) => r.data);

export const changePassword = (data: ChangePasswordPayload) =>
  api.post('/auth/me/change-password', data);

export const deleteAccount = () =>
  api.delete('/auth/me');
