import {
  getMockCapteurs, getMockScore, getMockStats,
  getMockHistorique, getMockZoneData, getMockScenarios, getMockSanteStats,
  submitSymptomes,
} from './mockData';

const USE_MOCK = !process.env.REACT_APP_API_URL;

const api = {
  get: async (url) => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
      switch (url) {
        case '/api/sensors':
        case '/api/capteurs':
          return { data: await getMockCapteurs() };
        case '/api/dashboard/score':
          return { data: await getMockScore() };
        case '/api/dashboard/stats':
          return { data: await getMockStats() };
        case '/api/sante/stats':
          return { data: await getMockSanteStats() };
        case '/api/simulateur/scenarios':
          return { data: await getMockScenarios() };
        default:
          if (url.includes('/api/historique')) return { data: await getMockHistorique() };
          if (url.includes('/api/zones')) return { data: await getMockZoneData() };
          return { data: [] };
      }
    }
    const axios = (await import('axios')).default;
    return axios.get(url);
  },
  post: async (url, data) => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      if (url === '/api/symptomes' || url === '/api/sante/submit') {
        return { data: await submitSymptomes(data) };
      }
      return { data: { success: true } };
    }
    const axios = (await import('axios')).default;
    return axios.post(url, data);
  },
};

export default api;
