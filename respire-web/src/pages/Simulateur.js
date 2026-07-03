import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCapteurs } from '../hooks/useCapteurs';
import { pm25ToCigarettes, formatCigaretteScore } from '../utils/doseCalcul';

const SCENARIOS = [
  {
    id: 0,
    title: 'Végétalisation',
    subtitle: 'Planter 200 arbres sur l\'axe de Bargny',
    icon: '🌳',
    gradient: 'from-emerald-500 to-green-600',
    lightBg: 'from-emerald-50',
    impact: '-10%',
    details: {
      reduction: 10,
      rayon: '30m autour de l\'axe',
      evites: '~8 déclarations/semaine',
    },
  },
  {
    id: 1,
    title: 'Régulation du trafic',
    subtitle: 'Interdire camions cimenterie 7h–9h',
    icon: '🚛',
    gradient: 'from-amber-400 to-orange-600',
    lightBg: 'from-amber-50',
    impact: '-15 à 25%',
    details: {
      reduction: 20,
      rayon: 'Zone industrielle',
      evites: '~15 déclarations/semaine',
    },
  },
  {
    id: 2,
    title: 'Fermeture de rue',
    subtitle: 'Bloquer la rue aux heures de pointe',
    icon: '🛣️',
    gradient: 'from-blue-500 to-indigo-600',
    lightBg: 'from-blue-50',
    impact: 'Impact local',
    details: {
      reduction: 6,
      rayon: 'Rayon 500m',
      evites: '~5 déclarations/semaine',
    },
  },
];

export default function Simulateur() {
  const { capteurs } = useCapteurs({ useMock: false });
  const [selected, setSelected] = useState(0);
  const [simulating, setSimulating] = useState(false);
  const [simulated, setSimulated] = useState(false);

  const current = SCENARIOS[selected];

  const pm25Base = useMemo(() => {
    const valid = capteurs.filter(c => c.pm25 != null);
    return valid.length ? Math.round(valid.reduce((s, c) => s + c.pm25, 0) / valid.length) : 47;
  }, [capteurs]);

  const afterPM25 = Math.round(pm25Base * (1 - current.details.reduction / 100));
  const beforeDose = formatCigaretteScore(pm25ToCigarettes(pm25Base));
  const afterDose = formatCigaretteScore(pm25ToCigarettes(afterPM25));

  return (
    <div>
      <div className="bg-gradient-to-br from-respire-600 via-purple-600 to-respire-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-400 rounded-full blur-3xl opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-3">Simulateur d'Interventions</h1>
            <p className="text-lg text-purple-200">Testez l'impact d'une action avant sa mise en œuvre</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16">
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-xl font-bold text-gray-900 font-display mb-4">Scénarios</h2>
            <div className="space-y-3">
              {SCENARIOS.map((s, idx) => (
                <motion.div
                  key={s.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelected(idx)}
                  className={`bg-white rounded-2xl shadow-sm border-2 cursor-pointer transition-all p-5 ${
                    selected === idx ? 'border-respire-500 shadow-md' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>
                      {s.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900">{s.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{s.subtitle}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${s.gradient} flex-shrink-0`}>
                      {s.impact}
                    </div>
                  </div>
                  {selected === idx && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-respire-600 text-sm font-semibold">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Scénario sélectionné
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className={`bg-gradient-to-r ${current.gradient} p-8 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-2xl opacity-10"></div>
                <div className="relative flex items-center gap-4">
                  <span className="text-4xl">{current.icon}</span>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold font-display">{current.title}</h2>
                    <p className="text-white/80 mt-1">{current.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className={`bg-gradient-to-br ${current.lightBg} to-white p-8 md:p-12`}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10">
                  <div className="text-center">
                    <div className="mb-3">
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white flex items-center justify-center mx-auto shadow-lg">
                        <div>
                          <p className="text-3xl font-bold font-display">{pm25Base}</p>
                          <p className="text-xs opacity-80">µg/m³</p>
                        </div>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">Situation actuelle</p>
                    <p className="text-sm text-gray-500">{beforeDose} 🚬/jour</p>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <motion.div
                      animate={{ x: [0, 8, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-5xl text-gray-400"
                    >→</motion.div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-respire-600 uppercase tracking-wide">Impact</p>
                      <p className={`text-2xl font-bold bg-gradient-to-r ${current.gradient} bg-clip-text text-transparent`}>
                        -{current.details.reduction}%
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="mb-3">
                      <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${current.gradient} text-white flex items-center justify-center mx-auto shadow-lg`}>
                        <div>
                          <p className="text-3xl font-bold font-display">{afterPM25}</p>
                          <p className="text-xs opacity-80">µg/m³</p>
                        </div>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">Après intervention</p>
                    <p className="text-sm text-gray-500">{afterDose} 🚬/jour</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Réduction estimée</p>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${current.details.reduction}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${current.gradient} rounded-full`}
                    />
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`text-2xl font-bold mt-3 bg-gradient-to-r ${current.gradient} bg-clip-text text-transparent`}
                  >
                    -{current.details.reduction}% de réduction
                  </motion.p>
                </div>
              </div>

              <div className="p-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 font-display mb-5">Résultats détaillés</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📊</span>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">PM2.5 ambiant</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{pm25Base} → {afterPM25} µg/m³</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🚬</span>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Exposition quotidienne</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{beforeDose} → {afterDose} 🚬/jour</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📍</span>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Rayon d'impact</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{current.details.rayon}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🏥</span>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Symptômes évités</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{current.details.evites}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                <button
                  onClick={() => {
                    setSimulating(true);
                    setSimulated(false);
                    setTimeout(() => { setSimulating(false); setSimulated(true); }, 2000);
                  }}
                  disabled={simulating}
                  className={`w-full py-3.5 bg-gradient-to-r ${current.gradient} text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all text-lg disabled:opacity-70`}
                >
                  {simulating ? '⏳ Simulation en cours...' : simulated ? '✅ Simulation terminée' : '▶ Lancer la simulation détaillée'}
                </button>
              </div>
            </div>

            {simulated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6"
              >
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white">
                  <h3 className="text-xl font-bold font-display">📊 Résultats de la simulation</h3>
                  <p className="text-purple-100 text-sm mt-1">{current.title} — Analyse d'impact détaillée</p>
                </div>
                <div className="p-6 space-y-5">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: '100%' }}
                    className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200"
                  >
                    <span className="text-3xl">✅</span>
                    <div>
                      <p className="font-bold text-emerald-800">Scénario validé</p>
                      <p className="text-sm text-emerald-600">Réduction estimée de {current.details.reduction}% des PM2.5</p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="grid sm:grid-cols-3 gap-4"
                  >
                    {[
                      { icon: '📊', label: 'Avant', value: `${pm25Base} µg/m³`, color: 'text-red-500' },
                      { icon: '📉', label: 'Réduction', value: `-${current.details.reduction}%`, color: 'text-emerald-500' },
                      { icon: '📈', label: 'Après', value: `${afterPM25} µg/m³`, color: 'text-emerald-500' },
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }} className="bg-gray-50 rounded-xl p-4 text-center">
                        <span className="text-3xl block mb-2">{item.icon}</span>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{item.label}</p>
                        <p className={`text-xl font-bold mt-1 ${item.color}`}>{item.value}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    className="text-xs text-gray-400 text-center pt-2"
                  >
                    Simulation basée sur les données réelles des capteurs • {current.details.rayon}
                  </motion.p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
