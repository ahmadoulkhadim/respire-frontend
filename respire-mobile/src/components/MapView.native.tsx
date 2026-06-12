import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const HOST = 'http://10.0.2.2:3001';
const TILE_URL = `${HOST}?z={z}&x={x}&y={y}`;

function getColor(pm25: number): string {
  if (pm25 < 15) return '#10b981';
  if (pm25 < 35) return '#f59e0b';
  if (pm25 < 50) return '#ef4444';
  return '#7c3aed';
}

function buildHtml(userLat?: number, userLng?: number, userPm25?: number) {
  const hasPos = userLat !== undefined && userLng !== undefined;
  const lat = userLat ?? 14.7167;
  const lng = userLng ?? -17.4677;
  const c = userPm25 !== undefined ? getColor(userPm25) : '#2563eb';

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="${HOST}/leaflet.css">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:100%;height:100%;overflow:hidden;font-family:system-ui,sans-serif}
  #map{width:100%;height:100%}
</style>
</head>
<body>
<div id="map"></div>
<script src="${HOST}/leaflet.js"></script>
<script>
  try{
  var m=L.map('map',{zoomControl:true,attributionControl:false}).setView([${lat},${lng}],13);
  L.tileLayer('${TILE_URL}',{maxZoom:19,tileSize:512,zoomOffset:-1}).addTo(m);
  ${hasPos ? `
  var ic=L.divIcon({html:'<div style="background:${c};width:20px;height:20px;border-radius:50%;border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.2)"></div>',iconSize:[20,20],iconAnchor:[10,10],className:''});
  L.marker([${lat},${lng}],{icon:ic}).addTo(m).bindPopup('<b>${userPm25||'?'} µg/m³</b>');
  ` : ''}
  window.addEventListener('error',function(e){console.error('Map error:',e.message,e.filename,e.lineno);});
  }catch(e){document.body.innerHTML='<pre style="padding:20px;color:red">'+e.message+'</pre>';}
</script>
</body>
</html>`;
}

export default function MapViewNative({ userLat, userLng, userPm25 }: {
  userLat?: number; userLng?: number; userPm25?: number;
}) {
  const isDanger = userPm25 !== undefined && userPm25 > 50;
  const html = useMemo(() => buildHtml(userLat, userLng, userPm25), [userLat, userLng, userPm25]);

  return (
    <View>
      <View style={s.container}>
        <WebView
          style={s.map}
          source={{ html }}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
          originWhitelist={['*']}
        />
      </View>
      {isDanger && (
        <View style={s.alertBar}>
          <Ionicons name="warning" size={14} color="#dc2626" />
          <Text style={s.alertText}>Qualité dangereuse — limite tes déplacements</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { borderRadius: 16, overflow: 'hidden', height: 340 },
  map: { width: '100%', height: 340 },
  alertBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    padding: 10, backgroundColor: '#fef2f2', borderRadius: 10, marginTop: 8,
  },
  alertText: { fontSize: 12, fontWeight: '600', color: '#dc2626', flex: 1 },
});
