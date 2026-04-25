import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { codesService, PickupCode } from '../../../services/codes.service';
import { keyService, Key } from '../../../services/key.service';
import KeyGoModal from '../../../components/common/KeyGoModal';

const C = {
  primary:  '#1E4FA3',
  yellow:   '#F4C430',
  bg:       '#F6F8FF',
  white:    '#FFFFFF',
  textDark: '#0F172A',
  textGray: '#64748B',
  success:  '#10B981',
  border:   '#E2E8F0',
};

export default function KeyCodesScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const { keyId } = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState<'pickup' | 'history'>('pickup');
  const [codes,     setCodes]     = useState<PickupCode[]>([]);
  const [keyData,   setKeyData]   = useState<Key | null>(null);
  const [loading,   setLoading]   = useState(true);

  // Estados para el Modal
  const [modal, setModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    onConfirm: () => {},
  });

  const fetchData = useCallback(async () => {
    if (!token || !keyId) return;
    try {
      const [k, c] = await Promise.all([
        keyService.getById(keyId as string, token),
        codesService.getPickupCodesByKey(keyId as string, token),
      ]);
      setKeyData(k);
      setCodes(c);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, keyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleShare = async (code: PickupCode) => {
    const msg = `🔑 KeyGo - Código de recogida: ${code.code_value}\n\nPara: ${code.label_name || 'Autorizado'}\nLugar: ${keyData?.store?.store_name}\nDirección: ${keyData?.store?.address}`;
    try {
      await Share.share({ message: msg });
    } catch (e) { console.log(e); }
  };

  const handleCancel = async (id: string) => {
    setModal({
      visible: true,
      title: 'Eliminar código',
      message: '¿Estás seguro de que deseas eliminar este código? Una vez eliminado, nadie podrá retirar la llave con él.',
      type: 'warning',
      onConfirm: async () => {
        setModal(prev => ({ ...prev, visible: false }));
        try {
          await codesService.cancelPickupCode(id, token!);
          fetchData();
        } catch (e) {
          setModal({
            visible: true,
            title: 'Error',
            message: 'No se pudo eliminar el código. Inténtalo de nuevo.',
            type: 'error',
            onConfirm: () => setModal(prev => ({ ...prev, visible: false }))
          });
        }
      },
      onCancel: () => setModal(prev => ({ ...prev, visible: false }))
    });
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.yellow} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Mis códigos</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        <TouchableOpacity 
          style={[s.tab, activeTab === 'pickup' && s.tabActive]} 
          onPress={() => setActiveTab('pickup')}
        >
          <Text style={[s.tabText, activeTab === 'pickup' && s.tabTextActive]}>Códigos de recogida</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[s.tab, activeTab === 'history' && s.tabActive]} 
          onPress={() => setActiveTab('history')}
        >
          <Text style={[s.tabText, activeTab === 'history' && s.tabTextActive]}>Historial</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={s.content}>
          {activeTab === 'pickup' ? (
            <>
              {/* Códigos de recogida */}
              {codes.filter(c => c.status === 'ACTIVE' || c.status === 'PENDING_SCHEDULE').map(c => (
                <View key={c.id} style={s.card}>
                  <View style={s.cardHeader}>
                    <Text style={s.cardTag}>Código de recogida</Text>
                    <View style={s.statusBadge}><Text style={s.statusText}>Válido</Text></View>
                  </View>
                  <Text style={s.codeValue}>{c.code_value}</Text>
                  
                  <TouchableOpacity style={s.shareBtn} onPress={() => handleShare(c)}>
                    <Ionicons name="share-social-outline" size={18} color={C.primary} />
                    <Text style={s.shareBtnText}>Copiar enlace mágico</Text>
                  </TouchableOpacity>

                  <View style={s.actions}>
                    <TouchableOpacity style={s.actionBtn}>
                       <Ionicons name="create-outline" size={16} color={C.textGray} />
                       <Text style={s.actionText}>Modificar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.actionBtn} onPress={() => handleCancel(c.id)}>
                       <Ionicons name="trash-outline" size={16} color="#EF4444" />
                       <Text style={[s.actionText, { color: '#EF4444' }]}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Botón Flotante para crear nuevo */}
              <TouchableOpacity 
                style={s.addBtn} 
                onPress={() => router.push({ pathname: '/(owner)/codes/create', params: { keyId } } as any)}
              >
                <Ionicons name="add" size={24} color={C.primary} />
                <Text style={s.addBtnText}>Generar nuevo código</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={s.historyList}>
              {codes.filter(c => c.status === 'USED' || c.status === 'CANCELLED').map(c => (
                 <View key={c.id} style={s.historyCard}>
                    <View style={s.historyHeader}>
                       <Text style={s.historyTitle}>Código {c.status === 'USED' ? 'utilizado' : 'cancelado'}</Text>
                       <Text style={s.historyDate}>{new Date(c.created_at).toLocaleDateString()}</Text>
                    </View>
                    <Text style={s.historyValue}>{c.code_value}</Text>
                    <Text style={s.historyMeta}>Recogido por: {c.label_name || 'N/A'}</Text>
                 </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <KeyGoModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
        confirmText={modal.onCancel ? 'Sí, eliminar' : 'Entendido'}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'ios' ? 10 : 30, gap: 15 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.white, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.textDark },
  tabs: { flexDirection: 'row', backgroundColor: '#E2E8F0', marginHorizontal: 20, borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: C.white },
  tabText: { fontSize: 13, fontWeight: '600', color: C.textGray },
  tabTextActive: { color: C.primary },
  content: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: C.white, borderRadius: 20, padding: 20, marginBottom: 15, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTag: { fontSize: 11, fontWeight: '700', color: C.textGray, textTransform: 'uppercase' },
  statusBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { color: C.success, fontSize: 10, fontWeight: 'bold' },
  codeValue: { fontSize: 32, fontWeight: '900', color: C.primary, letterSpacing: 4, marginBottom: 15 },
  shareBtn: { backgroundColor: '#F0F4FF', padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  shareBtnText: { color: C.primary, fontWeight: '700', fontSize: 13 },
  actions: { flexDirection: 'row', gap: 15, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 15 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, color: C.textGray, fontWeight: '600' },
  addBtn: { backgroundColor: C.yellow, padding: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  addBtnText: { color: C.primary, fontWeight: '800', fontSize: 15 },
  historyList: { gap: 12 },
  historyCard: { backgroundColor: C.white, padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: C.border },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  historyTitle: { fontSize: 14, fontWeight: '700', color: C.textDark },
  historyDate: { fontSize: 12, color: C.textGray },
  historyValue: { fontSize: 18, fontWeight: '800', color: C.primary, marginBottom: 4 },
  historyMeta: { fontSize: 12, color: C.textGray },
});
