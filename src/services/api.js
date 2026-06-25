import axios from 'axios';
import { getToken } from '../utils/storage';

const BASE_URL = 'http://172.20.10.5:3000';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const register = (name, email, password) =>
  api.post('/api/auth/register', { name, email, password });

export const createInspection = (formData) =>
  api.post('/api/inspections', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getInspections = () =>
  api.get('/api/inspections');

export const getInspection = (id) =>
  api.get(`/api/inspections/${id}`);

export default api;