import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const isDesktop = width > 768;

const COLORS = {
  primary: '#1E4FA3',
  yellow: '#F4C430',
  textDark: '#333333',
  textGray: '#666666',
  background: '#F8F9FE',
  white: '#FFFFFF',
};

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('keys');
  const [showSettings, setShowSettings] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(450)).current;

  const toggleSettings = (open: boolean) => {
    if (open) {
      setShowSettings(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 450,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setShowSettings(false));
    }
  };

  // Función mejorada para cerrar sesión
  const handleLogout = () => {
    // 1. Cerramos la pestaña sutilmente primero
    Animated.timing(slideAnim, {
      toValue: 450,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowSettings(false);
      // 2. Ejecutamos el cierre de sesión real y redirigimos
      setTimeout(async () => {
        await logout();
        router.replace('/');
      }, 100);
    });
  };

  const firstName = user?.full_name?.split(' ')[0] || 'Maicol';

  const userKeys = [
    { id: '1', name: 'Llave 1', status: 'Esperando deposito', statusType: 'info' },
    { id: '2', name: 'Llave 2', status: 'En tienda', statusType: 'success' },
    { id: '3', name: 'Llave 3', status: 'En uso', statusType: 'warning' },
  ];

  const mockStores = [
    { id: '1', name: 'Tienda La Esquina', address: 'Cl. 10 #45-12', status: 'Abierto', emoji: '🏪' },
    { id: '2', name: 'Ferretería Central', address: 'Av. 80 #12-50', status: 'Abierto', emoji: '🛠️' },
    { id: '3', name: 'Droguería San Juan', address: 'Cra. 45 #8-20', status: 'Cerrado', emoji: '💊' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Side Drawer Owner */}
      {showSettings && (
        <View style={styles.drawerOverlay}>
            <TouchableWithoutFeedback onPress={() => toggleSettings(false)}>
                <View style={styles.drawerBackdrop} />
            </TouchableWithoutFeedback>
            
            <Animated.View style={[styles.drawerPaper, { transform: [{ translateX: slideAnim }] }]}>
                <View style={styles.drawerHeader}>
                    <TouchableOpacity onPress={() => toggleSettings(false)} style={styles.closeBtn}>
                        <Text style={{ fontSize: 20, color: COLORS.textGray }}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.drawerTitle}>Configuración</Text>
                </View>

                <View style={styles.drawerProfile}>
                    <View style={styles.largeAvatar}>
                        <Text style={styles.largeAvatarText}>{firstName[0]}</Text>
                    </View>
                    <Text style={styles.profileName}>{user?.full_name}</Text>
                    <Text style={styles.profileRole}>Propietario de Llaves</Text>
                </View>

                <View style={styles.permSection}>
                    <Text style={styles.permTitle}>MÓDULOS ACTIVOS</Text>
                    <View style={styles.permList}>
                        <View style={styles.permRow}><Text style={styles.permEmoji}>🔑</Text><Text style={styles.permText}>Gestión de Llaves</Text></View>
                        <View style={styles.permRow}><Text style={styles.permEmoji}>🎟️</Text><Text style={styles.permText}>Códigos de Recogida</Text></View>
                        <View style={styles.permRow}><Text style={styles.permEmoji}>💳</Text><Text style={styles.permText}>Suscripciones y Pagos</Text></View>
                        <View style={styles.permRow}><Text style={styles.permEmoji}>📍</Text><Text style={styles.permText}>Red de Puntos Aliados</Text></View>
                    </View>
                </View>

                <TouchableOpacity 
                  style={styles.logoutAction} 
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                    <Text style={styles.logoutActionText}>Cerrar sesión</Text>
                </TouchableOpacity>
                
                <Text style={styles.footerVersion}>KeyGo App v1.0</Text>
            </Animated.View>
        </View>
      )}

      <View style={styles.headerWrapper}>
        <View style={styles.header}>
            <View>
                <Text style={styles.helloText}>Hola {firstName}</Text>
                <Text style={styles.roleText}>Propietario de llaves</Text>
            </View>
            <View style={styles.headerIcons}>
                <TouchableOpacity style={styles.iconBtn}>
                  <Text style={{ fontSize: 24 }}>🔔</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => toggleSettings(true)}>
                  <Text style={{ fontSize: 24 }}>⚙️</Text>
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.tabsContainer}>
            <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('keys')}>
                <Text style={[styles.tabText, activeTab === 'keys' ? styles.tabTextActive : styles.tabTextInactive]}>Mis llaves</Text>
                {activeTab === 'keys' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('stores')}>
                <Text style={[styles.tabText, activeTab === 'stores' ? styles.tabTextActive : styles.tabTextInactive]}>Puntos KeyGo</Text>
                {activeTab === 'stores' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.mainContent}>
            {activeTab === 'keys' ? (
                userKeys.map((key) => (
                    <View key={key.id} style={styles.keyCard}>
                    <View style={styles.keyCardLeft}>
                        <View style={styles.keyIconCircle}>
                            <Text style={{ fontSize: 24, color: key.id === '2' ? COLORS.primary : COLORS.yellow }}>🔑</Text>
                        </View>
                        <View>
                        <Text style={styles.keyName}>{key.name}</Text>
                        <View style={[styles.statusBadge, 
                            key.statusType === 'success' ? styles.bgSuccess : 
                            key.statusType === 'warning' ? styles.bgWarning : styles.bgInfo]}>
                            <Text style={[styles.statusText,
                            key.statusType === 'success' ? styles.textSuccess : 
                            key.statusType === 'warning' ? styles.textWarning : styles.textInfo]}>{key.status}</Text>
                        </View>
                        </View>
                    </View>
                    <TouchableOpacity><Text style={styles.moreIcon}>⋮</Text></TouchableOpacity>
                    </View>
                ))
            ) : (
                mockStores.map((store) => (
                    <View key={store.id} style={styles.keyCard}>
                        <View style={styles.keyCardLeft}>
                            <View style={styles.keyIconCircle}>
                                <Text style={{ fontSize: 26 }}>{store.emoji}</Text>
                            </View>
                            <View>
                                <Text style={styles.keyName}>{store.name}</Text>
                                <Text style={{ fontSize: 13, color: COLORS.textGray }}>{store.address}</Text>
                                <View style={[styles.statusBadge, store.status === 'Abierto' ? styles.bgSuccess : styles.bgInfo]}>
                                    <Text style={[styles.statusText, store.status === 'Abierto' ? styles.textSuccess : styles.textInfo]}>{store.status}</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity><Text style={styles.moreIcon}>⋮</Text></TouchableOpacity>
                    </View>
                ))
            )}
          </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn}>
          <View style={styles.plusCircle}><Text style={styles.plusText}>+</Text></View>
          <Text style={styles.addBtnLabel}>Agregar llave</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerWrapper: {
    paddingTop: Platform.OS === 'web' ? 60 : (Platform.OS === 'ios' ? 60 : 50),
    backgroundColor: COLORS.background, alignItems: 'center', width: '100%', zIndex: 10,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 25, width: '100%', maxWidth: 900, marginBottom: 20,
  },
  helloText: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  roleText: { fontSize: 14, color: COLORS.textGray, marginTop: -2 },
  headerIcons: { flexDirection: 'row', gap: 15 },
  iconBtn: { padding: 5 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 25, width: '100%', maxWidth: 900, marginBottom: 15 },
  tab: { marginRight: 30, paddingBottom: 8 },
  tabText: { fontSize: 18, fontWeight: 'bold' },
  tabTextInactive: { color: COLORS.yellow },
  tabTextActive: { color: COLORS.primary },
  tabIndicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: COLORS.primary, borderRadius: 2 },
  scrollContent: { paddingTop: 10, paddingBottom: 110, alignItems: 'center' },
  mainContent: { width: '100%', maxWidth: 900, paddingHorizontal: 25 },
  keyCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  keyCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  keyIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  keyName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 4, alignSelf: 'flex-start' },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  bgSuccess: { backgroundColor: '#E6F7ED' }, textSuccess: { color: '#22C55E' },
  bgWarning: { backgroundColor: '#FEF9C3' }, textWarning: { color: '#EAB308' },
  bgInfo: { backgroundColor: '#F3F4F6' }, textInfo: { color: '#6B7280' },
  moreIcon: { fontSize: 24, color: '#999', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' },
  addBtn: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 18, width: '90%', maxWidth: 400 },
  plusCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.yellow, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  plusText: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold', marginTop: -2 },
  addBtnLabel: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  drawerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 },
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  drawerPaper: {
    position: 'absolute', top: 0, bottom: 0, right: 0, width: isDesktop ? 400 : width * 0.8,
    backgroundColor: 'white', padding: 25, borderTopLeftRadius: 30, borderBottomLeftRadius: 30,
    shadowColor: '#000', shadowOffset: { width: -10, height: 0 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20,
  },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 30, marginTop: Platform.OS === 'ios' ? 40 : 10 },
  closeBtn: { padding: 5 },
  drawerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
  drawerProfile: { alignItems: 'center', marginBottom: 40 },
  largeAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  largeAvatarText: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  profileName: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
  profileRole: { fontSize: 14, color: COLORS.textGray, marginTop: 4 },
  permSection: { marginBottom: 40 },
  permTitle: { fontSize: 11, fontWeight: 'bold', color: '#999', letterSpacing: 1.5, marginBottom: 20 },
  permList: { gap: 18 },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  permEmoji: { fontSize: 20 },
  permText: { fontSize: 14, color: '#444', fontWeight: '500' },
  logoutAction: { 
     backgroundColor: '#FFF5F5', padding: 18, borderRadius: 18, borderWidth: 1, borderColor: '#FECACA',
     marginTop: 'auto', alignItems: 'center',
  },
  logoutActionText: { color: '#E53935', fontWeight: 'bold', fontSize: 15 },
  footerVersion: { textAlign: 'center', marginTop: 15, color: '#BBB', fontSize: 10 },
});
