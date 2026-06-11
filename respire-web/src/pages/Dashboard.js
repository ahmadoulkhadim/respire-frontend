import React, { useState } from 'react';
import ScoreCard from '../components/ScoreCard/ScoreCard';

const Dashboard = () => {
  const [selectedCapteur, setSelectedCapteur] = useState(null);

  const airQualityData = {
    score: "3,2",
    polluant: "PM2.5 moyen",
    unite: "47 µg/m³",
  };

  const capteurs = [
    { id: 1, nom: "Bargny - SOCOCIM", pm25: 72, statut: "Danger", lat: 14.6937, lon: -17.2696, evolution: "+12%" },
    { id: 2, nom: "Diamniadio - Autoroute", pm25: 45, statut: "Modéré", lat: 14.7299, lon: -17.3119, evolution: "-5%" },
    { id: 3, nom: "Sébikotane - Centre", pm25: 28, statut: "Bon", lat: 14.7609, lon: -17.3326, evolution: "-8%" },
    { id: 4, nom: "Dakar - Port", pm25: 58, statut: "Mauvais", lat: 14.6705, lon: -17.4241, evolution: "+3%" },
  ];

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Bon': return { bg: 'badge-solid-good', text: 'text-air-good', border: 'border-air-good', icon: '✅' };
      case 'Modéré': return { bg: 'badge-solid-moderate', text: 'text-air-moderate', border: 'border-air-moderate', icon: '⚠️' };
      case 'Mauvais': return { bg: 'badge-solid-bad', text: 'text-air-bad', border: 'border-air-bad', icon: '❌' };
      case 'Danger': return { bg: 'badge-solid-danger', text: 'text-air-danger', border: 'border-air-danger', icon: '🚨' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-500', border: 'border-gray-500', icon: '❓' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section */}
      <div className="hero-section relative overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-blue-400 rounded-full opacity-10 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
                Tableau de Bord
              </h1>
              <p className="text-xl text-blue-100">
                🌍 Surveillance temps réel • Presqu'île du Cap-Vert
              </p>
            </div>
            <div className="card-glass px-8 py-4 animate-slide-in">
              <div className="text-center">
                <p className="text-sm text-blue-100 uppercase tracking-widest">Mise à jour</p>
                <p className="text-2xl font-bold text-white">
                  {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </p>
                <p className="text-xs text-blue-200 mt-1">
                  {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 -mt-8 relative z-10">
        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 grid-fade">
          <StatCard 
            icon="📡"
            label="Capteurs actifs"
            value="4"
            subtext="/ 4"
            color="from-blue-500"
          />
          <StatCard 
            icon="👥"
            label="Population couverte"
            value="250k"
            color="from-purple-500"
          />
          <StatCard 
            icon="⚠️"
            label="Alertes aujourd'hui"
            value="2"
            color="from-orange-500"
          />
          <StatCard 
            icon="🙋"
            label="Participants"
            value="82"
            color="from-green-500"
          />
        </div>

        {/* Grille principale */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Carte */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="card-premium overflow-hidden hover-lift">
              <div className="bg-gradient-to-r from-slate-100 to-blue-50 p-6 border-b border-white/50">
                <h2 className="font-display text-2xl font-bold text-respire-700 flex items-center gap-2">
                  <span>🗺️</span> Réseau de Capteurs
                </h2>
                <p className="text-sm text-slate-600 mt-2">Distribution géographique des points de mesure</p>
              </div>
              <div className="p-8">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 min-h-[400px] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
                  
                  <div className="relative flex flex-col items-center justify-center h-full">
                    <div className="text-8xl mb-6 animate-float">🗺️</div>
                    <h3 className="text-2xl font-bold text-white mb-2 font-display">Carte Interactive</h3>
                    <p className="text-gray-400 text-lg mb-8">4 capteurs déployés sur la zone</p>
                    
                    <div className="flex flex-wrap gap-3 justify-center">
                      {capteurs.map((c, idx) => {
                        const style = getStatusStyle(c.statut);
                        return (
                          <div 
                            key={c.id}
                            className="flex flex-col items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/30 transition-all"
                            style={{ animationDelay: `${0.1 * idx}s` }}
                          >
                            <div className={`w-3 h-3 rounded-full status-indicator ${style.text.replace('text-', 'bg-')}`}></div>
                            <p className="text-white text-xs font-medium">{c.nom.split(' - ')[0]}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Card */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <ScoreCard 
              score={airQualityData.score}
              polluant={airQualityData.polluant}
              unite={airQualityData.unite}
              evolution={-5}
            />
          </div>
        </div>

        {/* Liste des capteurs */}
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-display font-bold text-respire-700 flex items-center gap-2">
                <span>📡</span> Capteurs en Temps Réel
              </h2>
              <p className="text-sm text-gray-600 mt-1">Mesures actualisées toutes les minutes</p>
            </div>
            <button className="px-4 py-2 rounded-lg text-sm font-semibold text-respire-600 hover:bg-respire-50 transition-colors duration-300">
              Voir détails →
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capteurs.map((capteur, idx) => {
              const style = getStatusStyle(capteur.statut);
              return (
                <div
                  key={capteur.id}
                  onClick={() => setSelectedCapteur(capteur)}
                  className={`card-premium overflow-hidden cursor-pointer hover-lift border-l-4 ${style.border}`}
                  style={{ animationDelay: `${0.1 * idx}s` }}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-4xl animate-float">📍</div>
                      <span className={`badge ${style.bg}`}>
                        {style.icon} {capteur.statut}
                      </span>
                    </div>
                    
                    <h3 className="font-display font-bold text-lg text-gray-900 mb-2">
                      {capteur.nom}
                    </h3>
                    
                    <div className="my-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                      <p className="text-4xl font-bold text-respire-600">
                        {capteur.pm25}
                        <span className="text-sm font-normal text-gray-500 ml-2">µg/m³</span>
                      </p>
                    </div>
                    
                    <div className={`flex items-center gap-2 text-sm font-semibold ${
                      capteur.evolution.includes('+') ? 'text-air-bad' : 'text-air-good'
                    }`}>
                      <span>{capteur.evolution.includes('+') ? '📈' : '📉'}</span>
                      <span>{capteur.evolution} vs hier</span>
                    </div>
                  </div>

                  {selectedCapteur?.id === capteur.id && (
                    <div className="bg-gradient-to-r from-respire-50 to-blue-50 px-6 py-3 border-t border-respire-200 text-sm text-respire-700 font-medium">
                      ✓ Sélectionné
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({ icon, label, value, subtext, color }) {
  return (
    <div className="card-premium hover-lift group overflow-hidden">
      <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${color} to-transparent opacity-5 group-hover:opacity-10 rounded-full blur-2xl transition-all duration-500`}></div>
      
      <div className="relative p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="text-4xl">{icon}</div>
        </div>
        
        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
          {label}
        </p>
        
        <div className="flex items-baseline gap-2">
          <p className={`text-3xl font-bold bg-gradient-to-r ${color} from-current to-blue-500 bg-clip-text text-transparent`}>
            {value}
          </p>
          {subtext && <p className="text-sm text-gray-500 font-medium">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;