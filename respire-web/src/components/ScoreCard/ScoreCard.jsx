import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

const ScoreCard = ({ score, polluant, unite, evolution }) => {
  const numeric = parseFloat((score || '0').replace(',', '.'));
  const isGood = evolution < 0;
  const scoreColor = numeric <= 2 ? 'text-green-600' : numeric <= 5 ? 'text-amber-600' : 'text-red-600';
  const barColor = numeric <= 2 ? 'bg-green-500' : numeric <= 5 ? 'bg-amber-500' : 'bg-red-500';
  const barWidth = Math.min((numeric / 8) * 100, 100);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-xs text-gray-400 font-medium">Exposition du jour</p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5">RESPIRE Index</p>
      </div>
      <div className="p-5">
        <div className="text-center mb-4">
          <span className={`text-5xl font-bold font-display ${scoreColor}`}>{score}</span>
          <span className="text-sm text-gray-400 ml-1.5">cigarettes</span>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${barWidth}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg text-sm">
          <div className="flex items-center gap-1.5">
            {isGood ? <TrendingDown className="w-4 h-4 text-green-500" /> : <TrendingUp className="w-4 h-4 text-red-500" />}
            <span className={isGood ? 'text-green-600' : 'text-red-600'}>
              {evolution}%
            </span>
            <span className="text-gray-400 text-xs">vs hier</span>
          </div>
          <span className="text-xs text-gray-400">{polluant} · {unite}</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;