import React, { useState, useEffect } from 'react';
import {
  HeartPulse, Users, BarChart3, Smartphone,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import api from '../services/api';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm text-xs">
      {payload.map((entry, i) => (
        <p key={i} className="text-gray-600">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const Sante = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/sante/stats')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pieData = stats?.topSymptomes?.map(s => ({
    name: s.nom,
    value: s.count,
    pourcentage: s.pourcentage,
  })) || [];

  return (
    <div className="pt-16">
      {/* Header */}
      <div className="bg-rose-700">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div>
            <h1 className="text-white text-2xl font-display font-bold">Observatoire Citoyen</h1>
            <p className="text-rose-200 text-sm mt-1">Données collectées via l'application mobile</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-respire-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { icon: Smartphone, label: 'Participants mobiles', value: stats?.participants || '—', sub: 'citoyens actifs' },
                { icon: BarChart3, label: 'Déclarations', value: stats?.declarations || '—', sub: 'cette semaine' },
                { icon: Users, label: 'Taux de participation', value: stats?.participants ? `${Math.round((stats.declarations / stats.participants) * 100)}%` : '—', sub: 'moyenne hebdo' },
                { icon: HeartPulse, label: 'Données', value: '100% anonymes', sub: 'Conforme CDP Sénégal' },
              ].map(card => (
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

            {pieData.length > 0 ? (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Symptômes déclarés</h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pieData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Répartition</h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                          {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                      {pieData.map((d, idx) => (
                        <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          {d.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Detail cards */}
                <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {pieData.map((symptom, idx) => (
                    <div key={symptom.name} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-sm font-medium text-gray-900">{symptom.name}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{symptom.value}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">signalements</span>
                        <span className="text-xs font-semibold text-gray-600">{symptom.pourcentage}%</span>
                      </div>
                      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${symptom.pourcentage}%`, backgroundColor: COLORS[idx % COLORS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Smartphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-700 mb-1">En attente de données</h3>
                <p className="text-sm text-gray-400">Les données sont collectées via l'application mobile RESPIRE.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sante;