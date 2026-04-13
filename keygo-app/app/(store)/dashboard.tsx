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
};

export default function StoreDashboard() {
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

  const firstName = user?.full_name?.split(' ')[0] || 'Tienda';

  const mainActions = [
    { emoji: '📥', label: 'Depositar\nLlave', color: COLORS.primary, textColor: COLORS.white, tag: 'Fase 2' },
    { emoji: '📤', label: 'Entregar\nLlave', color: COLORS.yellow, textColor: COLORS.primary, tag: 'Fase 2' },
  ];

  const secondaryActions = [
    { emoji: '🔍', label: 'Chequeo Llaves', desc: 'Escanea llaves para verificar inventario', tag: 'Fase 2', color: '#EFF6FF', border: '#C7D7F9' },
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
              <Text style={styles.roleBadgeText}>🏪 Punto aliado</Text>
            </View>
          </Animated.View>
        </View>
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
              <Text style={styles.phaseBannerSub}>Tu acceso al panel está activo</Text>
            </View>
          </View>
          <View style={styles.phaseBadge}>
            <Text style={styles.phaseBadgeText}>✅ Activo</Text>
          </View>
        </Animated.View>

        {/* Keys count */}
        <View style={styles.keysCountCard}>
          <View style={styles.keysCountLeft}>
            <Text style={styles.keysCountNum}>—</Text>
            <Text style={styles.keysCountLabel}>Llaves en tienda</Text>
          </View>
          <View style={styles.keysCountIcon}>
            <Text style={{ fontSize: 36 }}>🗝️</Text>
          </View>
        </View>

        {/* Main action buttons */}
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.mainActionsRow}>
          {mainActions.map(a => (
            <TouchableOpacity
              key={a.label}
              style={[styles.mainActionBtn, { backgroundColor: a.color }]}
              activeOpacity={0.85}
            >
              <Text style={styles.mainActionEmoji}>{a.emoji}</Text>
              <Text style={[styles.mainActionLabel, { color: a.textColor }]}>{a.label}</Text>
              <View style={[styles.mainActionTag, { backgroundColor: 'rgba(0,0,0,0.12)' }]}>
                <Text style={[styles.mainActionTagText, { color: a.textColor }]}>{a.tag}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Secondary actions */}
        {secondaryActions.map(a => (
          <TouchableOpacity
            key={a.label}
            style={[styles.secondaryBtn, { backgroundColor: a.color, borderColor: a.border }]}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryEmoji}>{a.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.secondaryLabel}>{a.label}</Text>
              <Text style={styles.secondaryDesc}>{a.desc}</Text>
            </View>
            <View style={styles.secondaryTagWrap}>
              <Text style={styles.secondaryTag}>{a.tag}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🚀 Lo que viene en Fase 3</Text>
          <Text style={styles.infoText}>
            Podrás validar códigos de depósito y recogida, escanear llaveros NFC, 
            y registrar movimientos de llaves directamente desde este panel.
          </Text>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>KeyGo v1.0 · Fase 1</Text>

        {/* Bottom nav area */}
        <View style={styles.bottomNav}>
          <View style={styles.bottomNavItem}>
            <Text style={styles.bottomNavIcon}>🏠</Text>
            <Text style={styles.bottomNavLabel}>Inicio</Text>
          </View>
        </View>
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
    paddingBottom: 100,
    alignItems: isDesktop ? 'center' : undefined,
    maxWidth: isDesktop ? 600 : undefined,
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
    marginBottom: 16,
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

  // Keys count card
  keysCountCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8EEFF',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  keysCountLeft: {},
  keysCountNum: { fontSize: 48, fontWeight: '900', color: COLORS.primary, lineHeight: 52 },
  keysCountLabel: { fontSize: 14, color: COLORS.gray, fontWeight: '600' },
  keysCountIcon: {},

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 12,
    letterSpacing: 0.3,
  },

  // Main action buttons
  mainActionsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  mainActionBtn: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  mainActionEmoji: { fontSize: 32 },
  mainActionLabel: { fontSize: 14, fontWeight: '800', textAlign: 'center', lineHeight: 18 },
  mainActionTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  mainActionTagText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  // Secondary actions
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    gap: 14,
  },
  secondaryEmoji: { fontSize: 28 },
  secondaryLabel: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  secondaryDesc: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  secondaryTagWrap: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  secondaryTag: { color: COLORS.primary, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  // Info card
  infoCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  infoTitle: { fontSize: 15, fontWeight: '800', color: '#C2410C', marginBottom: 8 },
  infoText: { fontSize: 13, color: '#92400E', lineHeight: 20 },

  // Logout
  logoutBtn: {
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    marginBottom: 12,
  },
  logoutText: { color: COLORS.danger, fontSize: 15, fontWeight: '700' },
  versionText: { textAlign: 'center', color: COLORS.lightGray, fontSize: 11, marginBottom: 16 },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8EEFF',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginTop: 8,
  },
  bottomNavItem: { alignItems: 'center', gap: 4 },
  bottomNavIcon: { fontSize: 22 },
  bottomNavLabel: { fontSize: 11, color: COLORS.primary, fontWeight: '700' },
});
