import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const isDesktop = width > 768;

const COLORS = {
  primary: '#1E4FA3',
  yellow: '#F4C430',
  danger: '#E53935',
  success: '#10B981',
  dark: '#1F2937',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  background: '#F0F4FF',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
};

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [user]);

  const firstName = user?.full_name?.split(' ')[0] || 'Propietario';

  const quickStats = [
    { label: 'Llaves activas', value: '—', emoji: '🔑', color: '#EFF6FF', border: '#C7D7F9' },
    { label: 'En custodia', value: '—', emoji: '🏪', color: '#F0FDF4', border: '#BBF7D0' },
    { label: 'En uso', value: '—', emoji: '🚶', color: '#FFF7ED', border: '#FED7AA' },
  ];

  const phase2Actions = [
    { emoji: '➕', label: 'Nueva llave', desc: 'Registra y custodia una llave', tag: 'Fase 2' },
    { emoji: '📋', label: 'Mis llaves', desc: 'Ver estado de todas tus llaves', tag: 'Fase 2' },
    { emoji: '🔐', label: 'Códigos', desc: 'Generar códigos de recogida', tag: 'Fase 2' },
    { emoji: '📊', label: 'Historial', desc: 'Consulta todos los movimientos', tag: 'Fase 2' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <View style={styles.logoPin}>
                <View style={styles.logoPinKey} />
              </View>
            </View>
            <Text style={styles.logoText}>
              <Text style={styles.logoKey}>Key</Text>
              <Text style={styles.logoGo}>Go</Text>
            </Text>
          </View>

          {/* Greeting */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.greetingSmall}>{greeting},</Text>
            <Text style={styles.greetingName}>{firstName} 👋</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>🏠 Propietario de llave</Text>
            </View>
          </Animated.View>
        </View>

        {/* Wave decoration */}
        <View style={styles.headerWave} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Phase 1 complete banner */}
        <Animated.View style={[styles.phaseBanner, { opacity: fadeAnim }]}>
          <View style={styles.phaseBannerLeft}>
            <Text style={styles.phaseBannerEmoji}>🎉</Text>
            <View>
              <Text style={styles.phaseBannerTitle}>Fase 1 completada</Text>
              <Text style={styles.phaseBannerSub}>Autenticación y acceso activos</Text>
            </View>
          </View>
          <View style={styles.phaseBadge}>
            <Text style={styles.phaseBadgeText}>✅ Activo</Text>
          </View>
        </Animated.View>

        {/* Stats row */}
        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.statsRow}>
          {quickStats.map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: s.color, borderColor: s.border }]}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Coming soon actions */}
        <Text style={styles.sectionTitle}>Módulos del sistema</Text>
        <View style={styles.actionsGrid}>
          {phase2Actions.map(a => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => {}}
            >
              <View style={styles.actionHeader}>
                <Text style={styles.actionEmoji}>{a.emoji}</Text>
                <View style={styles.actionTagWrap}>
                  <Text style={styles.actionTag}>{a.tag}</Text>
                </View>
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
              <Text style={styles.actionDesc}>{a.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🚀 Próximamente en Fase 2</Text>
          <Text style={styles.infoText}>
            Podrás crear llaves virtuales, asignarlas a puntos aliados, generar códigos de depósito y recogida,
            y controlar todo desde aquí.
          </Text>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>KeyGo v1.0 · Fase 1</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 50,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerInner: { paddingHorizontal: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  logoMark: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPin: {
    width: 16,
    height: 20,
    backgroundColor: COLORS.yellow,
    borderRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPinKey: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  logoText: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  logoKey: { color: COLORS.white },
  logoGo: { color: COLORS.yellow },
  greetingSmall: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500' },
  greetingName: { color: COLORS.white, fontSize: 28, fontWeight: '800', marginTop: 2 },
  roleBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  roleBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  headerWave: {
    position: 'absolute',
    bottom: -30,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(244,196,48,0.1)',
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: isDesktop ? 40 : 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: isDesktop ? 'center' : undefined,
    maxWidth: isDesktop ? 700 : undefined,
    alignSelf: isDesktop ? 'center' : undefined,
    width: isDesktop ? '100%' : undefined,
  },

  // Phase banner
  phaseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  phaseBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  phaseBannerEmoji: { fontSize: 32 },
  phaseBannerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.dark },
  phaseBannerSub: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  phaseBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  phaseBadgeText: { color: '#16A34A', fontSize: 12, fontWeight: '700' },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 12,
    letterSpacing: 0.3,
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    gap: 4,
  },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.dark },
  statLabel: { fontSize: 11, color: COLORS.gray, textAlign: 'center', fontWeight: '500' },

  // Actions grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    width: (width > 768 ? 340 : (width - 52)) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  actionEmoji: { fontSize: 28 },
  actionTagWrap: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  actionTag: { color: '#C2410C', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  actionLabel: { fontSize: 15, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
  actionDesc: { fontSize: 12, color: COLORS.gray, lineHeight: 17 },

  // Info card
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C7D7F9',
  },
  infoTitle: { fontSize: 15, fontWeight: '800', color: COLORS.primary, marginBottom: 8 },
  infoText: { fontSize: 13, color: '#3B5CA8', lineHeight: 20 },

  // Logout
  logoutBtn: {
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    marginBottom: 16,
  },
  logoutText: { color: COLORS.danger, fontSize: 15, fontWeight: '700' },

  versionText: { textAlign: 'center', color: COLORS.lightGray, fontSize: 11 },
});
