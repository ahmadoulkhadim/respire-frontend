import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity, Users, AlertTriangle, Heart, MapPin,
  Wifi, Globe, Loader, Wind,
  RefreshCw, Bell,
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import ScoreCard from '../components/ScoreCard/ScoreCard';
import MapComponent from '../components/Map/MapComponent';
import api from '../services/api';

const COLORS = { Bon: '#10b981', Modéré: '#f59e0b', Mauvais: '#ef4444', Danger: '#7c3aed' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm text-xs">
      <p className="font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-gray-600">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-semibold">{entry.value} µg/m³</span>
        </p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [capteurs, setCapteurs] = useState([]);
  const [selectedCapteur, setSelectedCapteur] = useState(null);
  const [score, setScore] = useState(null);
  const [stats, setStats] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [timeframe, setTimeframe] = useState('7d');

  const fetchData = async () => {
    try {
      const [sensorsRes, scoreRes, statsRes, histRes] = await Promise.all([
        api.get('/api/sensors'),
        api.get('/api/dashboard/score'),
        api.get('/api/dashboard/stats'),
        api.get('/api/historique'),
      ]);
      const sensors = sensorsRes.data || [];
      setCapteurs(sensors);
      setScore(scoreRes.data);
      setStats(statsRes.data);
      setHistorique(histRes.data || []);
      setAlertes(
        sensors
          .filter(c => c.statut === 'Danger' || c.statut === 'Mauvais')
          .slice(0, 3)
          .map(c => ({ zone: c.nom, niveau: c.statut === 'Danger' ? 'rouge' : 'orange', message: `PM2.5: ${c.pm25} µg/m³` }))
      );
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredHistory = useMemo(() => {
    if (!historique.length) return [];
    const now = new Date();
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const cutoff = new Date(now.setDate(now.getDate() - days));
    return historique.filter(d => new Date(d.date) >= cutoff);
  }, [historique, timeframe]);

  const statsCards = [
    { icon: Wifi, label: 'Capteurs actifs', value: stats?.capteurs_actifs?.value || capteurs.length || '—', sub: stats?.capteurs_actifs?.subtext || 'en ligne' },
    { icon: Users, label: 'Population couverte', value: stats?.population?.value || '250k', sub: 'habitants' },
    { icon: AlertTriangle, label: 'Zones critiques', value: alertes.length || '0', sub: 'en dépassement' },
    { icon: Heart, label: 'Participants', value: stats?.participants?.value || '—', sub: 'cohorte active' },
  ];

  const evolutionData = useMemo(() => {
    if (!filteredHistory.length) return [];
    const grouped = {};
    filteredHistory.forEach(d => {
      if (!grouped[d.date]) grouped[d.date] = { date: d.date, total: 0, count: 0 };
      grouped[d.date].total += d.pm25;
      grouped[d.date].count += 1;
    });
    return Object.values(grouped).map(d => ({
      date: new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      pm25: Math.round(d.total / d.count * 10) / 10,
    }));
  }, [filteredHistory]);

  const zoneComparison = useMemo(() => {
    if (!historique.length) return [];
    const grouped = {};
    historique.forEach(d => {
      if (!grouped[d.zone]) grouped[d.zone] = { zone: d.zone, total: 0, count: 0 };
      grouped[d.zone].total += d.pm25;
      grouped[d.zone].count += 1;
    });
    return Object.values(grouped).map(d => ({
      zone: d.zone,
      pm25: Math.round(d.total / d.count * 10) / 10,
    })).sort((a, b) => b.pm25 - a.pm25);
  }, [historique]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <img src="/logo.png" alt="RESPIRE" className="w-12 h-12 rounded-xl mx-auto mb-4" />
          <Loader className="w-6 h-6 text-respire-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      {/* Header */}
      <div className="bg-respire-700">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-2xl font-display font-bold">Tableau de Bord</h1>
              <p className="text-blue-200 text-sm mt-1">Surveillance participative · Presqu'île du Cap-Vert</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg text-blue-100 hover:bg-white/20 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
                Actualiser
              </button>
              <span className="text-blue-200/60 text-xs">
                {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((card, idx) => (
            <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <card.icon className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">{card.sub}</span>
              </div>
              <p className="text-xs text-gray-500 mb-0.5">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Alertes silencieuses */}
        {alertes.length > 0 && (
          <div className="mb-6 space-y-1.5">
            {alertes.map((alerte, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-lg text-sm">
                <Bell className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-red-700 font-medium text-xs">{alerte.zone}</span>
                <span className="text-red-500 text-xs">{alerte.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Left Col */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-respire-600" />
                    <h2 className="text-sm font-semibold text-gray-900">Réseau de Capteurs</h2>
                  </div>
                  <span className="text-xs text-gray-400">{capteurs.length} points de mesure</span>
                </div>
              </div>
              <MapComponent capteurs={capteurs} selectedCapteur={selectedCapteur} onCapteurClick={setSelectedCapteur} />
            </div>

            {/* Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Évolution PM2.5</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Moyenne des capteurs</p>
                </div>
                <div className="flex gap-1 bg-gray-100 rounded-md p-0.5">
                  {['7d', '30d', '90d'].map(t => (
                    <button key={t} onClick={() => setTimeframe(t)}
                      className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${timeframe === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolutionData}>
                    <defs>
                      <linearGradient id="pm25G" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="pm25" stroke="#3b82f6" strokeWidth={1.5} fill="url(#pm25G)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Col */}
          <div className="space-y-6">
            <ScoreCard score={score?.score || '2.4'} polluant={score?.polluant || 'PM2.5'} unite={score?.unite || 'µg/m³'} evolution={score?.evolution ?? -12} />

            {/* Zone Comparison */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Wind className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Moyenne par zone</h3>
              </div>
              <div className="space-y-3">
                {zoneComparison.map((zone, idx) => {
                  const color = zone.pm25 < 15 ? COLORS.Bon : zone.pm25 < 35 ? COLORS.Modéré : zone.pm25 < 55 ? COLORS.Mauvais : COLORS.Danger;
                  return (
                    <div key={zone.zone}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{zone.zone}</span>
                        <span className="font-semibold" style={{ color }}>{zone.pm25} µg/m³</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((zone.pm25 / 80) * 100, 100)}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sensors Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Capteurs en temps réel</h2>
            <span className="text-xs text-gray-400 ml-auto">Mise à jour automatique</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {capteurs.map((capteur) => {
              const statutColor = COLORS[capteur.statut] || '#6b7280';
              return (
                <div
                  key={capteur.id}
                  onClick={() => setSelectedCapteur(capteur)}
                  className={`bg-white rounded-lg border cursor-pointer transition-all p-4 ${
                    selectedCapteur?.id === capteur.id ? 'border-respire-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{capteur.nom?.split(' - ')[0]}</span>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium`} style={{ color: statutColor, backgroundColor: `${statutColor}15` }}>{capteur.statut}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-gray-400">PM2.5</span>
                    <span className="text-sm font-semibold text-gray-900">{capteur.pm25} <span className="text-xs font-normal text-gray-400">µg/m³</span></span>
                  </div>
                  <div className="mt-2.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min((capteur.pm25 / 100) * 100, 100)}%`, backgroundColor: statutColor }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0</span>
                    <span>{capteur.evolution}</span>
                    <span>100</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;