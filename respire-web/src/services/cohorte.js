import api from './api';

export async function getCohortes() {
  const res = await api.get('/api/cohortes');
  return res.data;
}

export async function createCohorte(data) {
  const res = await api.post('/api/cohortes', data);
  return res.data;
}

export async function getCohorte(id) {
  const res = await api.get(`/api/cohortes/${id}`);
  return res.data;
}

export async function updateCohorte(id, data) {
  const res = await api.put(`/api/cohortes/${id}`, data);
  return res.data;
}

export async function getCohorteMembers(id) {
  const res = await api.get(`/api/cohortes/${id}/membres`);
  return res.data;
}

export async function addCohorteMember(cohorteId, userId) {
  const res = await api.post(`/api/cohortes/${cohorteId}/membres/${userId}`);
  return res.data;
}

export async function removeCohorteMember(cohorteId, userId) {
  const res = await api.delete(`/api/cohortes/${cohorteId}/membres/${userId}`);
  return res.data;
}
