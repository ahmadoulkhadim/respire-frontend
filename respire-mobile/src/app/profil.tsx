import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Sokhna from '@/components/Sokhna';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function getWeekKey(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default function ProfilScreen() {
  const { user, logout } = useAuth();
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<Record<string, { cig: number; distance: number; time: number }>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const sym = await AsyncStorage.getItem('symptoms');
    if (sym) setSymptoms(JSON.parse(sym));
    const dd = await AsyncStorage.getItem('dailyData');
    if (dd) setDailyData(JSON.parse(dd));
  };

  const weekKey = getWeekKey(new Date());
  const weekDays = DAYS.map((_, i) => {
    const d = new Date(weekKey);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    return { label: DAYS[i], key, data: dailyData[key] || null };
  });
  const weekCigs = weekDays.map(w => w.data?.cig ?? 0);
  const maxCig = Math.max(...weekCigs, 1);
  const totalWeek = weekCigs.reduce((a, b) => a + b, 0);
  const avgWeek = totalWeek / 7;
  const todayKey = new Date().toISOString().split('T')[0];
  const today = dailyData[todayKey];
  const todayCig = today?.cig ?? 0;
  const todayDist = today?.distance ?? 0;
  const todayTime = today?.time ?? 0;

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h${m}` : `${m}min`;
  };

  const fmtDist = (m: number) => {
    if (m < 1000) return `${Math.round(m)} m`;
    return `${(m / 1000).toFixed(1)} km`;
  };

  const latestSym = symptoms[0];
  const moodLabel = latestSym?.mood || 'bon';

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Tu veux vraiment te déconnecter ?')) logout();
    } else {
      Alert.alert('Déconnexion', 'Tu veux vraiment te déconnecter ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: logout },
      ]);
    }
  };

  const todaySymCount = symptoms.filter(s => s.date === todayKey).length;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.headerRow}>
            <View>
              <Text style={s.headerTitle}>Mon profil</Text>
              <Text style={s.headerSub}>{user?.surnom || 'Historique personnel'}</Text>
            </View>
            <Sokhna mood={moodLabel as any} size={44} name={user?.surnom || 'Sokhna'} />
          </View>
        </View>

        {/* Carte résumé */}
        <View style={s.summary}>
          <View style={s.summaryRow}>
            <View style={s.summaryItem}>
              <Text style={s.summaryValue}>{avgWeek.toFixed(1)}</Text>
              <Text style={s.summaryLabel}>moy./jour</Text>
            </View>
            <View style={s.divider} />
            <View style={s.summaryItem}>
              <Text style={s.summaryValue}>{maxCig.toFixed(1)}</Text>
              <Text style={s.summaryLabel}>pic</Text>
            </View>
            <View style={s.divider} />
            <View style={s.summaryItem}>
              <Text style={s.summaryValue}>{totalWeek.toFixed(1)}</Text>
              <Text style={s.summaryLabel}>total</Text>
            </View>
          </View>
        </View>

        {/* Graphique semaine */}
        <View style={s.chartCard}>
          <View style={s.chartHeader}>
            <Text style={s.chartTitle}>Cette semaine</Text>
            <Text style={s.chartUnit}>cigarettes</Text>
          </View>
          <View style={s.chart}>
            {weekDays.map((w, i) => {
              const v = w.data?.cig ?? 0;
              const pct = (v / maxCig) * 100;
              const isToday = w.key === todayKey;
              return (
                <View key={w.label} style={s.barCol}>
                  <View style={s.barValueWrap}>
                    <Text style={[s.barValue, isToday && s.barValueMax]}>{v.toFixed(1)}</Text>
                  </View>
                  <View style={[s.barTrack, isToday && { opacity: 1 }]}>
                    <View style={[s.barFill, { height: `${Math.max(pct, 2)}%`, opacity: isToday ? 1 : 0.5 }]} />
                  </View>
                  <Text style={[s.barLabel, isToday && s.barLabelMax]}>{w.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Aujourd'hui */}
        {today && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Aujourd'hui</Text>
            <View style={s.statRow}>
              <Ionicons name="footsteps-outline" size={15} color="#64748b" />
              <Text style={s.statLabel}>Distance</Text>
              <Text style={s.statValue}>{fmtDist(todayDist)}</Text>
            </View>
            <View style={s.statRow}>
              <Ionicons name="time-outline" size={15} color="#64748b" />
              <Text style={s.statLabel}>Temps exposé</Text>
              <Text style={s.statValue}>{fmtTime(todayTime)}</Text>
            </View>
            <View style={s.statRow}>
              <Ionicons name="pulse-outline" size={15} color="#64748b" />
              <Text style={s.statLabel}>Dose estimée</Text>
              <Text style={s.statValue}>{todayCig.toFixed(1)} cigarettes</Text>
            </View>
            {todaySymCount > 0 && (
              <View style={s.statRow}>
                <Ionicons name="medical" size={15} color="#64748b" />
                <Text style={s.statLabel}>Symptômes</Text>
                <Text style={s.statValue}>{todaySymCount} déclaration(s)</Text>
              </View>
            )}
          </View>
        )}

        {/* Symptômes récents */}
        {symptoms.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Dernières déclarations</Text>
            {symptoms.slice(0, 5).map((s, i) => {
              const icons: Record<string, string> = { bon: 'happy-outline', modere: 'alert-circle-outline', mauvais: 'warning-outline', danger: 'skull-outline' };
              return (
                <View key={i} style={[s.symRow, i > 0 && { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10, marginTop: 10 }]}>
                  <Ionicons name={icons[s.mood] || 'ellipse'} size={16} color={s.mood === 'bon' ? '#10b981' : s.mood === 'modere' ? '#f59e0b' : s.mood === 'danger' ? '#7c3aed' : '#ef4444'} />
                  <Text style={s.symDate}>{s.date}</Text>
                  <Text style={s.symMood}>{s.ouiCount} symptôme(s)</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Déconnexion */}
        <TouchableOpacity style={s.logout} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={16} color="#dc2626" />
          <Text style={s.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={s.version}>RESPIRE v1.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const ACCENT = '#2563eb';

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  summary: {
    marginHorizontal: 20, marginTop: 16, paddingVertical: 20,
    backgroundColor: '#fff', borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '800', color: ACCENT },
  summaryLabel: { fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: '500' },
  divider: { width: 1, height: 30, backgroundColor: '#f1f5f9' },
  chartCard: {
    marginHorizontal: 20, marginTop: 16, padding: 20,
    backgroundColor: '#fff', borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    marginBottom: 24,
  },
  chartTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  chartUnit: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160 },
  barCol: { alignItems: 'center', flex: 1, gap: 6, height: '100%', justifyContent: 'flex-end' },
  barValueWrap: { height: 16, justifyContent: 'center' },
  barValue: { fontSize: 10, fontWeight: '600', color: '#94a3b8' },
  barValueMax: { color: ACCENT, fontSize: 11 },
  barTrack: { width: 24, flex: 1, justifyContent: 'flex-end', maxHeight: 90 },
  barFill: { width: '100%', backgroundColor: ACCENT, borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '500' },
  barLabelMax: { color: ACCENT, fontWeight: '700' },
  card: {
    marginHorizontal: 20, marginTop: 16, padding: 20,
    backgroundColor: '#fff', borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  statLabel: { flex: 1, fontSize: 13, color: '#64748b' },
  statValue: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  symRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  symDate: { fontSize: 12, fontWeight: '600', color: '#64748b', width: 90 },
  symMood: { fontSize: 12, color: '#0f172a', fontWeight: '500' },
  logout: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginHorizontal: 20, marginTop: 24, paddingVertical: 14,
    backgroundColor: '#fef2f2', borderRadius: 12, borderWidth: 1, borderColor: '#fecaca',
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: '#dc2626' },
  version: { fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 12 },
});
