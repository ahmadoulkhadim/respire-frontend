import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getCohortes, createCohorte } from '../services/cohorte';
import { useCapteurs } from '../hooks/useCapteurs';
import { pm25ToCigarettes, formatCigaretteScore } from '../utils/doseCalcul';

export default function Sante() {
  const { user } = useAuth();
  const { capteurs } = useCapteurs({ useMock: false });
  const [cohortes, setCohortes] = useState([]);
  const [selectedCohorte, setSelectedCohorte] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newCohorte, setNewCohorte] = useState({ name: '', description: '' });
  const [symptoms, setSymptoms] = useState({ toux: null, respiration: null, tete: null, fatigue: null });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCohortes().then(setCohortes).catch(() => {});
  }, []);

  const progress = Object.values(symptoms).filter(v => v !== null).length;

  const handleCreateCohorte = async (e) => {
    e.preventDefault();
    try {
      const c = await createCohorte(newCohorte);
      setCohortes([...cohortes, c]);
      setShowCreate(false);
      setNewCohorte({ name: '', description: '' });
    } catch {}
  };

  const avgPM25 = capteurs.length
    ? Math.round(capteurs.reduce((s, c) => s + (c.pm25 || 0), 0) / capteurs.length)
    : 47;
  const cigaretteScore = formatCigaretteScore(pm25ToCigarettes(avgPM25));

  return (
    <div>
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-respire-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]"></div>
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-400 rounded-full blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-3">Observatoire Citoyen</h1>
            <p className="text-lg text-emerald-100">Contribuez à la science &middot; Partagez vos symptômes</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Aujourd'hui</p>
              <p className="text-xl font-bold text-gray-900">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">PM2.5 moyen</p>
                <p className="text-2xl font-bold text-gray-900">{avgPM25} µg/m³</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Votre exposition</p>
                <p className="text-2xl font-bold text-amber-500">{cigaretteScore} 🚬</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-2xl opacity-10"></div>
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold font-display mb-2">Comment vous sentez-vous ?</h2>
              <p className="text-emerald-100">Vos réponses sont anonymes et précieuses pour la recherche</p>
            </div>
          </div>

          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Progression</span>
              <span className="text-xl font-bold text-respire-600">{progress}/4</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(progress / 4) * 100}%` }}
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {[
              { id: 'toux', label: "Avez-vous toussé aujourd'hui ?", emoji: '🤧' },
              { id: 'respiration', label: 'Avez-vous eu du mal à respirer ?', emoji: '😮‍💨' },
              { id: 'tete', label: 'Avez-vous eu des maux de tête ?', emoji: '🤕' },
              { id: 'fatigue', label: 'Vous sentez-vous fatigué sans raison ?', emoji: '😴' },
            ].map((q, idx) => (
              <div key={q.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="text-3xl flex-shrink-0">{q.emoji}</span>
                    <span className="font-medium text-gray-800">{q.label}</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSymptoms(s => ({ ...s, [q.id]: true }))}
                      className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                        symptoms[q.id] === true
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >OUI</button>
                    <button
                      onClick={() => setSymptoms(s => ({ ...s, [q.id]: false }))}
                      className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                        symptoms[q.id] === false
                          ? 'bg-red-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >NON</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gray-50/50 border-t border-gray-100">
            <button
              onClick={() => {
                setSubmitting(true);
                setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 1500);
              }}
              disabled={progress < 4 || submitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {submitting ? '⏳ Envoi en cours...' : submitted ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>✅</motion.span>
                  Réponses enregistrées
                </span>
              ) : '📤 Valider mes réponses'}
            </button>
            <p className="text-center text-xs text-gray-500 mt-3">Vos données contribuent à la recherche sur la qualité de l'air au Sénégal</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Participants</p>
                <p className="text-4xl font-bold text-respire-600 font-display">{cohortes.reduce((s, c) => s + (c.member_count || 0), 0) || 82}</p>
                <p className="text-sm text-gray-500 mt-1">Actifs cette semaine</p>
              </div>
              <div className="w-12 h-12 bg-respire-50 rounded-xl flex items-center justify-center text-2xl">👥</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Déclarations</p>
                <p className="text-4xl font-bold text-respire-600 font-display">156</p>
                <p className="text-sm text-gray-500 mt-1">Cette semaine</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl">📊</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-display">Cohortes</h3>
              <p className="text-sm text-gray-500">Groupes de participants</p>
            </div>
            {user && (
              <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-respire-50 text-respire-700 rounded-xl text-sm font-semibold hover:bg-respire-100 transition-colors">
                + Nouvelle
              </button>
            )}
          </div>

          {showCreate && (
            <form onSubmit={handleCreateCohorte} className="p-6 bg-gray-50 border-b border-gray-100">
              <div className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Nom de la cohorte"
                  value={newCohorte.name}
                  onChange={e => setNewCohorte({ ...newCohorte, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-respire-500 focus:ring-4 focus:ring-respire-500/10 transition-all text-sm"
                />
                <textarea
                  placeholder="Description (optionnelle)"
                  value={newCohorte.description}
                  onChange={e => setNewCohorte({ ...newCohorte, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-respire-500 focus:ring-4 focus:ring-respire-500/10 transition-all text-sm resize-none"
                />
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-respire-500 to-respire-600 text-white font-semibold rounded-xl text-sm hover:shadow-lg transition-all">
                  Créer la cohorte
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-gray-100">
            {cohortes.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="text-4xl mb-3">👥</p>
                <p className="font-medium">Aucune cohorte pour le moment</p>
                <p className="text-sm mt-1">Connectez-vous pour en créer une</p>
              </div>
            ) : (
              cohortes.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCohorte(selectedCohorte?.id === c.id ? null : c)}
                  className={`p-5 hover:bg-gray-50 cursor-pointer transition-colors ${selectedCohorte?.id === c.id ? 'bg-respire-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{c.name}</p>
                      {c.description && <p className="text-sm text-gray-500 mt-0.5">{c.description}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">{c.member_count || 0} membres</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
