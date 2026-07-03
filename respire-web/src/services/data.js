import api from './api';

export async function getSensorHistory(id, days = 7) {
  const res = await api.get(`/api/capteurs/${id}/data`, { params: { days } });
  return res.data;
}

export async function getSensorLatest(id) {
  const res = await api.get(`/api/capteurs/${id}/data/latest`);
  return res.data;
}

export async function getSensorAggregate(id, period = '24h') {
  const res = await api.get(`/api/capteurs/${id}/data/aggregate`, { params: { period } });
  return res.data;
}

export async function sendMeasurement(data) {
  const res = await api.post('/api/data', data);
  return res.data;
}
