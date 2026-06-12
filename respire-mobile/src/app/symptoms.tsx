import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Sokhna from '@/components/Sokhna';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


const QUESTIONS = [
  { id: 'toux', label: 'Toux aujourd\'hui ?', icon: 'pulse-outline', emoji: '😤' },
  { id: 'respiration', label: 'Difficultés à respirer ?', icon: 'leaf-outline', emoji: '😮‍💨' },
  { id: 'tete', label: 'Maux de tête ?', icon: 'brain-outline', emoji: '🤕' },
  { id: 'fatigue', label: 'Fatigue inhabituelle ?', icon: 'fitness-outline', emoji: '😴' },
];

export default function SymptomsScreen() {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id, value) => {
    setSymptoms(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    const entry = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      symptoms,
      ouiCount,
      mood,
    };
    const existing = await AsyncStorage.getItem('symptoms');
    const list = existing ? JSON.parse(existing) : [];
    list.unshift(entry);
    await AsyncStorage.setItem('symptoms', JSON.stringify(list));
    Alert.alert(
      'Merci !',
      'Votre déclaration a été enregistrée.',
      [{ text: 'OK', onPress: () => { setSubmitted(true); setSymptoms({}); } }]
    );
  };

  const count = Object.keys(symptoms).length;
  const allAnswered = count === QUESTIONS.length;
  const ouiCount = Object.values(symptoms).filter(Boolean).length;
  const mood = ouiCount === 0 ? 'bon' : ouiCount <= 1 ? 'modere' : ouiCount <= 2 ? 'mauvais' : 'danger';

  if (submitted) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.successWrap}>
          <Sokhna mood={mood} size={64} name={user?.surnom || 'Sokhna'} />
          <Text style={s.successTitle}>Merci !</Text>
          <Text style={s.successText}>Ta déclaration a bien été enregistrée.</Text>
          <TouchableOpacity style={s.successBtn} onPress={() => setSubmitted(false)}>
            <Text style={s.successBtnText}>Nouvelle déclaration</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header avec mascotte */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Santé</Text>
            <Text style={s.headerSub}>{user?.surnom || 'Sokhna'}, comment tu te sens ?</Text>
          </View>
          <Sokhna mood={mood} size={32} name={user?.surnom || 'Sokhna'} />
        </View>

        {/* Progression */}
        <View style={s.progress}>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${(count / QUESTIONS.length) * 100}%` }]} />
          </View>
          <Text style={s.progressText}>{count}/{QUESTIONS.length}</Text>
        </View>

        {/* Questions */}
        {QUESTIONS.map((q) => {
          const val = symptoms[q.id];
          return (
            <View key={q.id} style={[s.card, val !== undefined && { borderLeftColor: val ? '#dc2626' : '#10b981', borderLeftWidth: 3 }]}>
              <View style={s.cardRow}>
                <Text style={s.emoji}>{q.emoji}</Text>
                <View style={s.cardInfo}>
                  <Text style={s.cardLabel}>{q.label}</Text>
                </View>
              </View>
              <View style={s.btns}>
                <TouchableOpacity
                  onPress={() => toggle(q.id, true)}
                  style={[s.btn, val === true && s.btnYes]}
                >
                  <Ionicons name={val === true ? 'checkmark-circle' : 'checkmark-circle-outline'} size={14} color={val === true ? '#fff' : '#94a3b8'} />
                  <Text style={[s.btnText, val === true && s.btnTextActive]}>Oui</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggle(q.id, false)}
                  style={[s.btn, val === false && s.btnNo]}
                >
                  <Ionicons name={val === false ? 'close-circle' : 'close-circle-outline'} size={14} color={val === false ? '#fff' : '#94a3b8'} />
                  <Text style={[s.btnText, val === false && s.btnTextActive]}>Non</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={count === 0}
          style={[s.submit, count === 0 && s.submitDisabled, allAnswered && s.submitReady]}
        >
          <Text style={s.submitText}>{allAnswered ? 'Envoyer' : `${count}/${QUESTIONS.length} répondu(s)`}</Text>
        </TouchableOpacity>

        <Text style={s.privacy}>🔒 Données anonymisées</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  headerSub: { fontSize: 12, color: '#64748b', marginTop: 1 },

  progress: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 10, marginBottom: 8,
  },
  progressBar: {
    flex: 1, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 2 },
  progressText: { fontSize: 12, fontWeight: '700', color: '#2563eb' },

  card: {
    marginHorizontal: 12, marginBottom: 6, padding: 10, paddingLeft: 12,
    backgroundColor: '#fff', borderRadius: 10,
    borderLeftWidth: 3, borderLeftColor: '#e2e8f0',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  emoji: { fontSize: 18 },
  cardInfo: { flex: 1 },
  cardLabel: { fontSize: 13, fontWeight: '600', color: '#0f172a' },

  btns: { flexDirection: 'row', gap: 6 },
  btn: {
    flex: 1, flexDirection: 'row',
    paddingVertical: 7, borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center', justifyContent: 'center', gap: 4,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  btnYes: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  btnNo: { backgroundColor: '#10b981', borderColor: '#10b981' },
  btnText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  btnTextActive: { color: '#fff' },

  submit: {
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 12, marginTop: 12, paddingVertical: 10,
    backgroundColor: '#2563eb', borderRadius: 10,
  },
  submitReady: { backgroundColor: '#2563eb' },
  submitDisabled: { backgroundColor: '#94a3b8' },
  submitText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  privacy: { fontSize: 10, color: '#94a3b8', textAlign: 'center', marginTop: 8 },

  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginTop: 12, marginBottom: 6 },
  successText: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 24, lineHeight: 18 },
  successBtn: { backgroundColor: '#1e3a8a', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  successBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
