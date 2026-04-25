import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { keyService } from '../../../services/key.service';
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

export default function Step2Config() {
  const { token } = useAuth();
  const router = useRouter();
  const { storeId } = useLocalSearchParams();

  const [keyName, setKeyName] = useState('');
  const [plan, setPlan] = useState<'PAY_PER_USE' | 'MONTHLY'>('PAY_PER_USE');
  const [loading, setLoading] = useState(false);

  // Estados para el Modal
  const [modal, setModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
  });

  const handleFinish = async () => {
    if (!keyName.trim()) {
      setModal({
        visible: true,
        title: 'Atención',
        message: 'Por favor dale un nombre a tu llave para poder continuar.',
        type: 'warning'
      });
      return;
    }
    
    setLoading(true);
    try {
      const res = await keyService.create({
        key_name: keyName,
        store_id: storeId as string,
        plan_type: plan,
      }, token!);
      
      router.push({
        pathname: '/(owner)/create-key/success',
        params: { 
          keyId: res.key.id, 
          depositCode: res.deposit_code 
        }
      } as any);
    } catch (e) {
      console.error(e);
      setModal({
        visible: true,
        title: 'Error de conexión',
        message: 'No pudimos registrar tu llave. Verifica tu conexión a internet e intenta de nuevo.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.textDark} />
        </TouchableOpacity>

        <Text style={s.stepTag}>📍 Paso 2 – Configuración de llave</Text>
        
        {/* Nombre de la llave */}
        <View style={s.section}>
          <Text style={s.label}>Nombre de la llave</Text>
          <TextInput 
            style={s.input} 
            placeholder="Ej: Llaves de mi casa"
            placeholderTextColor={C.textGray}
            value={keyName}
            onChangeText={setKeyName}
          />
        </View>

        {/* Selección de Plan */}
        <Text style={s.sectionTitle}>Selecciona el plan que prefieres:</Text>
        
        <View style={s.plansContainer}>
          <TouchableOpacity 
            style={[s.planCard, plan === 'PAY_PER_USE' && s.planSelected]} 
            onPress={() => setPlan('PAY_PER_USE')}
            activeOpacity={0.8}
          >
            <View style={s.planHeader}>
              <Text style={[s.planName, plan === 'PAY_PER_USE' && s.planTextSelected]}>Pago por uso</Text>
              <Ionicons 
                name={plan === 'PAY_PER_USE' ? "checkmark-circle" : "ellipse-outline"} 
                size={22} 
                color={plan === 'PAY_PER_USE' ? C.primary : C.border} 
              />
            </View>
            <Text style={s.planDesc}>Ideal para usos ocasionales.</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[s.planCard, plan === 'MONTHLY' && s.planSelected]} 
            onPress={() => setPlan('MONTHLY')}
            activeOpacity={0.8}
          >
            <View style={s.planHeader}>
              <Text style={[s.planName, plan === 'MONTHLY' && s.planTextSelected]}>Pago mensual</Text>
              <Ionicons 
                name={plan === 'MONTHLY' ? "checkmark-circle" : "ellipse-outline"} 
                size={22} 
                color={plan === 'MONTHLY' ? C.primary : C.border} 
              />
            </View>
            <Text style={s.planDesc}>Para quienes usan KeyGo a diario.</Text>
          </TouchableOpacity>
        </View>

        {/* Beneficios */}
        <View style={s.benefitsBox}>
          {[
            'Atención al cliente 24/7 para tranquilidad completa',
            'Da seguimiento a cada movimiento en tiempo real',
            'Códigos con restricción de tiempo para mayor seguridad',
            'Códigos de acceso creados y comunicados automáticamente'
          ].map((text, i) => (
            <View key={i} style={s.benefitRow}>
              <View style={s.checkCircle}>
                <Ionicons name="checkmark" size={12} color={C.white} />
              </View>
              <Text style={s.benefitText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Botón Final */}
        <TouchableOpacity 
          style={[s.continueBtn, loading && s.btnLoading]} 
          onPress={handleFinish} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={C.primary} />
          ) : (
            <Text style={s.continueBtnText}>Finalizar y crear llave</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <KeyGoModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={() => setModal(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 24, paddingBottom: 40 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  stepTag: { color: '#E91E63', fontWeight: '800', fontSize: 13, marginBottom: 15, letterSpacing: 0.5 },
  section: { marginBottom: 25 },
  label: { fontSize: 14, fontWeight: '700', color: C.textDark, marginBottom: 10 },
  input: { 
    backgroundColor: C.white, 
    borderRadius: 16, 
    padding: 18, 
    fontSize: 16, 
    color: C.textDark,
    borderWidth: 1, 
    borderColor: C.border,
    fontWeight: '500',
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: C.textDark, marginBottom: 18 },
  plansContainer: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  planCard: { 
    flex: 1, 
    backgroundColor: C.white, 
    padding: 16, 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  planSelected: { borderColor: C.primary, backgroundColor: '#F0F4FF' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  planName: { fontSize: 14, fontWeight: '800', color: C.textGray },
  planTextSelected: { color: C.primary },
  planDesc: { fontSize: 11, color: C.textGray, lineHeight: 15 },
  benefitsBox: { 
    backgroundColor: 'rgba(30, 79, 163, 0.05)', 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 35 
  },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  checkCircle: { 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    backgroundColor: C.yellow, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 2,
  },
  benefitText: { fontSize: 13, color: C.textDark, flex: 1, lineHeight: 18, fontWeight: '500' },
  continueBtn: { 
    backgroundColor: C.yellow, 
    height: 60, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: C.yellow,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  btnLoading: { backgroundColor: '#CBD5E1' },
  continueBtnText: { color: C.primary, fontWeight: '900', fontSize: 17 },
});
