import React from 'react';

const MapComponent = ({ capteurs, selectedCapteur, onCapteurClick }) => {
  // Version simplifiée de la carte (avant d'intégrer Leaflet)
  return (
    <div className="relative">
      {/* Carte de base */}
      <div className="bg-respire-gray rounded-lg p-4 min-h-[400px] relative">
        {/* Fond de carte simulé */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-2">🗺️</div>
            <p className="text-gray-500 font-medium">Carte interactive</p>
            <p className="text-sm text-gray-400 mt-1">Presqu'île du Cap-Vert</p>
          </div>
        </div>
        
        {/* Marqueurs des capteurs */}
        {capteurs && capteurs.map((capteur) => (
          <button
            key={capteur.id}
            onClick={() => onCapteurClick && onCapteurClick(capteur)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 ${
              selectedCapteur?.id === capteur.id ? 'ring-4 ring-blue-400 rounded-full' : ''
            }`}
            style={{
              left: `${((capteur.lon + 17.5) / 2) * 100}%`,
              top: `${((capteur.lat - 14.6) / 0.5) * 100}%`,
            }}
          >
            <div className={`w-4 h-4 rounded-full ${
              capteur.pm25 > 50 ? 'bg-status-bad' : 
              capteur.pm25 > 30 ? 'bg-status-moderate' : 'bg-status-good'
            } shadow-lg`}>
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap">
                {capteur.nom.split(' - ')[0]}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Contrôles */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-2 text-xs">
        <div className="flex gap-2">
          <div><div className="w-2 h-2 bg-status-good rounded-full inline-block mr-1"></div> Bon</div>
          <div><div className="w-2 h-2 bg-status-moderate rounded-full inline-block mr-1"></div> Modéré</div>
          <div><div className="w-2 h-2 bg-status-bad rounded-full inline-block mr-1"></div> Mauvais</div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;