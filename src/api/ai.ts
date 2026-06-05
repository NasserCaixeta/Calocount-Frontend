import api from './axios';
import type { MealAnalysisResult } from '../types';

export const analyzePhoto = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api
    .post<MealAnalysisResult>('/ai/analyze', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};
