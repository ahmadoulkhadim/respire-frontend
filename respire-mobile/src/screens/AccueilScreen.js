import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const AccueilScreen = () => {
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>RESPIRE</Text>
        <Text style={styles.greeting}>Bonjour, Khadim 👋</Text>
      </View>

      {/* Score card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>🚬 TON EXPOSITION DU JOUR</Text>
        <Text style={styles.score}>3,2 cigarettes</Text>
        <Text style={styles.cardSub}>respirées depuis ce matin</Text>
        <Text style={styles.cardSub}>PM2.5 moyen : 47 µg/m³</Text>
      </View>

      {/* Alerte */}
      <View style={styles.alertBanner}>
        <Text style={styles.alertText}>⚠️ Qualité de l'air : MODÉRÉE</Text>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  header: {
    backgroundColor: '#1F4E79',
    padding: 20,
    paddingTop: 40,
  },
  logo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
  },
  greeting: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  score: { fontSize: 32, fontWeight: '700', color: '#c0392b' },
  cardSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  alertBanner: {
    backgroundColor: '#fef3e2',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f5cba7',
  },
  alertText: { color: '#7d4a00', fontWeight: '600', fontSize: 13 },
});

export default AccueilScreen;