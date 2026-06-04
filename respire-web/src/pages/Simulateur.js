import React, { useState } from 'react';

const Simulateur = () => {
  const [selectedScenario, setSelectedScenario] = useState(0);
  
  const scenarios = [
    {
      id: 0,
      title: "🌳 Végétalisation",
      description: "Planter 200 arbres sur l'axe de Bargny",
      impact: "-10% PM2.5",
      emoji: "🌳",
      color: "from-air-good to-green-600",
      colorLight: "from-green-50",
      details: {
        pm25: "47 → 42 µg/m³",
        dose: "3,2 → 2,9 🚬/jour",
        rayon: "30m autour de l'axe",
        evites: "~8 déclarations/semaine",
        before: "47",
        after: "42"
      }
    },
    {
      id: 1,
      title: "🚛 Régulation du trafic",
      description: "Interdire camions cimenterie 7h–9h",
      impact: "-15 à 25%",
      emoji: "🚛",
      color: "from-air-moderate to-orange-600",
      colorLight: "from-orange-50",
      details: {
        pm25: "47 → 38 µg/m³",
        dose: "3,2 → 2,4 🚬/jour",
        rayon: "Zone industrielle",
        evites: "~15 déclarations/semaine",
        before: "47",
        after: "38"
      }
    },
    {
      id: 2,
      title: "🛣️ Fermeture de rue",
      description: "Bloquer la rue aux heures de pointe",
      impact: "Impact local",
      emoji: "🛣️",
      color: "from-blue-500 to-indigo-600",
      colorLight: "from-blue-50",
      details: {
        pm25: "47 → 44 µg/m³",
        dose: "3,2 → 2,9 🚬/jour",
        rayon: "Rayon 500m",
        evites: "~5 déclarations/semaine",
        before: "47",
        after: "44"
      }
    }
  ];

  const current = scenarios[selectedScenario];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section */}
      <div className="hero-section relative overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-blue-400 rounded-full opacity-10 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold text-white mb-3">⚙️ Simulateur d'Interventions</h1>
          <p className="text-xl text-blue-100">Testez l'impact d'une action avant sa mise en œuvre</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 -mt-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Scénarios Sidebar */}
          <div className="animate-fade-in">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Scénarios</h2>
            <div className="space-y-4">
              {scenarios.map((scenario, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedScenario(idx)}
                  className={`card-premium cursor-pointer overflow-hidden hover-lift transition-all ${
                    selectedScenario === idx ? 'ring-2 ring-respire-500' : ''
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{scenario.emoji}</span>
                          <h3 className="font-bold text-gray-900">{scenario.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                      </div>
                    </div>
                    
                    <div className={`inline-block badge ${
                      scenario.color.includes('green') ? 'badge-solid-good' :
                      scenario.color.includes('orange') ? 'badge-solid-moderate' :
                      'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                    }`}>
                      {scenario.impact}
                    </div>

                    {selectedScenario === idx && (
                      <div className="mt-3 flex items-center gap-2 text-respire-600 font-bold text-sm">
                        <span>✓</span> Sélectionné
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visualisation Principale */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="card-premium overflow-hidden shadow-xl">
              {/* Header */}
              <div className={`bg-gradient-to-r ${current.color} p-8 text-white relative overflow-hidden`}>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
                
                <div className="relative">
                  <h2 className="text-3xl font-bold font-display mb-2">{current.title}</h2>
                  <p className="text-white/90 text-lg">{current.description}</p>
                </div>
              </div>

              {/* Simulation Visuelle */}
              <div className={`bg-gradient-to-br ${current.colorLight} to-white p-12`}>
                <div className="flex justify-between items-center mb-12">
                  {/* Before */}
                  <div className="text-center">
                    <div className="mb-4">
                      <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg`}>
                        <span className="text-4xl font-bold">{current.details.before}</span>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900 text-lg">Situation actuelle</p>
                    <p className="text-sm text-gray-600">µg/m³</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-5xl animate-bounce-slow">→</div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-respire-600 uppercase tracking-wide">Impact</p>
                      <p className={`text-2xl font-bold bg-gradient-to-r ${current.color} bg-clip-text text-transparent`}>
                        {current.impact}
                      </p>
                    </div>
                  </div>

                  {/* After */}
                  <div className="text-center">
                    <div className="mb-4">
                      <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${current.color} text-white shadow-lg`}>
                        <span className="text-4xl font-bold">{current.details.after}</span>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900 text-lg">Après intervention</p>
                    <p className="text-sm text-gray-600">µg/m³</p>
                  </div>
                </div>

                {/* Barre de comparaison */}
                <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-200">
                  <p className="text-sm text-gray-600 uppercase tracking-widest font-bold mb-3">Réduction estimée</p>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${current.color} transition-all duration-1000`}
                      style={{ width: `${((current.details.before - current.details.after) / current.details.before) * 100}%` }}
                    />
                  </div>
                  <p className={`text-2xl font-bold mt-3 bg-gradient-to-r ${current.color} bg-clip-text text-transparent`}>
                    {Math.round(((current.details.before - current.details.after) / current.details.before) * 100)}% de réduction
                  </p>
                </div>
              </div>

              {/* Détails chiffrés */}
              <div className="p-8 bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
                <h3 className="font-display font-bold text-gray-900 text-xl mb-6">Résultats détaillés</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <DetailCard
                    icon="📊"
                    label="PM2.5 ambiant"
                    value={current.details.pm25}
                  />
                  <DetailCard
                    icon="🚬"
                    label="Exposition quotidienne"
                    value={current.details.dose}
                  />
                  <DetailCard
                    icon="📍"
                    label="Rayon d'impact"
                    value={current.details.rayon}
                  />
                  <DetailCard
                    icon="🏥"
                    label="Symptômes évités"
                    value={current.details.evites}
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="p-8 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
                <button className={`w-full bg-gradient-to-r ${current.color} text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-95 text-lg`}>
                  ▶ Lancer la simulation détaillée
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function DetailCard({ icon, label, value }) {
  return (
    <div className="card-premium p-5 border-l-4 border-respire-500">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 uppercase tracking-widest font-bold mb-1">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default Simulateur;