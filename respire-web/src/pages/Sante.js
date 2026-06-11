import React, { useState } from 'react';

const Sante = () => {
  const [symptoms, setSymptoms] = useState({
    toux: null,
    respiration: null,
    tete: null,
    fatigue: null
  });

  const handleSymptomChange = (symptom, value) => {
    setSymptoms(prev => ({ ...prev, [symptom]: value }));
  };

  const progress = Object.values(symptoms).filter(v => v !== null).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section */}
      <div className="hero-section relative overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-blue-400 rounded-full opacity-10 blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold text-white mb-3">🏥 Observatoire Citoyen</h1>
          <p className="text-xl text-blue-100">Contribuez à la science • Partagez vos symptômes</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 -mt-8 relative z-10">
        {/* Info Card */}
        <div className="card-premium mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-white/50">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-widest font-bold mb-1">Aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 uppercase tracking-widest font-bold mb-1">Votre exposition</p>
                <p className="text-3xl font-bold text-respire-600">
                  3,2 <span className="text-lg">🚬</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="card-premium overflow-hidden shadow-xl animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-air-good to-green-600 p-8 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
            
            <div className="relative">
              <h2 className="text-3xl font-bold font-display mb-2">Comment vous sentez-vous ?</h2>
              <p className="text-green-100 text-lg">Vos réponses sont anonymes et précieuses pour la recherche</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Progression</span>
              <span className="text-2xl font-bold text-respire-600">{progress}/4</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-air-good to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${(progress/4)*100}%` }} 
              />
            </div>
          </div>

          {/* Questions */}
          <div className="divide-y divide-gray-200">
            {[
              { id: 'toux', label: 'As-tu toussé aujourd\'hui ?', emoji: '🤧', color: 'from-red-400' },
              { id: 'respiration', label: 'As-tu eu du mal à respirer ?', emoji: '😮‍💨', color: 'from-orange-400' },
              { id: 'tete', label: 'As-tu eu des maux de tête ?', emoji: '🤕', color: 'from-purple-400' },
              { id: 'fatigue', label: 'Te sens-tu fatigué sans raison ?', emoji: '😴', color: 'from-blue-400' }
            ].map((question, idx) => (
              <div 
                key={question.id}
                className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors duration-300 group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl group-hover:scale-125 transition-transform duration-300">
                      {question.emoji}
                    </div>
                    <span className="font-bold text-gray-800 text-lg">{question.label}</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSymptomChange(question.id, true)}
                      className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
                        symptoms[question.id] === true
                          ? 'bg-gradient-to-r from-air-good to-green-500 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      OUI
                    </button>
                    <button
                      onClick={() => handleSymptomChange(question.id, false)}
                      className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
                        symptoms[question.id] === false
                          ? 'bg-gradient-to-r from-air-bad to-red-500 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      NON
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
            <button className="w-full bg-gradient-to-r from-respire-500 to-respire-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-95 text-lg">
              📤 Valider mes réponses
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              ✓ Vos données contribuent à la recherche sur la qualité de l'air au Sénégal
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold font-display text-gray-900 mb-6">Statistiques</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-premium hover-lift">
              <div className="p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 uppercase tracking-widest font-bold mb-2">Participants</p>
                    <p className="text-5xl font-bold text-respire-600 font-display">82</p>
                    <p className="text-sm text-gray-500 mt-2">Actifs cette semaine</p>
                  </div>
                  <div className="text-5xl">👥</div>
                </div>
              </div>
            </div>

            <div className="card-premium hover-lift">
              <div className="p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 uppercase tracking-widest font-bold mb-2">Déclarations</p>
                    <p className="text-5xl font-bold text-respire-600 font-display">156</p>
                    <p className="text-sm text-gray-500 mt-2">Cette semaine</p>
                  </div>
                  <div className="text-5xl">📊</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sante;