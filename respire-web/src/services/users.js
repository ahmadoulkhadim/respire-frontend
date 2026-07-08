import api from './api';

export async function getUsers() {
  const res = await api.get('/api/users');
  return res.data;
}

export async function getUser(id) {
  const res = await api.get(`/api/users/${id}`);
  return res.data;
}

export async function updateUser(id, data) {
  const res = await api.put(`/api/users/${id}`, data);
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/api/users/${id}`);
  return res.data;
}

export async function getProfile(id) {
  const res = await api.get(`/api/users/${id}/profil`);
  return res.data;
}

export async function updateProfile(id, data) {
  const res = await api.put(`/api/users/${id}/profil`, data);
  return res.data;
}
