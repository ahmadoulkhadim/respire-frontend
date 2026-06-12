import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import 'leaflet/dist/leaflet.css';
import { Ionicons } from '@expo/vector-icons';

function getColor(pm25: number): string {
  if (pm25 < 15) return '#10b981';
  if (pm25 < 35) return '#f59e0b';
  if (pm25 < 50) return '#ef4444';
  return '#7c3aed';
}

export default function MapViewWeb({ userLat, userLng, userPm25, history }: {
  userLat?: number; userLng?: number; userPm25?: number;
  history?: { lat: number; lng: number; pm25: number }[];
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapInstance.current || !mapRef.current || typeof window === 'undefined') return;

    (async () => {
      const L = await import('leaflet');

      const startLat = userLat || 48.8566;
      const startLng = userLng || 2.3522;
      const map = L.default.map(mapRef.current, {
        center: [startLat, startLng],
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });

      L.default.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      if (userLat && userLng && userPm25 !== undefined) {
        const c = getColor(userPm25);
        L.default.circle([userLat, userLng], {
          radius: userPm25 * 20,
          color: c,
          fillColor: c,
          fillOpacity: 0.08,
          weight: 2,
        }).addTo(map);

        L.default.circleMarker([userLat, userLng], {
          radius: 10,
          color: '#fff',
          weight: 2.5,
          fillColor: c,
          fillOpacity: 0.9,
        }).addTo(map).bindPopup(`
          <div style="font-family:system-ui,sans-serif;width:200px;padding:2px 0">
            <div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:2px">Ma position</div>
            <hr style="margin:4px 0;border:none;border-top:1px solid #e5e7eb">
            <div style="margin:6px 0;display:flex;align-items:center;gap:6px">
              <span style="display:inline-block;width:10px;height:10px;border-radius:5px;background:${c}"></span>
              <span style="font-weight:600;color:${c}">${userPm25} µg/m³</span>
            </div>
            <table style="width:100%;font-size:12px;border-collapse:collapse">
              <tr><td style="padding:2px 0;color:#555">PM2.5</td><td style="text-align:right;font-weight:700">${userPm25} µg/m³</td></tr>
              <tr><td style="padding:2px 0;color:#555">🚬 Équivalent cigarettes</td><td style="text-align:right;font-weight:700">${(userPm25 / 125 * 24).toFixed(1)}/j</td></tr>
            </table>
          </div>
        `);

        L.default.marker([userLat, userLng], {
          icon: L.default.divIcon({
            html: `<div style="font-size:9px;font-weight:700;color:#fff;background:${c};padding:2px 6px;border-radius:8px;white-space:nowrap">${userPm25}</div>`,
            iconSize: [40, 18],
            iconAnchor: [20, -22],
            className: '',
          }),
        }).addTo(map);
      }

      if (history && history.length > 0) {
        const pts = history.map(h => [h.lat, h.lng] as [number, number]);
        L.default.polyline(pts, { color: '#2563eb', weight: 2, opacity: 0.4 }).addTo(map);
        history.forEach((h) => {
          const c = getColor(h.pm25);
          L.default.circleMarker([h.lat, h.lng], {
            radius: 5, color: c, weight: 1, fillColor: c, fillOpacity: 0.6,
          }).addTo(map);
        });
      }

      const legend = L.default.control({ position: 'bottomleft' });
      legend.onAdd = () => {
        const div = L.default.DomUtil.create('div', '');
        div.innerHTML = `
          <div style="background:#ffffff;padding:8px 12px;border-radius:10px;box-shadow:0 1px 6px rgba(0,0,0,0.12);font-size:11px;line-height:1.7;font-family:system-ui,sans-serif;border:1px solid #f1f5f9">
            <b style="font-size:12px;display:block;margin-bottom:2px">Qualité de l'air</b>
            <span><span style="color:#10b981">●</span> Bon &lt;15</span><br>
            <span><span style="color:#f59e0b">●</span> Modéré 15–35</span><br>
            <span><span style="color:#ef4444">●</span> Mauvais 35–50</span><br>
            <span><span style="color:#7c3aed">●</span> Danger &gt;50</span>
          </div>`;
        return div;
      };
      legend.addTo(map);

      setTimeout(() => map.invalidateSize(), 150);
      mapInstance.current = map;

      return () => {
        map.remove();
        mapInstance.current = null;
      };
    })();
  }, [userLat, userLng, userPm25]);

  const isDanger = userPm25 !== undefined && userPm25 > 50;
  const isBad = userPm25 !== undefined && userPm25 > 35;

  return (
    <View>
      <View style={s.container}>
        <div ref={mapRef} style={{ width: '100%', height: 340 }} />
      </View>
      {isDanger && (
        <View style={s.alertBar}>
          <Ionicons name="warning" size={14} color="#dc2626" />
          <Text style={s.alertText}>Qualité dangereuse — limite tes déplacements</Text>
        </View>
      )}
      {!isDanger && isBad && (
        <View style={[s.alertBar, { backgroundColor: '#fffbeb' }]}>
          <Ionicons name="alert-circle" size={14} color="#d97706" />
          <Text style={[s.alertText, { color: '#92400e' }]}>Qualité malsaine</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { borderRadius: 16, overflow: 'hidden', height: 340 },
  alertBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    padding: 10, backgroundColor: '#fef2f2', borderRadius: 10, marginTop: 8,
  },
  alertText: { fontSize: 12, fontWeight: '600', color: '#dc2626', flex: 1 },
});
