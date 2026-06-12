import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const createMarkerIcon = (color) => {
  const colors = {
    Bon: '#10b981',
    Modéré: '#f59e0b',
    Mauvais: '#ef4444',
    Danger: '#7c3aed',
  };
  const c = colors[color] || '#6b7280';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 16px; height: 16px;
      background: ${c};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
};

const MapComponent = ({ capteurs, selectedCapteur, onCapteurClick }) => {
  const center = [14.7167, -17.4677];

  if (typeof window !== 'undefined' && !L) {
    return null;
  }

  return (
    <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {capteurs?.map((capteur) => (
          <Marker
            key={capteur.id}
            position={[capteur.lat, capteur.lon]}
            icon={createMarkerIcon(capteur.statut)}
            eventHandlers={{
              click: () => onCapteurClick?.(capteur),
            }}
          >
            <Popup>
              <div className="font-medium text-sm">{capteur.nom}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                PM2.5: <span className="font-semibold">{capteur.pm25} µg/m³</span>
              </div>
              <div className="text-xs text-gray-500">
                Statut: {capteur.statut}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
