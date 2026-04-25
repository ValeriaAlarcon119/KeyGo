import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
  Share,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { keyService, Key } from '../../services/key.service';
import { codesService, PickupCode } from '../../services/codes.service';

const COLORS = {
  primary: '#1E4FA3',
  yellow: '#F4C430',
  textDark: '#1A1A2E',
  textGray: '#71717A',
  background: '#F6F8FF',
  white: '#FFFFFF',
  success: '#10B981',
  successBg: '#ECFDF5',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  red: '#EF4444',
  redBg: '#FEF2F2',
  border: '#E4E4E7',
  blueLight: '#EFF6FF',
};

const STATUS_CFG: Record<string, { label: string; color: string; emoji: string; desc: string }> = {
  WAITING_DEPOSIT: {
    label: 'Esperando depósito',
    color: COLORS.textGray,
    emoji: '⏳',
    desc: 'Lleva la llave al punto aliado y presenta el código de depósito.',
  },
  DEPOSITED: {
    label: 'En tienda',
    color: COLORS.success,
    emoji: '🔒',
    desc: 'Llave depositada en el punto KeyGo',
  },
  IN_USE: {
    label: 'En uso',
    color: COLORS.warning,
    emoji: '🔓',
    desc: 'La llave fue retirada de la tienda.',
  },
  DELETED: {
    label: 'Eliminada',
    color: COLORS.red,
    emoji: '🗑️',
    desc: 'Esta llave ha sido eliminada.',
  },
};

