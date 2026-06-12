import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Mood = 'bon' | 'modere' | 'mauvais' | 'danger';

const COLORS: Record<Mood, string> = {
  bon: '#10b981',
  modere: '#f59e0b',
  mauvais: '#ef4444',
  danger: '#7c3aed',
};

export default function Sokhna({ mood = 'bon', size = 80, name = 'Sokhna' }: { mood?: Mood; size?: number; name?: string }) {
  const color = COLORS[mood] || COLORS.bon;
  const r = size * 0.45;
  const eyeR = size * 0.05;
  const happy = mood === 'bon';
  const sad = mood === 'mauvais' || mood === 'danger';

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {/* Cercle de fond */}
        <View style={{ width: size * 0.9, height: size * 0.9, borderRadius: size * 0.45, backgroundColor: color + '10' }} />
        
        {/* Visage */}
        <View style={{
          width: r * 2, height: r * 2, borderRadius: r,
          backgroundColor: '#fff', borderWidth: 2, borderColor: color,
          alignItems: 'center', justifyContent: 'center', position: 'absolute',
        }}>
          {/* Yeux */}
          <View style={{ position: 'absolute', top: r * 0.5, flexDirection: 'row', gap: r * 0.6 }}>
            <View style={{ width: eyeR * 2, height: eyeR * 2, borderRadius: eyeR, backgroundColor: color }} />
            <View style={{ width: eyeR * 2, height: eyeR * 2, borderRadius: eyeR, backgroundColor: color }} />
          </View>

          {/* Bouche */}
          {happy ? (
            <View style={{ position: 'absolute', bottom: r * 0.35, width: r * 0.5, height: r * 0.25, borderBottomLeftRadius: r * 0.25, borderBottomRightRadius: r * 0.25, borderWidth: 2, borderColor: color, borderTopWidth: 0 }} />
          ) : sad ? (
            <View style={{ position: 'absolute', bottom: r * 0.35, width: r * 0.5, height: r * 0.25, borderTopLeftRadius: r * 0.25, borderTopRightRadius: r * 0.25, borderWidth: 2, borderColor: color, borderBottomWidth: 0 }} />
          ) : (
            <View style={{ position: 'absolute', bottom: r * 0.45, width: r * 0.4, height: 2, backgroundColor: color, borderRadius: 1 }} />
          )}
        </View>
      </View>
      {name && <Text style={[s.name, { color }]}>{name}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  name: { fontSize: 11, fontWeight: '600', marginTop: 6 },
});
