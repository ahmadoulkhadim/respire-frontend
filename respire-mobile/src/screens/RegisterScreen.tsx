import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen({ onSwitch }: { onSwitch: () => void }) {
  const { signup } = useAuth();
  const [surnom, setSurnom] = useState('');
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!surnom.trim() || !email.trim() || !mdp.trim()) { setError('Remplis tous les champs'); return; }
    if (mdp.length < 4) { setError('Mot de passe (4 caractères min)'); return; }
    setError('');
    await signup(surnom.trim(), email.trim(), mdp);
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={s.content}>
          <Image source={require('@/assets/images/logo.png')} style={s.logo} />
          <Text style={s.title}>Créer mon compte</Text>
          <Text style={s.sub}>Rejoins RESPIRE pour suivre ta dose de pollution</Text>

          <View style={s.field}>
            <Ionicons name="person-outline" size={18} color="#94a3b8" />
            <TextInput style={s.input} placeholder="Surnom" placeholderTextColor="#94a3b8" value={surnom} onChangeText={setSurnom} autoCapitalize="words" />
          </View>
          <View style={s.field}>
            <Ionicons name="mail-outline" size={18} color="#94a3b8" />
            <TextInput style={s.input} placeholder="Email" placeholderTextColor="#94a3b8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={s.field}>
            <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" />
            <TextInput style={s.input} placeholder="Mot de passe" placeholderTextColor="#94a3b8" value={mdp} onChangeText={setMdp} secureTextEntry />
          </View>

          {error !== '' && <Text style={s.error}>{error}</Text>}

          <TouchableOpacity style={s.btn} onPress={handleSignup}>
            <Text style={s.btnText}>Créer mon compte</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSwitch} style={{ marginTop: 16 }}>
            <Text style={s.link}>Déjà un compte ? <Text style={s.linkBold}>Se connecter</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  logo: { width: 56, height: 56, borderRadius: 14, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  sub: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 6, marginBottom: 32, lineHeight: 18 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  input: { flex: 1, fontSize: 15, color: '#0f172a' },
  error: { fontSize: 12, color: '#dc2626', marginBottom: 8, textAlign: 'center' },
  btn: { backgroundColor: '#2563eb', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  link: { fontSize: 13, color: '#64748b', textAlign: 'center' },
  linkBold: { fontWeight: '700', color: '#2563eb' },
});