export default function KeyDetailScreen() {
  const { keyId } = useLocalSearchParams<{ keyId: string }>();
  const { token } = useAuth();
  const router = useRouter();

  const [key, setKey] = useState<Key | null>(null);
  const [codes, setCodes] = useState<PickupCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [labelName, setLabelName] = useState('');
  const [codeMode, setCodeMode] = useState<'SINGLE_USE' | 'REUSABLE'>('SINGLE_USE');
  const [generating, setGenerating] = useState(false);

  const fetchKey = useCallback(async () => {
    if (!token || !keyId) return;
    try {
      const k = await keyService.getById(keyId, token);
      setKey(k);
      // También cargar los códigos activos
      try {
        const c = await codesService.getPickupCodesByKey(keyId, token);
        setCodes(Array.isArray(c) ? c : []);
      } catch {
        setCodes([]);
      }
    } catch {
      Alert.alert('Error', 'No se pudo cargar la llave.');
    } finally {
      setLoading(false);
    }
  }, [token, keyId]);

  useEffect(() => { fetchKey(); }, [fetchKey]);

  const handleGenerateCode = async () => {
    if (!token || !keyId) return;
    setGenerating(true);
    try {
      const resp = await codesService.createPickupCode(
        { key_id: keyId, code_mode: codeMode, label_name: labelName.trim() || undefined },
        token,
      );
      Alert.alert(
        '¡Código generado!',
        `Código: ${resp.pickup_code.code_value}\n\nPuedes compartir el mensaje de instrucciones.`,
        [
          {
            text: 'Compartir',
            onPress: () => Share.share({ message: resp.share_message }),
          },
          { text: 'Cerrar' },
        ],
      );
      setShowModal(false);
      setLabelName('');
      fetchKey();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo generar el código.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCancelCode = (codeId: string) => {
    Alert.alert('Cancelar código', '¿Seguro que deseas invalidar este código?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          if (!token) return;
          try {
            await codesService.cancelPickupCode(codeId, token);
            fetchKey();
          } catch {
            Alert.alert('Error', 'No se pudo cancelar el código.');
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Eliminar llave', `¿Eliminar "${key?.key_name}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          if (!token || !keyId) return;
          try {
            await keyService.delete(keyId, token);
            router.replace('/(owner)/dashboard');
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'No se pudo eliminar la llave.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!key) return null;

  const cfg = STATUS_CFG[key.key_status] || STATUS_CFG.WAITING_DEPOSIT;
  const depositCode = key.deposit_codes?.find((d) => d.status === 'ACTIVE' || d.status === 'USED');
  const nfcTag = key.key_tags?.find((t) => t.status === 'active');
  const activeCodes = codes.filter((c) => c.status === 'ACTIVE' || c.status === 'PENDING_SCHEDULE');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        {/* nombre + badge de estado — prototipo pantalla 4 */}
        <View style={styles.headerCenter}>
          <View style={styles.storeIconCircle}>
            <Text style={{ fontSize: 22 }}>🏪</Text>
          </View>
          <View>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerStoreName}>{key.store?.store_name || 'Punto aliado'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: cfg.color }]}>
                <Text style={styles.statusBadgeText}>{cfg.label}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Información exacta del prototipo */}
        <View style={styles.infoCard}>
          <Row label="Estado (actual)" value={cfg.desc} valueColor={cfg.color} />
          <Divider />
          <Row label="Dirección del punto" value={key.store?.address || 'N/A'} />
          <Divider />
          <Row label="HORARIO" value={key.store?.opening_hours || 'Consultar en tienda'} />
          <Divider />
          <View style={styles.rowHalf}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Llavero Id</Text>
              <Text style={styles.fieldValue}>
                {nfcTag ? nfcTag.tag_uid.slice(0, 8).toUpperCase() : '—'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Plan</Text>
              <Text style={styles.fieldValue}>
                {key.plan_type === 'MONTHLY' ? 'Pago mensual' : 'Pago por uso'}
              </Text>
            </View>
          </View>
        </View>

        {/* Código de depósito (solo cuando está esperando) */}
        {key.key_status === 'WAITING_DEPOSIT' && depositCode && (
          <View style={styles.depositCard}>
            <Text style={styles.depositLabel}>CÓDIGO DE DEPÓSITO</Text>
            <Text style={styles.depositValue}>{depositCode.code_value}</Text>
            <Text style={styles.depositHint}>Preséntalo al personal del punto aliado</Text>
          </View>
        )}

        {/* Botón principal: Obtener código de recogida */}
        <TouchableOpacity
          style={[
            styles.mainBtn,
            key.key_status !== 'DEPOSITED' && { opacity: 0.4 },
          ]}
          disabled={key.key_status !== 'DEPOSITED'}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.mainBtnEmoji}>🗝️</Text>
          <Text style={styles.mainBtnText}>Obtener un código de recogida</Text>
        </TouchableOpacity>

        {/* Botones secundarios */}
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() =>
            router.push({ pathname: '/(owner)/my-codes', params: { keyId: key.id, keyName: key.key_name } } as any)
          }
        >
          <Text style={styles.secondaryBtnText}>Ver mis códigos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={async () => {
            if (!token) return;
            try {
              const h = await keyService.getHistory(key.id, token);
              Alert.alert('Movimientos', `${h.length || 0} eventos registrados.`);
            } catch {
              Alert.alert('Error', 'No se pudo cargar el historial.');
            }
          }}
        >
          <Text style={styles.secondaryBtnText}>Ver movimientos</Text>
        </TouchableOpacity>

        {/* Acciones al pie */}
        <View style={styles.footerActions}>
          <TouchableOpacity style={styles.footerAction}>
            <Text style={styles.footerActionText}>Modificar llave 📋</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerAction} onPress={handleDelete}>
            <Text style={[styles.footerActionText, { color: COLORS.red }]}>Eliminar 🗑️</Text>
          </TouchableOpacity>
        </View>

        {/* Códigos activos listados (mini preview) */}
        {activeCodes.length > 0 && (
          <View style={styles.codesPreview}>
            <Text style={styles.codesPreviewTitle}>Códigos activos</Text>
            {activeCodes.map((c) => (
              <View key={c.id} style={styles.codeRow}>
                <View>
                  <Text style={styles.codeVal}>{c.code_value}</Text>
                  <Text style={styles.codeMeta}>
                    {c.code_mode === 'REUSABLE' ? '♻️ Reutilizable' : '1️⃣ Un uso'}
                    {c.label_name ? ` • ${c.label_name}` : ''}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleCancelCode(c.id)} style={styles.cancelCodeBtn}>
                  <Text style={styles.cancelCodeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── MODAL Generar código ── */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo código de recogida</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={{ fontSize: 20, color: COLORS.textGray }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>¿Para quién es? (opcional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Juan Pérez"
              placeholderTextColor="#9CA3AF"
              value={labelName}
              onChangeText={setLabelName}
            />

            <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Tipo de código</Text>
            <View style={styles.modePicker}>
              {(['SINGLE_USE', 'REUSABLE'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.modeCard, codeMode === m && styles.modeCardActive]}
                  onPress={() => setCodeMode(m)}
                >
                  <Text style={{ fontSize: 24, marginBottom: 6 }}>
                    {m === 'SINGLE_USE' ? '1️⃣' : '♻️'}
                  </Text>
                  <Text style={[styles.modeLabel, codeMode === m && { color: COLORS.primary }]}>
                    {m === 'SINGLE_USE' ? 'Un solo uso' : 'Reutilizable'}
                  </Text>
                  <Text style={styles.modeDesc}>
                    {m === 'SINGLE_USE' ? 'Expira al usarse' : 'Múltiples usos'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.mainBtn, { marginTop: 28 }, generating && { opacity: 0.7 }]}
              onPress={handleGenerateCode}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.mainBtnText}>Generar código</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Componentes auxiliares internos
function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.fieldValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 28,
    paddingBottom: 16,
    gap: 14,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 26, color: COLORS.yellow, fontWeight: 'bold' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  storeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  headerStoreName: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },

  scroll: { paddingHorizontal: 20, paddingBottom: 60 },

  // Info card — diseño del prototipo pantalla 4
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  infoRow: { paddingVertical: 10 },
  rowHalf: { flexDirection: 'row', paddingTop: 10 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textGray,
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  fieldValue: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, lineHeight: 20 },
  divider: { height: 1, backgroundColor: COLORS.border },

  // Deposit code card
  depositCard: {
    backgroundColor: COLORS.blueLight,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  depositLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 10,
  },
  depositValue: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 8,
  },
  depositHint: { fontSize: 12, color: COLORS.textGray, textAlign: 'center' },

  // Main action button — verde del prototipo
  mainBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    elevation: 4,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mainBtnEmoji: { fontSize: 20 },
  mainBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '800' },

  // Secondary buttons
  secondaryBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
  },
  secondaryBtnText: { color: COLORS.textDark, fontWeight: '600', fontSize: 15 },

  // Footer actions
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 20,
    marginBottom: 24,
  },
  footerAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerActionText: { fontSize: 14, color: COLORS.textGray, fontWeight: '600' },

  // Codes preview
  codesPreview: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  codesPreviewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  codeVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
  },
  codeMeta: { fontSize: 11, color: COLORS.textGray, marginTop: 2 },
  cancelCodeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelCodeText: { color: COLORS.red, fontWeight: 'bold', fontSize: 14 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textDark },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modePicker: { flexDirection: 'row', gap: 12 },
  modeCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  modeCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.blueLight },
  modeLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textGray },
  modeDesc: { fontSize: 10, color: COLORS.textGray, marginTop: 3, textAlign: 'center' },
});
