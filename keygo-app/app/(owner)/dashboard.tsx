import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { keyService, Key } from '../../services/key.service';
import { storeService, Store } from '../../services/store.service';

const { width } = Dimensions.get('window');

// ── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  primary:    '#1E4FA3',
  yellow:     '#F4C430',
  bg:         '#F6F8FF',
  white:      '#FFFFFF',
  textDark:   '#0F172A',
  textGray:   '#64748B',
  success:    '#10B981',
  warning:    '#F59E0B',
  danger:     '#EF4444',
  border:     '#E2E8F0',
};

// ── Estado visual de cada llave ───────────────────────────────────────────────
const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  WAITING_DEPOSIT: { label: 'Esperando depósito', color: '#94A3B8', bg: '#F1F5F9' },
  DEPOSITED:       { label: 'En tienda',           color: C.success,  bg: '#ECFDF5' },
  IN_USE:          { label: 'En uso',              color: C.warning,  bg: '#FFFBEB' },
  DELETED:         { label: 'Eliminada',           color: C.danger,   bg: '#FEF2F2' },
};

// ── KeyCard ───────────────────────────────────────────────────────────────────
function KeyCard({ item, onPress, index }: { item: Key; onPress: () => void; index: number }) {
  const s = STATUS[item.key_status] ?? STATUS.WAITING_DEPOSIT;
  // Alternates: even index = yellow, odd index = blue
  const isYellow = index % 2 === 0;
  const keyColor = isYellow ? C.yellow : C.primary;
  const keyBg   = isYellow ? '#FFF8E1' : '#EEF2FF';

  return (
    <TouchableOpacity style={cardStyle.wrap} onPress={onPress} activeOpacity={0.75}>
      {/* Ícono de llave con color alternado */}
      <View style={[cardStyle.iconBox, { backgroundColor: keyBg }]}>
        <Ionicons name="key" size={24} color={keyColor} style={{ transform: [{ rotate: '-45deg' }] }} />
      </View>

      {/* Texto */}
      <View style={cardStyle.body}>
        <Text style={cardStyle.name} numberOfLines={1}>{item.key_name}</Text>
        <View style={[cardStyle.badge, { backgroundColor: s.bg }]}>
          <Text style={[cardStyle.badgeText, { color: s.color }]}>{s.label}</Text>
        </View>
      </View>

      {/* Tres puntitos / menú */}
      <Ionicons name="ellipsis-vertical" size={20} color={C.textGray} />
    </TouchableOpacity>
  );
}

const cardStyle = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  body:      { flex: 1 },
  name:      { fontSize: 15, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  badge:     { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});

