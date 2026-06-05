import api from './axios';
import type { CalorieLog, DailySummary } from '../types';

export interface CreateLogPayload {
  meal_name: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  via?: string;
  log_date: string;
  notes?: string;
}

export const createLog = (data: CreateLogPayload) =>
  api.post<CalorieLog>('/calories/', data).then((r) => r.data);

export const listLogs = (log_date?: string) =>
  api
    .get<CalorieLog[]>('/calories/', { params: log_date ? { log_date } : {} })
    .then((r) => r.data);

export const getSummary = (start_date?: string, end_date?: string) =>
  api
    .get<DailySummary[]>('/calories/summary', {
      params: { start_date, end_date },
    })
    .then((r) => r.data);

export const deleteLog = (id: number) =>
  api.delete(`/calories/${id}`);
