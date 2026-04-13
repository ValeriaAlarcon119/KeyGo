import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [user]);

  const firstName = user?.full_name?.split(' ')[0] || 'Admin';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoMark}>
            <View style={styles.logoPin}><View style={styles.logoPinKey} /></View>
          </View>
          <Text style={styles.logoText}>
            <Text style={styles.logoKey}>Key</Text>
            <Text style={styles.logoGo}>Go</Text>
          </Text>
        </View>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.greetingSmall}>Panel de Control</Text>
          <Text style={styles.greetingName}>Hola, {firstName} 🛡️</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>⚙️ Administrador</Text>
          </View>
        </Animated.View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.phaseBanner, { opacity: fadeAnim }]}>
          <Text style={styles.phaseBannerEmoji}>🎉</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.phaseBannerTitle}>Fase 1 completada</Text>
            <Text style={styles.phaseBannerSub}>Acceso de administrador activo y verificado</Text>
          </View>
          <View style={styles.phaseBadge}><Text style={styles.phaseBadgeText}>✅ Activo</Text></View>
        </Animated.View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🚀 Panel Administrativo completo — Fase 5</Text>
          <Text style={styles.infoText}>
            Desde aquí podrás gestionar todos los usuarios, llaves, puntos aliados, pagos e historial completo del sistema.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
        <Text style={styles.version}>KeyGo v1.0 · Fase 1</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  header: {
    backgroundColor: '#1E4FA3',
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  logoMark: { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  logoPin: { width: 16, height: 20, backgroundColor: '#F4C430', borderRadius: 8, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, alignItems: 'center', justifyContent: 'center' },
  logoPinKey: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1E4FA3' },
  logoText: { fontSize: 28, fontWeight: '800' },
  logoKey: { color: '#FFFFFF' },
  logoGo: { color: '#F4C430' },
  greetingSmall: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  greetingName: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 2 },
  roleBadge: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 16 },
  roleBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  phaseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  phaseBannerEmoji: { fontSize: 32 },
  phaseBannerTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  phaseBannerSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  phaseBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  phaseBadgeText: { color: '#16A34A', fontSize: 12, fontWeight: '700' },
  infoCard: { backgroundColor: '#EFF6FF', borderRadius: 18, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#C7D7F9' },
  infoTitle: { fontSize: 15, fontWeight: '800', color: '#1E4FA3', marginBottom: 8 },
  infoText: { fontSize: 13, color: '#3B5CA8', lineHeight: 20 },
  logoutBtn: { borderWidth: 1.5, borderColor: '#FECACA', borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: '#FFF5F5', marginBottom: 12 },
  logoutText: { color: '#E53935', fontSize: 15, fontWeight: '700' },
  version: { textAlign: 'center', color: '#9CA3AF', fontSize: 11 },
});
