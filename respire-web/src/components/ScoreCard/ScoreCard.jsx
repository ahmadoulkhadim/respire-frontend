import React from 'react';

const ScoreCard = ({ score, polluant, unite, evolution }) => {
  const numericScore = parseFloat(score.replace(',', '.'));
  
  const getScoreColor = () => {
    if (numericScore <= 2) return { gradient: 'from-air-good to-green-600', bg: 'bg-air-good/10', label: '✅ Bon', message: 'Respiration sereine' };
    if (numericScore <= 5) return { gradient: 'from-air-moderate to-orange-600', bg: 'bg-air-moderate/10', label: '⚠️ Modéré', message: 'Évitez les efforts prolongés' };
    return { gradient: 'from-air-bad to-red-600', bg: 'bg-air-bad/10', label: '🚨 Alerte', message: 'Portez un masque à l\'extérieur' };
  };

  const colors = getScoreColor();

  return (
    <div className="relative h-full">
      {/* Effet de fond glow */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${colors.gradient} rounded-3xl blur-xl opacity-20 animate-pulse-glow`}></div>
      
      {/* Carte principale */}
      <div className="relative card-premium overflow-hidden h-full flex flex-col">
        {/* Header avec dégradé */}
        <div className={`bg-gradient-to-r ${colors.gradient} p-8 text-white relative overflow-hidden`}>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
          
          <div className="relative flex justify-between items-start mb-6">
            <div>
              <p className="text-xs opacity-80 uppercase tracking-widest font-bold mb-2">Exposition du jour</p>
              <p className="text-2xl font-bold font-display">RESPIRE Index</p>
            </div>
            <div className="text-5xl animate-float">🌍</div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-8 flex-1 flex flex-col justify-between">
          {/* Score géant */}
          <div className="text-center mb-8">
            <div className="relative inline-block w-full">
              <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} rounded-full blur-2xl opacity-30`}></div>
              <div className="relative flex items-baseline justify-center gap-3">
                <span className={`text-7xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent font-display`}>
                  {score}
                </span>
                <span className="text-lg text-gray-600 font-semibold">cigarettes</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 font-medium">{polluant}</p>
            <p className={`text-lg font-bold mt-1 bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>{unite}</p>
          </div>

          {/* Message */}
          <div className={`${colors.bg} rounded-2xl p-6 mb-6 border border-current/10`}>
            <p className={`text-sm font-semibold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent mb-1`}>
              {colors.label}
            </p>
            <p className="text-gray-700 font-medium">{colors.message}</p>
          </div>

          {/* Evolution */}
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Evolution</p>
              <p className={`text-xl font-bold ${evolution < 0 ? 'text-air-good' : 'text-air-bad'}`}>
                {evolution < 0 ? '📉' : '📈'} {evolution}% vs hier
              </p>
            </div>
            <div className="text-3xl">{evolution < 0 ? '✓' : '⚠️'}</div>
          </div>

          {/* Actions */}
          <button className="mt-6 w-full bg-gradient-to-r from-respire-500 to-respire-600 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-95">
            En savoir plus
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;