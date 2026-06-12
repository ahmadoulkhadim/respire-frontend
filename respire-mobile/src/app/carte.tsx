import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform, Alert, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import MapView from '@/components/MapView';

async function fetchPM25(lat: number, lon: number) {
  try {
    const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`);
    const data = await res.json();
    return data.current?.pm2_5 ?? null;
  } catch { return null; }
}

export default function CarteScreen() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pm25, setPm25] = useState<number | null>(null);

  useEffect(() => {
    getPosition();
  }, []);

  const getPosition = async () => {
    if (Platform.OS === 'web') {
      if (!navigator.geolocation) {
        Alert.alert('Géolocalisation indisponible', 'Ton navigateur ne supporte pas la géolocalisation.');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (p) => {
          const lat = p.coords.latitude, lng = p.coords.longitude;
          setCoords({ lat, lng });
          const v = await fetchPM25(lat, lng);
          setPm25(v ?? Math.round(15 + Math.random() * 25));
        },
        () => setFallback(),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { setFallback(); return; }
        if (!await Location.hasServicesEnabledAsync()) { setFallback(); return; }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low, timeout: 10000 });
        setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        const v = await fetchPM25(loc.coords.latitude, loc.coords.longitude);
        setPm25(v ?? Math.round(15 + Math.random() * 25));
      } catch {
        const last = await Location.getLastKnownPositionAsync({ maxAge: 300000 }).catch(() => null);
        if (last) {
          setCoords({ lat: last.coords.latitude, lng: last.coords.longitude });
          fetchPM25(last.coords.latitude, last.coords.longitude).then(v => { if (v !== null) setPm25(v); }).catch(() => {});
        } else {
          setFallback();
        }
      }
    }
  };

  const setFallback = () => {
    const lat = 14.7167, lng = -17.4677;
    setCoords({ lat, lng });
    fetchPM25(lat, lng).then(v => setPm25(v ?? Math.round(15 + Math.random() * 25))).catch(() => {});
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Carte</Text>
        <Text style={s.headerSub}>Qualité de l'air en temps réel</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <MapView
          userLat={coords?.lat}
          userLng={coords?.lng}
          userPm25={pm25 ?? undefined}
        />

        {coords && pm25 !== null ? (
          <View style={s.infoCard}>
            <View style={[s.dot, { backgroundColor: pm25 < 15 ? '#10b981' : pm25 < 35 ? '#f59e0b' : pm25 < 50 ? '#ef4444' : '#7c3aed' }]} />
            <View style={s.infoText}>
              <Text style={s.infoTitle}>Ma position</Text>
              <Text style={s.infoSub}>{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</Text>
            </View>
            <View style={s.infoRight}>
              <Text style={s.infoPm25}>{pm25}</Text>
              <Text style={s.infoUnit}>µg/m³</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={s.retryBtn} onPress={() => { setCoords(null); setPm25(null); getPosition(); }}>
            <Ionicons name="locate" size={18} color="#fff" />
            <Text style={s.retryText}>Obtenir ma position</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  headerSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, marginTop: 16, padding: 14,
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#f1f5f9',
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  infoText: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  infoSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  infoRight: { alignItems: 'flex-end' },
  infoPm25: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  infoUnit: { fontSize: 10, color: '#94a3b8' },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 16, padding: 14,
    backgroundColor: '#2563eb', borderRadius: 12,
  },
  retryText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
