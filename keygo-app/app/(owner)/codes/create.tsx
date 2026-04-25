import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { codesService } from '../../../services/codes.service';
import KeyGoDateTimePicker from '../../../components/common/KeyGoDateTimePicker';
import KeyGoModal from '../../../components/common/KeyGoModal';

const C = {
  primary:  '#1E4FA3',
  yellow:   '#F4C430',
  bg:       '#F6F8FF',
  white:    '#FFFFFF',
  textDark: '#0F172A',
  textGray: '#64748B',
  border:   '#E2E8F0',
};

export default function CreateCodeScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const { keyId } = useLocalSearchParams();

  const [name, setName] = useState('');
  const [limitValidity, setLimitValidity] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para el Modal
  const [modal, setModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    onConfirm: () => {},
  });

  const handleSave = async () => {
    if (!token || !keyId) return;
    setLoading(true);
    try {
      await codesService.createPickupCode({
        key_id: keyId as string,
        label_name: name,
        code_mode: 'SINGLE_USE',
        active_from: limitValidity ? startDate.toISOString() : undefined,
      }, token);
      
      setModal({
        visible: true,
        title: '¡Código Generado!',
        message: 'Tu código de recogida ha sido creado exitosamente. Ya puedes compartirlo con la persona autorizada.',
        type: 'success',
        onConfirm: () => {
          setModal(prev => ({ ...prev, visible: false }));
          router.back();
        }
      });
    } catch (e: any) {
      console.error(e);
      const backendError = e.response?.data?.message || 'No se pudo generar el código.';
      const isStatusError = backendError.includes('DEPOSITED') || backendError.includes('Depositada');
      
      setModal({
        visible: true,
        title: isStatusError ? 'Llave no entregada' : 'Hubo un problema',
        message: isStatusError 
          ? 'Para generar códigos de recogida, la llave primero debe ser entregada físicamente en el punto aliado.'
          : backendError,
        type: isStatusError ? 'warning' : 'error',
        onConfirm: () => setModal(prev => ({ ...prev, visible: false }))
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.yellow} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Actualizar datos</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.question}>¿Quién recoge la llave?</Text>
        <TextInput
          style={s.input}
          placeholder="Nombre de la persona o empresa"
          value={name}
          onChangeText={setName}
          placeholderTextColor={C.textGray}
        />

        <View style={s.toggleRow}>
          <Text style={s.toggleLabel}>Limitar plazo de validez</Text>
          <Switch
            value={limitValidity}
            onValueChange={setLimitValidity}
            trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            thumbColor={C.white}
          />
        </View>

        {limitValidity && (
          <View style={s.dateSection}>
             <View style={s.dateRow}>
                <Text style={s.dateLabel}>Inicio</Text>
                {Platform.OS === 'web' ? (
                  <KeyGoDateTimePicker 
                    value={startDate} 
                    onChange={setStartDate} 
                    onClose={() => {}} 
                  />
                ) : (
                  <TouchableOpacity style={s.dateBtn} onPress={() => setShowPicker('start')}>
                     <Text style={s.dateText}>{startDate.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</Text>
                     <Ionicons name="calendar-outline" size={18} color={C.primary} />
                  </TouchableOpacity>
                )}
             </View>

             <View style={s.dateRow}>
                <Text style={s.dateLabel}>Termina</Text>
                {Platform.OS === 'web' ? (
                  <KeyGoDateTimePicker 
                    value={endDate} 
                    onChange={setEndDate} 
                    onClose={() => {}} 
                  />
                ) : (
                  <TouchableOpacity style={s.dateBtn} onPress={() => setShowPicker('end')}>
                     <Text style={s.dateText}>{endDate.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</Text>
                     <Ionicons name="calendar-outline" size={18} color={C.primary} />
                  </TouchableOpacity>
                )}
             </View>
          </View>
        )}

        <View style={s.footer}>
          <TouchableOpacity 
            style={[s.saveBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={C.primary} /> : <Text style={s.saveBtnText}>Guardar</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
            <Text style={s.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showPicker && Platform.OS !== 'web' && (
        <KeyGoDateTimePicker
          value={showPicker === 'start' ? startDate : endDate}
          onChange={(d) => {
            if (showPicker === 'start') setStartDate(d);
            else setEndDate(d);
          }}
          onClose={() => setShowPicker(null)}
        />
      )}

      {/* Modal Reutilizable */}
      <KeyGoModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'ios' ? 10 : 30, gap: 15 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.white, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.textDark },
  content: { padding: 24 },
  question: { fontSize: 18, fontWeight: '800', color: C.textDark, marginBottom: 15 },
  input: { backgroundColor: C.white, borderRadius: 16, padding: 18, fontSize: 16, color: C.textDark, borderWidth: 1, borderColor: C.border, marginBottom: 25 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  toggleLabel: { fontSize: 15, fontWeight: '700', color: C.textDark },
  dateSection: { gap: 15, marginBottom: 30 },
  dateRow: { flexDirection: 'column', alignItems: 'flex-start', gap: 8 },
  dateLabel: { fontSize: 14, color: C.textGray, fontWeight: '600' },
  dateBtn: { width: '100%', backgroundColor: C.white, borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  dateText: { fontSize: 14, color: C.textDark, fontWeight: '600' },
  footer: { gap: 12, marginTop: 20 },
  saveBtn: { backgroundColor: C.yellow, padding: 18, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { color: C.primary, fontWeight: '800', fontSize: 16 },
  cancelBtn: { padding: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  cancelBtnText: { color: C.textGray, fontWeight: '700' },
});
