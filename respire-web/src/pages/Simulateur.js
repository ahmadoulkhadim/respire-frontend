import React, { useState } from 'react';
import {
  Trees, MapPin, Settings, Car, Building2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TYPES = [
  { icon: Trees, label: 'Végétalisation', color: '#10b981' },
  { icon: Car, label: 'Régulation trafic', color: '#f59e0b' },
  { icon: Building2, label: 'Fermeture de rue', color: '#3b82f6' },
];

const ZONES = [
  { nom: 'Bargny / SOCOCIM', pm25: 65, description: 'Zone industrielle' },
  { nom: 'Autoroute', pm25: 48, description: 'Axes routiers' },
  { nom: 'Résidentiel', pm25: 38, description: 'Zone résidentielle' },
  { nom: 'Diamniadio', pm25: 42, description: 'Zone en développement' },
  { nom: 'Hann', pm25: 55, description: 'Zone portuaire' },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm text-xs">
      {payload.map((entry, i) => (
        <p key={i} className="text-gray-600">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-semibold">{entry.value} µg/m³</span>
        </p>
      ))}
    </div>
  );
};

const Simulateur = () => {
  const [selectedZone, setSelectedZone] = useState(ZONES[0]);
  const [activeType, setActiveType] = useState(0);
  const [intensity, setIntensity] = useState(50);
  const [simulated, setSimulated] = useState(false);

  const reductionFactor = activeType === 0 ? 0.30 : activeType === 1 ? 0.25 : 0.15;
  const reduction = reductionFactor * (intensity / 50);
  const pm25Before = selectedZone.pm25;
  const pm25After = Math.round(pm25Before * (1 - Math.min(reduction, 0.6)) * 10) / 10;
  const cigBefore = Math.round((pm25Before / 125) * 24 * 10) / 10;
  const cigAfter = Math.round((pm25After / 125) * 24 * 10) / 10;
  const reductionPct = Math.round(reduction * 100);

  const CurrentIcon = TYPES[activeType].icon;

  return (
    <div className="pt-16">
      {/* Header */}
      <div className="bg-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div>
            <h1 className="text-white text-2xl font-display font-bold">Simulateur d'Interventions</h1>
            <p className="text-slate-300 text-sm mt-1">Testez l'impact des politiques environnementales</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Zones */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                Zone d'intervention
              </h3>
              <div className="space-y-1.5">
                {ZONES.map((zone) => (
                  <button
                    key={zone.nom}
                    onClick={() => { setSelectedZone(zone); setSimulated(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      selectedZone.nom === zone.nom
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{zone.nom.split('/')[0].trim()}</span>
                      <span className="text-xs text-gray-400">{zone.pm25} µg/m³</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Types */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Type d'intervention</h3>
              <div className="space-y-1.5">
                {TYPES.map((type, idx) => {
                  const Icon = type.icon;
                  const isActive = activeType === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => { setActiveType(idx); setSimulated(false); }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2.5 transition-colors ${
                        isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" style={{ color: type.color }} />
                      <span className="font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Controls */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <CurrentIcon className="w-5 h-5" style={{ color: TYPES[activeType].color }} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{TYPES[activeType].label}</h2>
                    <p className="text-xs text-gray-400">Ajustez l'intensité puis simulez</p>
                  </div>
                </div>
                <button
                  onClick={() => setSimulated(true)}
                  className="px-5 py-2 bg-respire-600 text-white rounded-lg text-sm font-medium hover:bg-respire-700 transition-colors"
                >
                  Simuler
                </button>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Intensité</span>
                  <span className="font-semibold text-gray-900">{intensity}%</span>
                </div>
                <input
                  type="range" min="10" max="100" value={intensity}
                  onChange={(e) => { setIntensity(Number(e.target.value)); setSimulated(false); }}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Faible</span>
                  <span>Modéré</span>
                  <span>Maximum</span>
                </div>
              </div>
            </div>

            {/* Results */}
            {simulated ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Résultats · {selectedZone.nom} · {TYPES[activeType].label}
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    {[
                      { label: 'PM2.5 avant', value: `${pm25Before}`, color: 'text-red-500' },
                      { label: 'PM2.5 après', value: `${pm25After}`, color: 'text-green-500' },
                      { label: 'Réduction', value: `${reductionPct}%`, color: 'text-respire-600' },
                      { label: 'Cig. évitées/jour', value: `${Math.round((cigBefore - cigAfter) * 10) / 10}`, color: 'text-amber-600' },
                    ].map(s => (
                      <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
                        <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Avant', value: pm25Before, fill: '#ef4444' },
                        { name: 'Après', value: pm25After, fill: '#10b981' },
                      ]}>
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {['Avant', 'Après'].map((_, idx) => <Cell key={idx} fill={idx === 0 ? '#ef4444' : '#10b981'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    En appliquant <strong>{TYPES[activeType].label.toLowerCase()}</strong> à <strong>{selectedZone.nom.split('/')[0].trim()}</strong>,
                    le niveau de PM2.5 passerait de <strong className="text-red-500">{pm25Before} µg/m³</strong> à{' '}
                    <strong className="text-green-500">{pm25After} µg/m³</strong> ({reductionPct}% de réduction).
                    Chaque habitant éviterait <strong>{Math.round((cigBefore - cigAfter) * 10) / 10} cigarettes par jour</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-dashed border-gray-300 rounded-lg p-10 text-center">
                <Settings className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Sélectionnez une zone et une intervention, puis cliquez sur Simuler.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulateur;