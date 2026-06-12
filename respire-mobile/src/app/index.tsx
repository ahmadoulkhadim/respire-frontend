import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl, Platform, Image, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Sokhna from '@/components/Sokhna';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

const STATUS = { Bon: '#10b981', Modéré: '#f59e0b', Mauvais: '#ef4444', Danger: '#7c3aed' };
const getCig = (pm25) => (pm25 / 125 * 24).toFixed(1);

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function fetchPM25(lat, lon) {
  try {
    const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`);
    const data = await res.json();
    return data.current?.pm2_5 ?? null;
  } catch { return null; }
}

export default function AccueilScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [pm25, setPm25] = useState(43);
  const [refreshing, setRefreshing] = useState(false);
  const [zoneName, setZoneName] = useState('Résidentiel');
  const [coords, setCoords] = useState(null);
  const [distance, setDistance] = useState(0);
  const [gpsTime, setGpsTime] = useState(0);
  const [doseCig, setDoseCig] = useState(0);
  const [gps, setGps] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const prevPos = useRef(null);
  const watchRef = useRef(null);
  const timerRef = useRef(null);
  const lastPm25 = useRef(pm25);

  const cig = getCig(pm25);
  const displayCig = gps ? doseCig.toFixed(1) : cig;
  const doseStatut = gps
    ? doseCig >= 10 ? 'Danger' : doseCig >= 5 ? 'Mauvais' : doseCig >= 2 ? 'Modéré' : 'Bon'
    : pm25 > 50 ? 'Mauvais' : pm25 > 30 ? 'Modéré' : 'Bon';
  const airStatut = pm25 > 70 ? 'Danger' : pm25 > 50 ? 'Mauvais' : pm25 > 30 ? 'Modéré' : 'Bon';
  const statutColor = STATUS[doseStatut];
  const moodMap: Record<string, 'bon' | 'modere' | 'mauvais' | 'danger'> = { Bon: 'bon', Modéré: 'modere', Mauvais: 'mauvais', Danger: 'danger' };
  const mood = moodMap[doseStatut] || 'modere';

  useEffect(() => {
    return () => { stopGps(); };
  }, []);

  const startGps = async () => {
    if (Platform.OS === 'web') {
      setGps(true);
      webGps();
      return;
    }
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsLoading(false);
        Alert.alert('Permission refusée', 'Active la localisation dans les paramètres de ton téléphone pour utiliser le suivi GPS.');
        return;
      }
      const hasServices = await Location.hasServicesEnabledAsync();
      if (!hasServices) {
        setGpsLoading(false);
        Alert.alert('GPS désactivé', 'Active le GPS dans les paramètres rapides de ton téléphone.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low, timeout: 10000 });
      setGpsLoading(false);
      handlePosition(loc.coords.latitude, loc.coords.longitude);
      watchRef.current = await Location.watchPositionAsync({ distanceInterval: 10, timeInterval: 5000 }, (loc) => {
        handlePosition(loc.coords.latitude, loc.coords.longitude);
      });
      setGps(true);
    } catch (e: any) {
      setGpsLoading(false);
      const msg = e?.message || '';
      Alert.alert('Erreur GPS', msg.includes('Network') ? 'Impossible de contacter les services de localisation. Vérifie ta connexion.' : (msg || 'Active le GPS et réessaie.'));
    }
  };

  const webGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((p) => handlePosition(p.coords.latitude, p.coords.longitude));
    watchRef.current = navigator.geolocation.watchPosition((p) => handlePosition(p.coords.latitude, p.coords.longitude), null, { enableHighAccuracy: true, distanceFilter: 10 });
  };

  const handlePosition = async (lat, lon) => {
    setCoords({ lat, lon });
    const realPm25 = await fetchPM25(lat, lon);
    const value = realPm25 ?? Math.round(15 + Math.random() * 25);
    setPm25(value);
    setZoneName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    lastPm25.current = value;
    if (prevPos.current) {
      const d = haversine(prevPos.current.lat, prevPos.current.lon, lat, lon);
      setDistance((prev) => prev + d);
    }
    prevPos.current = { lat, lon };
  };

  const stopGps = () => {
    if (watchRef.current) {
      if (Platform.OS === 'web' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
      watchRef.current = null;
    }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const toggleGps = () => {
    if (gps) {
      stopGps();
      setGps(false);
    } else if (!gpsLoading) {
      startGps();
      setDistance(0);
      setGpsTime(0);
      setDoseCig(0);
      prevPos.current = null;
      timerRef.current = setInterval(() => {
        setGpsTime((t) => t + 1);
        setDoseCig((prev) => prev + lastPm25.current / 125 / 3600 * 24);
      }, 1000);
    }
  };

  const fmtTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h${m}` : `${m}min`;
  };

  const fmtDist = (m) => {
    if (m < 1000) return `${Math.round(m)} m`;
    return `${(m / 1000).toFixed(1)} km`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setPm25(Math.max(5, 43 + Math.round((Math.random() - 0.5) * 10)));
      setRefreshing(false);
    }, 800);
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
      >
        {/* En-tête */}
        <View style={s.header}>
          <Image source={require('@/assets/images/logo.png')} style={s.logo} />
          <View style={s.headerText}>
            <Text style={s.greeting}>Salut {user?.surnom || 'Sokhna'} !</Text>
            <Text style={s.subtitle}>Je surveille l'air que tu respires chaque jour</Text>
          </View>
        </View>

        {/* Score carte principale */}
        <View style={s.scoreWrap}>
          <Sokhna mood={mood} size={64} name={user?.surnom || 'Sokhna'} />
          <View style={{ height: 16 }} />
          <View style={[s.scoreRing, { borderColor: statutColor }]}>
            <Text style={[s.scoreNumber, { color: statutColor }]}>{displayCig}</Text>
            <Text style={s.scoreUnit}>cigarettes</Text>
          </View>
          <Text style={s.scoreLabel}>{gps ? 'Dose accumulée' : 'Exposition aujourd\'hui'}</Text>
          <View style={[s.badge, { backgroundColor: STATUS[airStatut] + '20' }]}>
            <View style={[s.dot, { backgroundColor: STATUS[airStatut] }]} />
            <Text style={[s.badgeText, { color: STATUS[airStatut] }]}>
              Qualité {airStatut.toLowerCase()} — {pm25} µg/m³
            </Text>
          </View>
        </View>

        {/* Alerte si mauvaise qualité */}
        {pm25 > 50 && (
          <View style={s.alertBanner}>
            <Ionicons name="warning" size={16} color="#fff" />
            <Text style={s.alertText}>Air malsain — limitez vos déplacements</Text>
          </View>
        )}

        {/* GPS */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="locate" size={18} color={gps ? '#10b981' : '#94a3b8'} />
            <Text style={s.cardTitle}>Suivi GPS</Text>
            <TouchableOpacity
              onPress={toggleGps}
              disabled={gpsLoading}
              style={[s.toggle, { backgroundColor: gpsLoading ? '#fef3c7' : gps ? '#d1fae5' : '#f1f5f9' }]}
            >
              <Text style={[s.toggleText, { color: gpsLoading ? '#92400e' : gps ? '#065f46' : '#94a3b8' }]}>
                {gpsLoading ? 'Recherche...' : gps ? 'Activé' : 'Désactivé'}
              </Text>
            </TouchableOpacity>
          </View>
          {gps && (
            <View style={s.gpsBody}>
              <View style={s.gpsRow}>
                <Ionicons name="footsteps-outline" size={14} color="#64748b" />
                <Text style={s.gpsLabel}>Distance</Text>
                <Text style={s.gpsValue}>{fmtDist(distance)}</Text>
              </View>
              <View style={s.gpsRow}>
                <Ionicons name="time-outline" size={14} color="#64748b" />
                <Text style={s.gpsLabel}>Temps exposé</Text>
                <Text style={s.gpsValue}>{fmtTime(gpsTime)}</Text>
              </View>
              <View style={s.gpsRow}>
                <Ionicons name="pulse-outline" size={14} color="#64748b" />
                <Text style={s.gpsLabel}>Dose reçue</Text>
                <Text style={s.gpsValue}>{doseCig.toFixed(1)} cig.</Text>
              </View>
              {coords && (
                <View style={s.gpsRow}>
                  <Ionicons name="earth-outline" size={14} color="#64748b" />
                  <Text style={s.gpsLabel}>Position</Text>
                  <Text style={s.gpsValue}>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Rappel symptômes */}
        <TouchableOpacity style={s.rappel} onPress={() => router.push('/symptoms')}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#2563eb" />
          <Text style={s.rappelText}>Comment vous sentez-vous aujourd'hui ?</Text>
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        </TouchableOpacity>

        {/* Barre zone actuelle */}
        <View style={s.zoneBar}>
          <Text style={s.zoneLabel}>Zone actuelle</Text>
          <Text style={s.zoneName}>{zoneName}</Text>
          <Text style={s.zonePm25}>{pm25} µg/m³</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingLeft: 16, paddingRight: 20, paddingTop: 12, paddingBottom: 8,
  },
  headerText: { flex: 1 },
  greeting: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 1, lineHeight: 16 },
  logo: {
    width: 48, height: 48, borderRadius: 14,
  },
  logoText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  scoreWrap: { alignItems: 'center', paddingVertical: 24 },
  scoreRing: {
    width: 140, height: 140, borderRadius: 70, borderWidth: 4,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  scoreNumber: { fontSize: 36, fontWeight: '800' },
  scoreUnit: { fontSize: 11, color: '#64748b', marginTop: 2, textTransform: 'uppercase' },
  scoreLabel: { fontSize: 13, color: '#64748b', fontWeight: '600', marginBottom: 12 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, padding: 14, borderRadius: 14,
    backgroundColor: '#dc2626',
  },
  alertText: { fontSize: 13, fontWeight: '600', color: '#fff', flex: 1 },
  card: {
    marginHorizontal: 20, marginTop: 16, padding: 16,
    backgroundColor: '#fff', borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: '#0f172a' },
  toggle: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  toggleText: { fontSize: 11, fontWeight: '700' },
  gpsBody: { borderTopWidth: 1, borderTopColor: '#f1f5f9', marginTop: 12, paddingTop: 8 },
  gpsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  gpsLabel: { flex: 1, fontSize: 13, color: '#64748b' },
  gpsValue: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  rappel: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, marginTop: 16, padding: 16,
    backgroundColor: '#eff6ff', borderRadius: 14,
  },
  rappelText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1e40af' },
  zoneBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 16, padding: 16,
    backgroundColor: '#fff', borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  zoneLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase' },
  zoneName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0f172a' },
  zonePm25: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
});
