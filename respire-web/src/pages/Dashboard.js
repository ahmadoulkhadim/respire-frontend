import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import useCapteurs from '../hooks/useCapteurs';
import { pm25ToCigarettes, getAirQualityStatus, formatCigaretteScore } from '../utils/doseCalcul';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const getStatusConfig = (status) => {
  const map = {
    'Bon': { gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-200', icon: '😊', color: 'text-emerald-500' },
    'Modéré': { gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', badge: 'bg-amber-500/10 text-amber-700 border-amber-200', icon: '😐', color: 'text-amber-500' },
    'Mauvais': { gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-50', badge: 'bg-orange-500/10 text-orange-700 border-orange-200', icon: '😷', color: 'text-orange-500' },
    'Danger': { gradient: 'from-red-500 to-purple-600', bg: 'bg-red-50', badge: 'bg-red-500/10 text-red-700 border-red-200', icon: '🚨', color: 'text-red-500' },
    'Hors ligne': { gradient: 'from-gray-400 to-gray-500', bg: 'bg-gray-50', badge: 'bg-gray-500/10 text-gray-700 border-gray-200', icon: '🔌', color: 'text-gray-500' },
  };
  return map[status] || map['Bon'];
};

export default function Dashboard() {
  const { user } = useAuth();
  const { capteurs, loading } = useCapteurs({ useMock: false });
  const [selectedCapteur, setSelectedCapteur] = useState(null);

  const stats = useMemo(() => {
    if (!capteurs.length) return { avgPM25: 0, total: 0, alertCount: 0, goodCount: 0 };
    const valid = capteurs.filter(c => c.pm25 != null);
    const avg = valid.reduce((s, c) => s + c.pm25, 0) / valid.length;
    return {
      avgPM25: Math.round(avg),
      total: capteurs.length,
      alertCount: capteurs.filter(c => c.statut === 'Danger' || c.statut === 'Mauvais').length,
      goodCount: capteurs.filter(c => c.statut === 'Bon').length,
    };
  }, [capteurs]);

  const score = useMemo(() => {
    if (!stats.avgPM25) return { score: '0', label: 'N/A', level: 'good' };
    const s = pm25ToCigarettes(stats.avgPM25);
    const q = getAirQualityStatus(stats.avgPM25);
    return { score: formatCigaretteScore(s), ...q };
  }, [stats.avgPM25]);

  return (
    <div>
      <div className="bg-gradient-to-br from-respire-600 via-respire-700 to-respire-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-respire-400 rounded-full blur-3xl opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-10 -translate-x-1/2 translate-y-1/2"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-3">
                Tableau de Bord
              </h1>
              <p className="text-lg text-respire-200">
                {user ? `Bonjour, ${user.first_name} 👋` : 'Surveillance en temps réel'} &mdash; Presqu'île du Cap-Vert
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <p className="text-xs text-respire-200 uppercase tracking-wider font-medium">Mise à jour</p>
                <p className="text-white font-bold text-lg">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <p className="text-xs text-respire-200 uppercase tracking-wider font-medium">Capteurs</p>
                <p className="text-white font-bold text-lg">{stats.total} actifs</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard icon="📡" label="Capteurs" value={String(stats.total)} subtext="déployés" gradient="from-blue-500 to-blue-600" />
            <StatCard icon="🌡️" label="PM2.5 Moyen" value={`${stats.avgPM25}`} subtext="µg/m³" gradient={stats.avgPM25 > 35 ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-green-600'} />
            <StatCard icon="⚠️" label="Alertes" value={String(stats.alertCount)} subtext="actives" gradient={stats.alertCount > 0 ? 'from-red-500 to-rose-600' : 'from-gray-400 to-gray-500'} />
            <StatCard icon="🚬" label="Exposition" value={`${score.score}`} subtext="cigarettes/jour" gradient={score.level === 'good' ? 'from-emerald-500 to-green-600' : score.level === 'moderate' ? 'from-amber-500 to-orange-600' : 'from-red-500 to-rose-600'} />
          </motion.div>

          <motion.div variants={item} className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 font-display">Réseau de Capteurs</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Distribution géographique des points de mesure</p>
                    </div>
                    <div className="flex gap-2">
                      {['😊 Bon', '😐 Modéré', '😷 Mauvais', '🚨 Danger'].map((label) => (
                        <span key={label} className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium hidden sm:block">{label}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 min-h-[350px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_70%)]"></div>
                    <div className="relative h-full flex flex-col items-center justify-center">
                      <div className="text-7xl mb-6 opacity-80">🗺️</div>
                      <h3 className="text-xl font-bold text-white/90 font-display mb-2">Carte Interactive</h3>
                      <p className="text-gray-400 text-sm mb-8">{capteurs.length} capteurs sur la zone</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {capteurs.map((c) => {
                          const cfg = getStatusConfig(c.statut);
                          return (
                            <span key={c.id} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${cfg.badge}`}>
                              <span className="mr-1.5">{cfg.icon}</span>
                              {c.name?.split(' - ')[0] || c.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full">
                <div className={`bg-gradient-to-r ${score.level === 'good' ? 'from-emerald-500 to-green-600' : score.level === 'moderate' ? 'from-amber-400 to-orange-500' : 'from-red-500 to-rose-600'} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl opacity-10 translate-x-1/2 -translate-y-1/2"></div>
                  <div className="relative">
                    <p className="text-xs text-white/80 uppercase tracking-wider font-medium mb-1">Exposition du jour</p>
                    <p className="text-lg font-bold font-display">RESPIRE Index</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className={`text-6xl font-bold font-display ${score.level === 'good' ? 'text-emerald-500' : score.level === 'moderate' ? 'text-amber-500' : 'text-red-500'}`}>
                        {score.score}
                      </span>
                      <span className="text-gray-500 font-medium">🚬</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">équivalent cigarettes / jour</p>
                  </div>
                  <div className={`rounded-xl p-4 mb-4 border ${score.level === 'good' ? 'bg-emerald-50 border-emerald-200' : score.level === 'moderate' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                    <p className={`text-sm font-bold ${score.level === 'good' ? 'text-emerald-700' : score.level === 'moderate' ? 'text-amber-700' : 'text-red-700'}`}>
                      {score.label === 'Bon' ? '😊 Qualité de l\'air saine' : score.label === 'Modéré' ? '😐 Qualité modérée' : score.label === 'Mauvais' ? '😷 Qualité malsaine' : '🚨 Alerte sanitaire'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {score.level === 'good' ? 'Respiration sereine, profitez de l\'air libre.' : score.level === 'moderate' ? 'Évitez les efforts prolongés à l\'extérieur.' : score.level === 'bad' ? 'Réduisez vos activités extérieures.' : 'Portez un masque à l\'extérieur.'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 text-center">Basé sur une moyenne de {stats.avgPM25} µg/m³ de PM2.5</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-display">Capteurs en Temps Réel</h2>
                <p className="text-sm text-gray-500 mt-0.5">Mesures actualisées en continu</p>
              </div>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-respire-500 border-t-transparent rounded-full animate-spin"></div>
                  Chargement...
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {capteurs.map((c, idx) => {
                const cfg = getStatusConfig(c.statut);
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedCapteur(selectedCapteur?.id === c.id ? null : c)}
                    className={`bg-white rounded-2xl shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedCapteur?.id === c.id ? `border-respire-500` : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white text-lg shadow-sm`}>
                          {cfg.icon}
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.badge}`}>
                          {c.statut}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base mb-3">{c.name}</h3>
                      {c.pm25 != null && (
                        <div className={`rounded-xl p-4 mb-3 ${cfg.bg} border ${cfg.badge.split(' ').filter(s => s.startsWith('border'))[0] || 'border-transparent'}`}>
                          <p className={`text-3xl font-bold ${cfg.color}`}>
                            {c.pm25}
                            <span className="text-sm font-normal text-gray-500 ml-1.5">µg/m³</span>
                          </p>
                        </div>
                      )}
                      {c.evolution && c.evolution !== 'N/A' && (
                        <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                          c.evolution.startsWith('+') ? 'text-red-500' : c.evolution.startsWith('-') ? 'text-emerald-500' : 'text-gray-400'
                        }`}>
                          <span>{c.evolution.startsWith('+') ? '📈' : c.evolution.startsWith('-') ? '📉' : '➖'}</span>
                          <span>{c.evolution} vs hier</span>
                        </div>
                      )}
                    </div>
                    {c.location && (
                      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {c.location}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtext, gradient }) {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg shadow-sm`}>
            {icon}
          </div>
        </div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-3xl font-bold bg-gradient-to-br ${gradient} bg-clip-text text-transparent font-display`}>
            {value}
          </span>
          {subtext && <span className="text-sm text-gray-500 font-medium">{subtext}</span>}
        </div>
      </div>
    </motion.div>
  );
}
