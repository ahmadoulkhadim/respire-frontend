import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

export default function ConsentScreen() {
  const { consent } = useAuth();

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <Image source={require('@/assets/images/logo.png')} style={s.logo} />

        <Text style={s.title}>Suivi de ta santé</Text>
        <Text style={s.sub}>Avant de commencer, voici comment ça fonctionne</Text>

        <View style={s.cards}>
          <View style={s.card}>
            <View style={[s.iconBox, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="locate" size={22} color="#2563eb" />
            </View>
            <View style={s.cardText}>
              <Text style={s.cardTitle}>Suivi GPS</Text>
              <Text style={s.cardSub}>Nous suivons ta position pour calculer ton exposition à la pollution</Text>
            </View>
          </View>

          <View style={s.card}>
            <View style={[s.iconBox, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="shield-checkmark" size={22} color="#10b981" />
            </View>
            <View style={s.cardText}>
              <Text style={s.cardTitle}>Données anonymisées</Text>
              <Text style={s.cardSub}>Tes données sont anonymes et ne sont jamais partagées sans ton accord</Text>
            </View>
          </View>

          <View style={s.card}>
            <View style={[s.iconBox, { backgroundColor: '#fef2f2' }]}>
              <Ionicons name="pulse" size={22} color="#dc2626" />
            </View>
            <View style={s.cardText}>
              <Text style={s.cardTitle}>Déclarations symptômes</Text>
              <Text style={s.cardSub}>Tu peux déclarer tes symptômes pour aider la recherche</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={s.btn} onPress={consent}>
          <Text style={s.btnText}>Accepter et continuer</Text>
        </TouchableOpacity>

        <Text style={s.footer}>
          En acceptant, tu confirmes avoir compris comment nous utilisons tes données
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  logo: { width: 56, height: 56, borderRadius: 14, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  sub: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 6, marginBottom: 32, lineHeight: 18 },
  cards: { gap: 12, marginBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', padding: 14, borderRadius: 14 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  cardSub: { fontSize: 12, color: '#64748b', marginTop: 2, lineHeight: 16 },
  btn: { backgroundColor: '#2563eb', borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  footer: { fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 12, lineHeight: 16 },
});