// ── Pantalla principal ────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  // Guardia de rol
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'OWNER')) router.replace('/login');
  }, [user, isLoading]);

  const [activeTab, setActiveTab] = useState<'keys' | 'stores'>('keys');
  const [keys,      setKeys]      = useState<Key[]>([]);
  const [stores,    setStores]    = useState<Store[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [showMenu,  setShowMenu]  = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;

  // ── Fetch datos ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const [k, s] = await Promise.all([
        keyService.getAll(token),
        storeService.getAll(token),
      ]);
      setKeys(k);
      setStores(s);
    } catch (e) {
      setError('No se pudo cargar la información. Toca para reintentar.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // ── Drawer ───────────────────────────────────────────────────────────────
  const openDrawer = () => {
    setShowMenu(true);
    Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }).start();
  };
  const closeDrawer = () => {
    Animated.timing(slideAnim, { toValue: width, duration: 250, useNativeDriver: true }).start(
      () => setShowMenu(false),
    );
  };
  const handleLogout = () => {
    closeDrawer();
    setTimeout(async () => { await logout(); router.replace('/login'); }, 300);
  };

  // ── Guard ────────────────────────────────────────────────────────────────
  if (isLoading || !user || user.role !== 'OWNER') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const firstName = user.full_name?.split(' ')[0] ?? 'Usuario';

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />

      {/* ─── DRAWER ──────────────────────────────────────────────────────── */}
      {showMenu && (
        <View style={s.drawerContainer}>
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <View style={s.backdrop} />
          </TouchableWithoutFeedback>
          <Animated.View style={[s.drawer, { transform: [{ translateX: slideAnim }] }]}>
            <TouchableOpacity onPress={closeDrawer} style={s.closeBtn}>
              <Ionicons name="close" size={22} color={C.textGray} />
            </TouchableOpacity>
            <View style={s.drawerProfile}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{firstName[0]}</Text>
              </View>
              <Text style={s.profileName}>{user.full_name}</Text>
              <Text style={s.profileEmail}>{user.email}</Text>
              <View style={s.roleBadge}>
                <Text style={s.roleText}>PROPIETARIO DE LLAVE 🔑</Text>
              </View>
            </View>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color={C.danger} style={{ marginRight: 8 }} />
              <Text style={s.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
            <Text style={s.version}>KeyGo App v2.0</Text>
          </Animated.View>
        </View>
      )}

      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Hola {firstName} 👋</Text>
          <Text style={s.subtitle}>Gestiona tus llaves de forma segura</Text>
        </View>
        <View style={s.headerIcons}>
          {/* Notificaciones */}
          <TouchableOpacity style={s.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={C.textDark} />
            <View style={s.notifDot} />
          </TouchableOpacity>
          {/* Configuración → abre drawer */}
          <TouchableOpacity style={s.iconBtn} onPress={openDrawer}>
            <Ionicons name="settings-outline" size={22} color={C.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── TABS (línea inferior) ────────────────────────────────────────── */}
      <View style={s.tabBar}>
        {(['keys', 'stores'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={s.tabItem}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabLabel, activeTab === tab && s.tabLabelActive]}>
              {tab === 'keys' ? 'Mis llaves' : 'Puntos KeyGo'}
            </Text>
            {activeTab === tab && <View style={s.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── CONTENIDO ───────────────────────────────────────────────────── */}
      <ScrollView
        style={s.list}
        contentContainerStyle={s.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 60 }} />
        ) : error ? (
          <View style={s.emptyState}>
            <Ionicons name="cloud-offline-outline" size={52} color={C.border} />
            <Text style={s.emptyTitle}>Sin conexión</Text>
            <Text style={s.emptyText}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={fetchData}>
              <Text style={s.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : activeTab === 'keys' ? (
          keys.length === 0 ? (
            <View style={s.emptyState}>
              <Ionicons name="key-outline" size={52} color={C.border} />
              <Text style={s.emptyTitle}>Aún no tienes llaves</Text>
              <Text style={s.emptyText}>Toca "+ Agregar llave" para registrar tu primera llave.</Text>
            </View>
          ) : (
            keys.map((k, index) => (
              <KeyCard
                key={k.id}
                item={k}
                index={index}
                onPress={() =>
                  router.push({ pathname: '/(owner)/codes/[keyId]', params: { keyId: k.id } } as any)
                }
              />
            ))
          )
        ) : (
          stores.length === 0 ? (
            <View style={s.emptyState}>
              <Ionicons name="storefront-outline" size={52} color={C.border} />
              <Text style={s.emptyTitle}>Sin puntos aliados</Text>
              <Text style={s.emptyText}>Pronto habrá puntos KeyGo cerca de ti.</Text>
            </View>
          ) : (
            stores.map((store) => (
              <View key={store.id} style={s.storeCard}>
                <View style={s.storeIconBox}>
                  <Ionicons name="storefront-outline" size={22} color={C.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.storeName}>{store.store_name}</Text>
                  <Text style={s.storeAddr}>{store.address}, {store.city}</Text>
                  {store.opening_hours ? (
                    <Text style={s.storeHours}>
                      <Ionicons name="time-outline" size={11} color={C.primary} /> {store.opening_hours}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>

      {/* ─── FAB ─────────────────────────────────────────────────────────── */}
      <View style={s.fabWrap}>
        <TouchableOpacity
          style={s.fab}
          activeOpacity={0.88}
          onPress={() => router.push('/(owner)/create-key/step1' as any)}
        >
          <View style={s.fabCircle}>
            <Ionicons name="add" size={20} color={C.primary} />
          </View>
          <Text style={s.fabLabel}>Agregar llave</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Estilos globales de la pantalla ──────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 8 : 24,
    paddingBottom: 8,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: C.textDark },
  subtitle:  { fontSize: 13, color: C.textGray, marginTop: 2 },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.yellow,
    borderWidth: 1.5,
    borderColor: C.white,
  },

  // Tabs con línea inferior
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginTop: 12,
  },
  tabItem: { marginRight: 28, paddingBottom: 10, position: 'relative' },
  tabLabel: { fontSize: 15, fontWeight: '700', color: C.yellow },
  tabLabelActive: { color: C.primary },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: C.primary,
    borderRadius: 2,
  },

  // Lista
  list:        { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },

  // Estado vacío / error
  emptyState: { alignItems: 'center', paddingTop: 70, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.textDark, marginTop: 12, marginBottom: 6 },
  emptyText:  { fontSize: 14, color: C.textGray, textAlign: 'center', lineHeight: 20 },
  retryBtn:   { marginTop: 16, backgroundColor: C.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText:  { color: C.white, fontWeight: '700', fontSize: 14 },

  // Tarjeta de tienda
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  storeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  storeName:  { fontSize: 14, fontWeight: '700', color: C.textDark },
  storeAddr:  { fontSize: 12, color: C.textGray, marginTop: 2 },
  storeHours: { fontSize: 11, color: C.primary,  marginTop: 3 },

  // FAB
  fabWrap: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primary,
    paddingHorizontal: 26,
    paddingVertical: 15,
    borderRadius: 50,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    gap: 10,
  },
  fabCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.yellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabLabel: { fontSize: 15, fontWeight: '700', color: C.white },

  // Drawer
  drawerContainer: { ...StyleSheet.absoluteFillObject, zIndex: 9999 },
  backdrop:        { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 290,
    backgroundColor: C.white,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 36,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  drawerProfile: { alignItems: 'center' },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText:   { fontSize: 30, fontWeight: 'bold', color: C.primary },
  profileName:  { fontSize: 16, fontWeight: '800', color: C.textDark },
  profileEmail: { fontSize: 12, color: C.textGray, marginTop: 4 },
  roleBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  roleText:   { fontSize: 10, color: C.primary, fontWeight: 'bold', letterSpacing: 0.5 },
  logoutBtn:  {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoutText: { color: C.danger, fontWeight: 'bold', fontSize: 14 },
  version:    { textAlign: 'center', color: '#94A3B8', fontSize: 11 },
});
