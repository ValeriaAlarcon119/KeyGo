import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  primary: '#1E4FA3',
  yellow: '#F4C430',
  danger: '#E53935',
  dark: '#2B2B2B',
  white: '#FFFFFF',
  background: '#F8F9FB',
};

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KeyGo</Text>
        <Text style={styles.panelTitle}>Panel Propietario</Text>
        <Text style={styles.welcome}>Hola, {user?.full_name}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.statusTitle}>✅ Fase 1 Completa</Text>
        <Text style={styles.statusText}>
          Autenticado como Propietario. Los módulos de llaves se construirán en la Fase 2.
        </Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logo: { color: COLORS.yellow, fontSize: 24, fontWeight: 'bold' },
  panelTitle: { color: COLORS.white, fontSize: 18, marginTop: 4, fontWeight: '600' },
  welcome: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 40, itemsCenter: 'center', justifyContent: 'center' },
  statusTitle: { color: COLORS.dark, fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  statusText: { color: '#6B7280', fontSize: 14, textAlign: 'center', marginTop: 8 },
  logoutButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: COLORS.danger, fontSize: 14, fontWeight: '600' },
});
