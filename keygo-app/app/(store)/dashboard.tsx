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

export default function StoreDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('inventory');
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

  const handleLogout = () => {
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

  const firstName = user?.full_name?.split(' ')[0] || 'Tienda';

  const mockKeys = [
    { id: '1', name: 'Llave 1', status: 'Esperando deposito', statusType: 'info' },
    { id: '2', name: 'Llave 2', status: 'En tienda', statusType: 'success' },
    { id: '3', name: 'Llave 3', status: 'En uso', statusType: 'warning' },
  ];

  const mockProviders = [
    { id: '1', name: 'Sede Principal KeyGo', address: 'Edificio Platino Piso 5', status: 'Sede Central', emoji: '🏢' },
    { id: '2', name: 'Soporte Logístico', address: 'Zona Industrial 4', status: 'Activo', emoji: '🚚' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Side Drawer Store */}
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
                    <Text style={styles.drawerTitle}>Panel de Tienda</Text>
                </View>

                <View style={styles.drawerProfile}>
                    <View style={[styles.largeAvatar, {backgroundColor: COLORS.yellow}]}>
                        <Text style={[styles.largeAvatarText, {color: COLORS.primary}]}>{firstName[0]}</Text>
                    </View>
                    <Text style={styles.profileName}>{user?.full_name}</Text>
                    <Text style={styles.profileRole}>Punto Aliado Autorizado</Text>
                </View>

                <View style={styles.permSection}>
                    <Text style={styles.permTitle}>HERRAMIENTAS TIENDA</Text>
                    <View style={styles.permList}>
                        <View style={styles.permRow}><Text style={styles.permEmoji}>📊</Text><Text style={styles.permText}>Inventario en Tiempo Real</Text></View>
                        <View style={styles.permRow}><Text style={styles.permEmoji}>✅</Text><Text style={styles.permText}>Validación de Códigos</Text></View>
                        <View style={styles.permRow}><Text style={styles.permEmoji}>📲</Text><Text style={styles.permText}>Escaneo de Llaveros NFC</Text></View>
                        <View style={styles.permRow}><Text style={styles.permEmoji}>🗂️</Text><Text style={styles.permText}>Historial de Operaciones</Text></View>
                    </View>
                </View>

                <TouchableOpacity 
                   style={styles.logoutAction} 
                   onPress={handleLogout}
                   activeOpacity={0.7}
                >
                    <Text style={styles.logoutActionText}>Cerrar sesión</Text>
                </TouchableOpacity>
                
                <Text style={styles.footerVersion}>KeyGo Partner v1.0</Text>
            </Animated.View>
        </View>
      )}

      <View style={styles.headerWrapper}>
        <View style={styles.header}>
            <View>
            <Text style={styles.helloText}>Hola {firstName}</Text>
            <Text style={styles.roleText}>Punto Aliado KeyGo 🏪</Text>
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
            <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('inventory')}>
            <Text style={[styles.tabText, activeTab === 'inventory' ? styles.tabTextActive : styles.tabTextInactive]}>Inventario</Text>
            {activeTab === 'inventory' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('history')}>
            <Text style={[styles.tabText, activeTab === 'history' ? styles.tabTextActive : styles.tabTextInactive]}>Puntos Aliados</Text>
            {activeTab === 'history' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.mainContent}>
            {activeTab === 'inventory' ? (
                mockKeys.map((key) => (
                <View key={key.id} style={styles.keyCard}>
                    <View style={styles.keyCardLeft}>
                    <View style={styles.keyIconCircle}>
                        <Text style={{ fontSize: 24, color: COLORS.primary }}>🔑</Text>
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
                mockProviders.map((provider) => (
                    <View key={provider.id} style={styles.keyCard}>
                        <View style={styles.keyCardLeft}>
                            <View style={styles.keyIconCircle}>
                                <Text style={{ fontSize: 26 }}>{provider.emoji}</Text>
                            </View>
                            <View>
                                <Text style={styles.keyName}>{provider.name}</Text>
                                <Text style={{ fontSize: 13, color: COLORS.textGray }}>{provider.address}</Text>
                                <View style={[styles.statusBadge, styles.bgInfo]}>
                                    <Text style={[styles.statusText, styles.textInfo]}>{provider.status}</Text>
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
        <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, {backgroundColor: COLORS.primary}]}>
                <Text style={styles.actionText}>Agregar llave</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, {backgroundColor: COLORS.yellow}]}>
                <Text style={[styles.actionText, {color: COLORS.primary}]}>Entregar Llave</Text>
            </TouchableOpacity>
        </View>
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
  actionsRow: { flexDirection: 'row', gap: 10, width: '90%', maxWidth: 500 },
  actionBtn: { flex: 1, paddingVertical: 15, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
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
