import api from './api';

export async function getCapteurs() {
  const res = await api.get('/api/capteurs');
  return res.data;
}

export async function getCapteurById(id) {
  const res = await api.get(`/api/capteurs/${id}`);
  return res.data;
}

export async function createCapteur(data) {
  const res = await api.post('/api/capteurs', data);
  return res.data;
}

export async function updateCapteur(id, data) {
  const res = await api.put(`/api/capteurs/${id}`, data);
  return res.data;
}

export async function deleteCapteur(id) {
  const res = await api.delete(`/api/capteurs/${id}`);
  return res.data;
}

export async function getCapteurStatus(id) {
  const res = await api.get(`/api/capteurs/${id}/status`);
  return res.data;
}

export async function getCapteurData(id, days = 7) {
  const res = await api.get(`/api/capteurs/${id}/data`, { params: { days } });
  return res.data;
}

export async function getCapteurLatest(id) {
  const res = await api.get(`/api/capteurs/${id}/data/latest`);
  return res.data;
}

export async function getCapteurAggregate(id, period = '24h') {
  const res = await api.get(`/api/capteurs/${id}/data/aggregate`, { params: { period } });
  return res.data;
}
