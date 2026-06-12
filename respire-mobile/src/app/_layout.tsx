import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { Platform, View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import ConsentScreen from '@/screens/ConsentScreen';

function RootNavigator() {
  const { user, loading, consentGiven } = useAuth();
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('register');

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!user) {
    if (authScreen === 'login') {
      return <LoginScreen onSwitch={() => setAuthScreen('register')} />;
    }
    return <RegisterScreen onSwitch={() => setAuthScreen('login')} />;
  }

  if (!consentGiven) return <ConsentScreen />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          paddingTop: 4,
          height: Platform.OS === 'web' ? 56 : 85,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: Platform.OS === 'web' ? 4 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ma dose',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'speedometer' : 'speedometer-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="carte"
        options={{
          title: 'Carte',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="symptoms"
        options={{
          title: 'Santé',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'pulse' : 'pulse-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
