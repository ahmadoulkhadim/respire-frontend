import React from 'react';

const StatsCards = ({ capteurs }) => {
  const moyenne = Math.round(capteurs.reduce((acc, c) => acc + c.pm25, 0) / capteurs.length);
  const rougeCount = capteurs.filter(c => c.statut === 'Danger').length;
  const orangeCount = capteurs.filter(c => c.statut === 'Mauvais').length;
  const vertCount = capteurs.filter(c => c.statut === 'Bon').length;

  const getColorClass = (value) => {
    if (value > 50) return 'from-air-danger to-red-600';
    if (value > 30) return 'from-air-moderate to-orange-600';
    return 'from-air-good to-green-600';
  };

  return (
    <div className="space-y-4">
      {/* Moyenne PM2.5 */}
      <div className="card-premium hover-lift overflow-hidden">
        <div className={`bg-gradient-to-r ${getColorClass(moyenne)} p-6 text-white relative overflow-hidden`}>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
          
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs opacity-80 uppercase tracking-widest font-bold mb-2">Moyenne PM2.5</p>
                <p className="text-4xl font-bold font-display">{moyenne}</p>
                <p className="text-sm opacity-90 mt-1">µg/m³</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </div>
      </div>

      {/* Capteurs déployés */}
      <div className="card-premium hover-lift overflow-hidden">
        <div className="bg-gradient-to-br from-respire-500 to-respire-700 p-6 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
          
          <div className="relative">
            <p className="text-xs opacity-80 uppercase tracking-widest font-bold mb-2">Capteurs déployés</p>
            <div className="flex items-baseline gap-2 mb-4">
              <p className="text-4xl font-bold font-display">{capteurs.length}</p>
              <p className="text-sm opacity-90">actifs</p>
            </div>

            <div className="flex gap-2 mt-4">
              <div className="flex-1">
                <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-air-danger rounded-full"
                    style={{ width: `${(rougeCount / capteurs.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs mt-1 opacity-90">🚨 {rougeCount}</p>
              </div>
              <div className="flex-1">
                <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-air-moderate rounded-full"
                    style={{ width: `${(orangeCount / capteurs.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs mt-1 opacity-90">⚠️ {orangeCount}</p>
              </div>
              <div className="flex-1">
                <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-air-good rounded-full"
                    style={{ width: `${(vertCount / capteurs.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs mt-1 opacity-90">✅ {vertCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Population couverte */}
      <div className="card-premium hover-lift overflow-hidden">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
          
          <div className="relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs opacity-80 uppercase tracking-widest font-bold mb-2">Population couverte</p>
                <p className="text-3xl font-bold font-display">~250k</p>
                <p className="text-xs opacity-90 mt-2">habitants</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
            <p className="text-xs opacity-75 mt-4">Zones: Bargny, Diamniadio, Sébikotane</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;