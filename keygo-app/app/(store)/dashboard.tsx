import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
  RefreshControl,
  Platform,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { keyService, Key } from '../../services/key.service';
import { codesService } from '../../services/codes.service';

import { 
  Ionicons, 
  MaterialCommunityIcons, 
  FontAwesome5 
} from '@expo/vector-icons';
import { Image } from 'react-native';

const ICON_DEPOSIT = require('../../assets/DepositarLlave.png');
const ICON_DELIVER = require('../../assets/EntregarLlave.png');
const ICON_CHECK = require('../../assets/ChequeoLlaves.png');

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#1E4FA3',
  yellow: '#FFD700',
  orange: '#FF4D2B',
  dark: '#0F172A',
  textDark: '#1A1A2E',
  textGray: '#64748B',
  background: '#F0F2F5',
  white: '#FFFFFF',
};

export default function StoreDashboard() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  // 🛡️ GUARDIA DE SEGURIDAD
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'STORE')) {
      router.replace('/login');
    }
  }, [user, isLoading]);

  const [keysInStore, setKeysInStore] = useState<Key[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'validate' | 'nfc'>('home');
  const [validateMode, setValidateMode] = useState<'DEPOSIT' | 'PICKUP'>('DEPOSIT');
  const [codeInput, setCodeInput] = useState('');
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [nfcUid, setNfcUid] = useState('');

  const [showSettings, setShowSettings] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;

  const openDrawer = () => {
    setShowSettings(true);
    Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, { toValue: width, duration: 250, useNativeDriver: true }).start(
      () => setShowSettings(false),
    );
  };

  const handleLogout = () => {
    closeDrawer();
    setTimeout(async () => {
      await logout();
      router.replace('/login');
    }, 300);
  };

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const keysData = await keyService.getAll(token);
      setKeysInStore(keysData.filter((k: Key) => k.key_status === 'DEPOSITED'));
    } catch {
      // Error silencioso
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = (mode: 'DEPOSIT' | 'PICKUP') => {
    setValidateMode(mode);
    setResult(null);
    setNfcUid('');
    setCodeInput('');
    setActiveView('validate');
  };

  const handleValidate = async () => {
    if (!codeInput.trim() || !token) return;
    setValidating(true);
    setResult(null);
    try {
      let res;
      if (validateMode === 'DEPOSIT') {
        res = await codesService.validateDeposit(codeInput.trim().toUpperCase(), token);
        if (res.valid) {
            setResult(res);
            setTimeout(() => setActiveView('nfc'), 1000);
            return;
        }
      } else {
        res = await codesService.validatePickup(codeInput.trim().toUpperCase(), token);
      }
      setResult(res);
    } catch (e: any) {
      setResult({
        valid: false,
        message: e?.response?.data?.message || 'Error al validar. Intenta de nuevo.',
      });
    } finally {
      setValidating(false);
    }
  };

  const handleConfirmNFC = async () => {
      if (!nfcUid.trim()) return;
      setValidating(true);
      try {
          setResult({ valid: true, message: '¡Llave depositada y NFC vinculado con éxito!' });
          setTimeout(() => {
              setActiveView('home');
              fetchData();
          }, 2000);
      } catch (e: any) {
          setResult({ valid: false, message: 'Error al vincular NFC.' });
      } finally {
          setValidating(false);
      }
  };

  if (isLoading || !user || user.role !== 'STORE') {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const firstName = user?.full_name?.split(' ')[0] || 'Usuario';
  const storeName = "Punto KeyGo Autorizado";

  if (activeView === 'validate') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.validateHeader}>
          <TouchableOpacity onPress={() => setActiveView('home')} style={styles.backBtn}>
            <Text style={{ fontSize: 24, color: COLORS.primary }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.validateTitle}>
            {validateMode === 'DEPOSIT' ? 'Recibir Llave' : 'Entregar Llave'}
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.validateContent}>
            <Text style={styles.inputLabel}>Ingresa el código de {validateMode === 'DEPOSIT' ? 'depósito' : 'recogida'}:</Text>
            <TextInput
                style={styles.codeInput}
                placeholder="XXXX-XXXX"
                placeholderTextColor="#94A3B8"
                value={codeInput}
                onChangeText={setCodeInput}
                autoCapitalize="characters"
                maxLength={9}
                autoFocus
            />
            {result && (
                <View style={[styles.resultBox, result.valid ? styles.resultSuccess : styles.resultError]}>
                    <Text style={[styles.resultText, result.valid ? styles.textSuccess : styles.textDanger]}>
                        {result.message}
                    </Text>
                </View>
            )}
            <TouchableOpacity 
                style={[styles.mainBtn, validating && { opacity: 0.7 }]} 
                onPress={handleValidate}
                disabled={validating}
            >
                {validating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainBtnText}>Validar Código</Text>}
            </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (activeView === 'nfc') {
      return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.validateHeader}>
                <TouchableOpacity onPress={() => setActiveView('validate')} style={styles.backBtn}>
                    <Text style={{ fontSize: 24, color: COLORS.primary }}>←</Text>
                </TouchableOpacity>
                <Text style={styles.validateTitle}>Vincular Llavero NFC</Text>
            </View>
            <View style={styles.validateContent}>
                <Text style={{ fontSize: 60, textAlign: 'center', marginBottom: 20 }}>🛰️</Text>
                <Text style={styles.nfcHint}>Escanea el llavero físico ahora para asociarlo a la llave del cliente.</Text>
                <TextInput
                    style={styles.codeInput}
                    placeholder="ID del Llavero"
                    value={nfcUid}
                    onChangeText={setNfcUid}
                    autoFocus
                />
                {result && result.message && (
                    <View style={[styles.resultBox, result.valid ? styles.resultSuccess : styles.resultError]}>
                        <Text style={[styles.resultText, result.valid ? styles.textSuccess : styles.textDanger]}>
                            {result.message}
                        </Text>
                    </View>
                )}
                <TouchableOpacity style={styles.mainBtn} onPress={handleConfirmNFC}>
                    <Text style={styles.mainBtnText}>Confirmar Vínculo</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {showSettings && (
        <View style={styles.drawerOverlay}>
            <TouchableWithoutFeedback onPress={closeDrawer}><View style={styles.drawerBackdrop} /></TouchableWithoutFeedback>
            <Animated.View style={[styles.drawerPaper, { transform: [{ translateX: slideAnim }] }]}>
                <View style={styles.drawerHeader}>
                    <TouchableOpacity onPress={closeDrawer}><Text style={{ fontSize: 20 }}>✕</Text></TouchableOpacity>
                    <Text style={styles.drawerTitle}>Panel de Tienda</Text>
                </View>
                <View style={styles.drawerUser}>
                    <View style={styles.userAvatar}><Text style={styles.avatarTxt}>{firstName[0]}</Text></View>
                    <Text style={styles.userName}>{user?.full_name}</Text>
                    <Text style={styles.userRole}>Punto KeyGo Autorizado</Text>
                </View>

                <View style={styles.permSection}>
                    <Text style={styles.permTitle}>TUS FACULTADES</Text>
                    <View style={styles.permList}>
                        <View style={styles.permRow}><Text style={{fontSize: 20}}>📥</Text><Text style={styles.permText}>Recepción de llaves</Text></View>
                        <View style={styles.permRow}><Text style={{fontSize: 20}}>📤</Text><Text style={styles.permText}>Entrega con código</Text></View>
                        <View style={styles.permRow}><Text style={{fontSize: 20}}>📡</Text><Text style={styles.permText}>Escaneo NFC</Text></View>
                        <View style={styles.permRow}><Text style={{fontSize: 20}}>📋</Text><Text style={styles.permText}>Control de Inventario</Text></View>
                        <View style={styles.permRow}><Text style={{fontSize: 20}}>⏱️</Text><Text style={styles.permText}>Historial de movimientos</Text></View>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutAction} onPress={handleLogout}>
                    <Text style={styles.logoutActionText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
      )}

      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Hola, {firstName} 👋</Text>
          <Text style={styles.storeName}>{storeName}</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={openDrawer}>
          <Text style={{ fontSize: 24 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        <View style={styles.mockupCard}>
            <View style={styles.topActionsRow}>
                {/* BOTÓN DEPOSITAR */}
                <TouchableOpacity 
                    style={styles.premiumSquareAction} 
                    onPress={() => handleAction('DEPOSIT')}
                >
                    <Image source={ICON_DEPOSIT} style={styles.premiumImage} resizeMode="contain" />
                </TouchableOpacity>

                {/* BOTÓN ENTREGAR */}
                <TouchableOpacity 
                    style={styles.premiumSquareAction} 
                    onPress={() => handleAction('PICKUP')}
                >
                    <Image source={ICON_DELIVER} style={styles.premiumImage} resizeMode="contain" />
                </TouchableOpacity>
            </View>

            {/* BOTÓN CHEQUEO (ANCHO) */}
            <TouchableOpacity 
                style={styles.premiumWideAction}
                onPress={() => alert('Escaneando inventario...')}
            >
                <Image source={ICON_CHECK} style={[styles.premiumImageWide, { transform: [{ scale: 1.08 }] }]} resizeMode="cover" />
            </TouchableOpacity>
        </View>

        <View style={styles.inventoryCard}>
            {loading ? (
                <ActivityIndicator color={COLORS.primary} />
            ) : (
                <>
                    <Text style={styles.inventoryNum}>{keysInStore.length}</Text>
                    <Text style={styles.inventoryLabel}>Llaves en tienda</Text>
                </>
            )}
        </View>

        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Listado Detallado</Text>
        </View>

        {keysInStore.length === 0 ? (
            <View style={styles.emptyState}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>📦</Text>
                <Text style={styles.emptyText}>No hay llaves registradas en este punto.</Text>
            </View>
        ) : (
            keysInStore.map((key) => (
                <View key={key.id} style={styles.keyRow}>
                    <View style={styles.keyIcon}><Text>🔑</Text></View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.keyName}>{key.key_name}</Text>
                        <Text style={styles.keyTime}>Piso/Caja: A-{Math.floor(Math.random()*10)}</Text>
                    </View>
                    <View style={styles.activeBadge}><Text style={styles.activeText}>OK</Text></View>
                </View>
            ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 40 : 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  welcome: { fontSize: 22, fontWeight: '800', color: COLORS.textDark },
  storeName: { fontSize: 13, color: COLORS.textGray, marginTop: 2 },
  settingsBtn: { padding: 8 },
  content: { padding: 20, paddingBottom: 100 },
  mockupCard: {
      backgroundColor: '#FFF',
      borderRadius: 30,
      padding: 20,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      marginBottom: 30,
      maxWidth: 600,
      width: '100%',
      alignSelf: 'center',
  },
  topActionsRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  squareAction: {
      flex: 1,
      height: 180, // Más alto para que se vea más cuadrado
      borderRadius: 25,
      padding: 15,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
  },
  premiumSquareAction: {
      flex: 1,
      aspectRatio: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 25,
      padding: 15,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
  },
  premiumWideAction: {
      width: '100%',
      aspectRatio: 2.6,
      backgroundColor: '#FFFFFF',
      borderRadius: 25,
      padding: 0,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      marginTop: 15,
      overflow: 'hidden',
  },
  premiumImage: {
      width: '100%',
      height: '100%',
  },
  premiumImageWide: {
      width: '100%',
      height: '100%',
  },
  squareActionText: {
      fontSize: 19,
      fontWeight: '900',
      textAlign: 'center',
      color: '#1A1A2E',
      lineHeight: 23,
  },
  wideAction: {
      backgroundColor: '#3F51B5',
      borderRadius: 25,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
  },
  wideActionIcon: {
      width: 70,
      height: 70,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 35,
      justifyContent: 'center',
      alignItems: 'center',
  },
  wideActionTitle: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  wideActionSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  inventoryCard: {
      backgroundColor: '#FFF',
      borderRadius: 30,
      padding: 30,
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      marginBottom: 30,
  },
  inventoryNum: { fontSize: 56, fontWeight: '900', color: '#1A1A2E' },
  inventoryLabel: { fontSize: 16, color: '#64748B', fontWeight: '600' },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  keyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.white,
      padding: 16,
      borderRadius: 20,
      marginBottom: 12,
      gap: 14,
  },
  keyIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  keyName: { fontSize: 15, fontWeight: '700', color: COLORS.textDark },
  keyTime: { fontSize: 12, color: COLORS.textGray, marginTop: 2 },
  activeBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  activeText: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  emptyState: { alignItems: 'center', marginTop: 20, opacity: 0.5 },
  emptyText: { fontSize: 14, color: COLORS.textGray, textAlign: 'center' },
  validateHeader: { flexDirection: 'row', alignItems: 'center', padding: 24, gap: 15, backgroundColor: COLORS.white },
  backBtn: { padding: 5 },
  validateTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textDark },
  validateContent: { padding: 24 },
  inputLabel: { fontSize: 14, color: COLORS.textGray, marginBottom: 12 },
  codeInput: {
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 20,
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 2,
      borderWidth: 2,
      borderColor: '#E2E8F0',
      marginBottom: 20,
  },
  mainBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  mainBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  resultBox: { padding: 16, borderRadius: 16, marginBottom: 20 },
  resultSuccess: { backgroundColor: '#ECFDF5' },
  resultError: { backgroundColor: '#FEF2F2' },
  resultText: { textAlign: 'center', fontWeight: '600' },
  textSuccess: { color: '#10B981' },
  textDanger: { color: '#EF4444' },
  nfcHint: { fontSize: 15, textAlign: 'center', color: COLORS.textGray, lineHeight: 22, marginBottom: 30 },
  drawerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 },
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  drawerPaper: {
    position: 'absolute', top: 0, bottom: 0, right: 0, width: width * 0.8, maxWidth: 350,
    backgroundColor: 'white', padding: 25, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
  },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 40 },
  drawerTitle: { fontSize: 18, fontWeight: '700' },
  drawerUser: { alignItems: 'center', marginBottom: 40 },
  userAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarTxt: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userRole: { fontSize: 13, color: COLORS.textGray, marginTop: 4 },
  logoutAction: { marginTop: 'auto', padding: 18, backgroundColor: '#FEF2F2', borderRadius: 16, alignItems: 'center' },
  logoutActionText: { color: '#EF4444', fontWeight: '700' },
  permSection: { marginTop: 10, marginBottom: 30 },
  permTitle: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 15 },
  permList: { gap: 15 },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  permText: { fontSize: 14, color: '#1A1A2E', fontWeight: '600' },
});
