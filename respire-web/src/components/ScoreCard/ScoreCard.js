import React from 'react';

const ScoreCard = ({ score, polluant, unite, evolution }) => {
  const getColor = (value) => {
    const numValue = parseFloat(value);
    if (numValue <= 2) return 'text-green-700';
    if (numValue <= 3) return 'text-amber-700';
    return 'text-red-700';
  };

  const getBgColor = (value) => {
    const numValue = parseFloat(value);
    if (numValue <= 2) return 'bg-green-50';
    if (numValue <= 3) return 'bg-amber-50';
    return 'bg-red-50';
  };

  return (
    <div className={`card-lg ${getBgColor(score)}`}>
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
        Indice de qualité
      </p>
      
      <p className={`text-5xl font-semibold ${getColor(score)} mb-2`}>
        {score}
      </p>
      
      <div className="space-y-3 border-t border-gray-200 pt-4 mt-4">
        <div>
          <p className="text-xs text-gray-600 font-medium mb-1">Polluant principal</p>
          <p className="text-sm font-semibold text-gray-900">{polluant}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-600 font-medium mb-1">Concentration</p>
          <p className="text-lg font-semibold text-gray-900">{unite}</p>
        </div>

        {evolution && (
          <div className={`pt-3 border-t border-gray-200 ${evolution < 0 ? 'text-green-700' : 'text-red-700'}`}>
            <p className="text-xs text-gray-600 font-medium mb-1">Tendance</p>
            <p className="text-sm font-semibold">
              {evolution < 0 ? '↓' : '↑'} {Math.abs(evolution)}% vs hier
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreCard;
