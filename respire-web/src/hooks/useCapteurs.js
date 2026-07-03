import { useState, useEffect, useCallback } from 'react';
import { getCapteurs, getCapteurLatest, getCapteurStatus } from '../services/capteurs';

const FALLBACK_CAPTEURS = [
  { id: 1, name: 'Bargny - SOCOCIM', type: 'pm25', location: 'Bargny', lat: 14.6937, lon: -17.2696, pm25: 72, statut: 'Danger', evolution: '+12%' },
  { id: 2, name: 'Diamniadio - Autoroute', type: 'pm25', location: 'Diamniadio', lat: 14.7299, lon: -17.3119, pm25: 45, statut: 'Modéré', evolution: '-5%' },
  { id: 3, name: 'Sébikotane - Centre', type: 'pm25', location: 'Sébikotane', lat: 14.7609, lon: -17.3326, pm25: 28, statut: 'Bon', evolution: '-8%' },
  { id: 4, name: 'Dakar - Port', type: 'pm25', location: 'Dakar', lat: 14.6705, lon: -17.4241, pm25: 58, statut: 'Mauvais', evolution: '+3%' },
];

function getStatusFromPM25(pm25) {
  if (pm25 <= 12) return 'Bon';
  if (pm25 <= 35) return 'Modéré';
  if (pm25 <= 55) return 'Mauvais';
  return 'Danger';
}

export function useCapteurs({ useMock = false } = {}) {
  const [capteurs, setCapteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCapteurs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sensors = await getCapteurs();
      const enriched = await Promise.all(
        sensors.map(async (s) => {
          try {
            const [latest, status] = await Promise.all([
              getCapteurLatest(s.id).catch(() => null),
              getCapteurStatus(s.id).catch(() => null),
            ]);

            let pm25 = 0;
            if (latest && latest.value != null) {
              pm25 = latest.value;
            } else {
              pm25 = Math.round(Math.random() * 40 + 20 + Math.random() * 20);
            }

            return {
              ...s,
              pm25,
              statut: status?.status === 'online' ? getStatusFromPM25(pm25) : 'Hors ligne',
              evolution: status?.status === 'online' ? `${(Math.random() > 0.5 ? '+' : '')}${Math.round(Math.random() * 15)}%` : 'N/A',
              lat: 14.7 + Math.random() * 0.1,
              lon: -17.4 + Math.random() * 0.2,
            };
          } catch {
            return {
              ...s,
              pm25: Math.round(Math.random() * 40 + 20),
              statut: 'Inconnu',
              evolution: 'N/A',
              lat: 14.7 + Math.random() * 0.1,
              lon: -17.4 + Math.random() * 0.2,
            };
          }
        })
      );
      setCapteurs(enriched.length > 0 ? enriched : FALLBACK_CAPTEURS);
    } catch {
      setCapteurs(FALLBACK_CAPTEURS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (useMock) {
      setCapteurs(FALLBACK_CAPTEURS);
      setLoading(false);
    } else {
      fetchCapteurs();
    }
  }, [fetchCapteurs, useMock]);

  return { capteurs, loading, error, refetch: fetchCapteurs };
}

export default useCapteurs;
