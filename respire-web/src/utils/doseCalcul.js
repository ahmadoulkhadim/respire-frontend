/**
 * Pilier A — Calcul de la dose respirée en équivalent cigarettes.
 * Formule simplifiée : 1 cigarette ≈ 22 µg/m³·h de PM2.5 cumulée.
 */

const PM25_PER_CIGARETTE = 22;

export function pm25ToCigarettes(pm25, hours = 24) {
  if (pm25 == null || pm25 < 0) return 0;
  const dose = pm25 * hours;
  return Math.round((dose / PM25_PER_CIGARETTE) * 10) / 10;
}

export function getAirQualityStatus(pm25) {
  if (pm25 <= 12) return { label: 'Bon', level: 'good' };
  if (pm25 <= 35) return { label: 'Modéré', level: 'moderate' };
  if (pm25 <= 55) return { label: 'Mauvais', level: 'bad' };
  return { label: 'Danger', level: 'danger' };
}

export function formatCigaretteScore(score) {
  return score.toFixed(1).replace('.', ',');
}
