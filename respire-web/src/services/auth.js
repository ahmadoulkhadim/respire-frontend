import api from './api';

export async function registerUser(data) {
  const res = await api.post('/api/auth/register', data);
  return res.data;
}

export async function loginUser(data) {
  const res = await api.post('/api/auth/login', data);
  return res.data;
}

export async function logoutUser() {
  const res = await api.post('/api/auth/logout');
  return res.data;
}
