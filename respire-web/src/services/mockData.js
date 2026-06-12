const zones = [
  { id: 1, nom: 'Bargny', zone: 'Bargny / SOCOCIM', lat: 14.6937, lon: -17.2229, pm25_base: 65 },
  { id: 2, nom: 'Autoroute', zone: 'Diamniadio', lat: 14.7200, lon: -17.3500, pm25_base: 48 },
  { id: 3, nom: 'Résidentiel', zone: 'Sébikotane', lat: 14.6850, lon: -17.2300, pm25_base: 38 },
  { id: 4, nom: 'Diamniadio', zone: 'Diamniadio', lat: 14.7100, lon: -17.1800, pm25_base: 42 },
  { id: 5, nom: 'Hann', zone: 'Hann / Dakar', lat: 14.7200, lon: -17.4300, pm25_base: 55 },
];

const getRandom = (base, variance = 8) => Math.max(5, Math.round((base + (Math.random() - 0.5) * variance) * 10) / 10);

const getStatut = (pm25) => {
  if (pm25 < 15) return 'Bon';
  if (pm25 < 35) return 'Modéré';
  if (pm25 < 55) return 'Mauvais';
  return 'Danger';
};

const getEvolution = (base) => {
  const diff = Math.round((Math.random() - 0.3) * 20);
  return `${diff > 0 ? '+' : ''}${diff}%`;
};

const generateCapteurs = () => zones.map((z, idx) => {
  const pm25 = getRandom(z.pm25_base);
  const pm10 = getRandom(z.pm25_base * 1.8);
  const no2 = getRandom(35);
  const co = getRandom(1.5, 0.4);
  return {
    id: z.id,
    nom: `${z.nom} - ${z.zone}`,
    statut: getStatut(pm25),
    pm25,
    pm10,
    no2,
    co,
    lat: z.lat + (Math.random() - 0.5) * 0.01,
    lon: z.lon + (Math.random() - 0.5) * 0.01,
    evolution: getEvolution(z.pm25_base),
    updatedAt: new Date().toISOString(),
  };
});

const generateHistoricalData = (days = 30) => {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    zones.forEach((z) => {
      const pm25 = getRandom(z.pm25_base, 12);
      data.push({
        date: date.toISOString().split('T')[0],
        zone: z.nom,
        pm25,
        pm10: getRandom(z.pm25_base * 1.8, 15),
        no2: getRandom(35, 8),
        cigarettes: Math.round((pm25 / 125) * 100) / 100,
      });
    });
  }
  return data;
};

const generateZoneData = () => zones.map((z) => {
  const pm25 = getRandom(z.pm25_base, 10);
  return {
    nom: z.nom,
    pm25: pm25,
    pm10: getRandom(z.pm25_base * 1.8, 15),
    no2: getRandom(35, 8),
    cigarettes: Math.round((pm25 / 125) * 100) / 100,
    lat: z.lat,
    lon: z.lon,
    statut: getStatut(pm25),
  };
});

const generateAlertes = () => {
  const alertZones = zones.filter(() => Math.random() > 0.6);
  return alertZones.map((z) => ({
    zone: z.nom,
    niveau: Math.random() > 0.5 ? 'orange' : 'rouge',
    message: `Dépassement seuil OMS - ${z.nom}`,
    date: new Date().toISOString(),
  }));
};

let mockState = {
  capteurs: generateCapteurs(),
  historique: generateHistoricalData(),
  zoneData: generateZoneData(),
  alertes: generateAlertes(),
  score: { score: '2.4', polluant: 'PM2.5', unite: 'µg/m³', evolution: -12 },
  stats: {
    capteurs_actifs: { value: '5', subtext: 'en ligne' },
    population: { value: '250k', subtext: 'habitants' },
    alertes: { value: '2', subtext: 'aujourd\'hui' },
    participants: { value: '84', subtext: 'cette semaine' },
  },
};

setInterval(() => {
  mockState.capteurs = generateCapteurs();
  mockState.zoneData = generateZoneData();
  mockState.alertes = generateAlertes();
  mockState.score.evolution = Math.round((Math.random() - 0.4) * 20);
}, 15000);

export const getMockCapteurs = () => Promise.resolve([...mockState.capteurs]);
export const getMockScore = () => Promise.resolve({ ...mockState.score });
export const getMockStats = () => Promise.resolve({ ...mockState.stats });
export const getMockAlertes = () => Promise.resolve([...mockState.alertes]);
export const getMockHistorique = () => Promise.resolve([...mockState.historique]);
export const getMockZoneData = () => Promise.resolve([...mockState.zoneData]);

export const getMockScenarios = () => Promise.resolve([
  {
    title: 'Végétalisation',
    description: 'Planter des arbres le long des axes routiers',
    impact: '-30% PM2.5',
    color: 'green',
    details: {
      before: 65,
      after: 45,
      pm25: '45 µg/m³',
      dose: '8.6 cig/jour',
      rayon: '2 km',
      evites: '1 200 cas/an',
    },
  },
  {
    title: 'Régulation trafic',
    description: 'Limiter la circulation aux heures de pointe',
    impact: '-25% PM2.5',
    color: 'amber',
    details: {
      before: 55,
      after: 41,
      pm25: '41 µg/m³',
      dose: '7.9 cig/jour',
      rayon: '5 km',
      evites: '980 cas/an',
    },
  },
  {
    title: 'Fermeture de rue',
    description: 'Piétonniser les zones scolaires aux heures d\'entrée',
    impact: '-15% PM2.5',
    color: 'blue',
    details: {
      before: 48,
      after: 40,
      pm25: '40 µg/m³',
      dose: '7.7 cig/jour',
      rayon: '1.5 km',
      evites: '540 cas/an',
    },
  },
]);

export const getMockSanteStats = () => Promise.resolve({
  participants: 84,
  declarations: 312,
  exposition: '3.2',
  topSymptomes: [
    { nom: 'Toux', count: 45, pourcentage: 54 },
    { nom: 'Fatigue', count: 38, pourcentage: 45 },
    { nom: 'Maux de tête', count: 32, pourcentage: 38 },
    { nom: 'Dyspnée', count: 24, pourcentage: 29 },
  ],
});

export const submitSymptomes = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Merci ! Vos symptômes ont été enregistrés.' });
    }, 800);
  });
};

export default mockState;
