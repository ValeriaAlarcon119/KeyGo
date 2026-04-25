import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Platform,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { keyService, Key } from '../../../services/key.service';

const C = { 
  primary:  '#1E4FA3', 
  yellow:   '#F4C430', 
  bg:       '#F6F8FF', 
  white:    '#FFFFFF', 
  textDark: '#0F172A', 
  textGray: '#64748B', 
  success:  '#10B981' 
};

export default function SuccessScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const { keyId, depositCode } = useLocalSearchParams();
  const [keyData, setKeyData] = useState<Key | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && keyId) {
      keyService.getById(keyId as string, token)
        .then(setKeyData)
        .finally(() => setLoading(false));
    }
  }, [keyId, token]);

  const onShare = async () => {
    try {
      await Share.share({
        message: `¡Nueva llave en KeyGo! Código de depósito: ${depositCode}. Punto: ${keyData?.store?.store_name}. Dirección: ${keyData?.store?.address}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header con Info de Tienda */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.replace('/(owner)/dashboard')} style={s.closeBtn}>
            <Ionicons name="close" size={24} color={C.textDark} />
          </TouchableOpacity>
          <View style={s.storeInfo}>
            <View style={s.storeIconBox}>
              <Ionicons name="storefront" size={20} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.storeName} numberOfLines={1}>{keyData?.store?.store_name ?? 'Punto Aliado'}</Text>
              <View style={s.badge}><Text style={s.badgeText}>En espera de depósito</Text></View>
            </View>
          </View>
        </View>

        {/* Tarjeta Principal de Información */}
        <View style={s.card}>
          <View style={s.infoSection}>
            <Text style={s.infoLabel}>Estado (actual)</Text>
            <Text style={s.statusValue}>
              <Ionicons name="time-outline" size={14} color={C.success} /> Llave lista para ser depositada
            </Text>
          </View>

          <View style={s.divider} />

          <View style={s.infoSection}>
            <Text style={s.infoLabel}>Dirección del punto</Text>
            <Text style={s.infoValue}>{keyData?.store?.address}, {keyData?.store?.city}</Text>
          </View>

          <View style={s.infoSection}>
            <Text style={s.infoLabel}>HORARIO DE ATENCIÓN</Text>
            <Text style={s.infoValue}>{keyData?.store?.opening_hours || 'Lunes a Viernes 8am - 8pm'}</Text>
          </View>

          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.infoLabel}>Llavero Id</Text>
              <Text style={s.infoValue}>--- (Pendiente)</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.infoLabel}>Plan</Text>
              <Text style={s.infoValue}>{keyData?.plan_type === 'MONTHLY' ? 'Pago mensual' : 'Pago por uso'}</Text>
            </View>
          </View>

          {/* Caja del Código */}
          <View style={s.codeBox}>
            <Text style={s.codeLabel}>CÓDIGO DE DEPÓSITO INICIAL</Text>
            <Text style={s.codeText}>{depositCode}</Text>
            <Text style={s.codeHint}>Entrega este código en el mostrador</Text>
          </View>

          {/* Acciones */}
          <TouchableOpacity 
            style={s.mainAction} 
            onPress={() => router.push({ pathname: '/(owner)/codes/create', params: { keyId: keyData?.id } } as any)}
          >
             <Ionicons name="qr-code-outline" size={20} color={C.primary} />
             <Text style={s.mainActionText}>Obtener un código de recogida</Text>
          </TouchableOpacity>

          <View style={s.footerActions}>
            <TouchableOpacity 
              style={s.secAction} 
              onPress={() => router.push({ pathname: '/(owner)/codes/[keyId]', params: { keyId: keyData?.id } } as any)}
            >
              <Ionicons name="list-outline" size={18} color={C.textGray} />
              <Text style={s.secActionText}>Ver mis códigos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={s.secAction} onPress={() => router.replace('/(owner)/dashboard')}>
              <Ionicons name="home-outline" size={18} color={C.textGray} />
              <Text style={s.secActionText}>Ir al inicio</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.helpText}>¿Necesitas ayuda? Contacta a soporte KeyGo</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, gap: 15 },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  storeInfo: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: C.white,
    padding: 12,
    borderRadius: 18,
    gap: 12,
    elevation: 1,
  },
  storeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeName: { fontSize: 16, fontWeight: '800', color: C.textDark },
  badge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 2 },
  badgeText: { color: C.success, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  card: { 
    backgroundColor: C.white, 
    borderRadius: 28, 
    padding: 24, 
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 15, 
    elevation: 8 
  },
  infoSection: { marginBottom: 18 },
  infoLabel: { fontSize: 11, fontWeight: '800', color: C.textGray, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  statusValue: { color: C.success, fontSize: 14, fontWeight: '700' },
  infoValue: { color: C.textDark, fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: C.border, marginBottom: 18 },
  row: { flexDirection: 'row', marginBottom: 20 },
  codeBox: { 
    backgroundColor: '#FFFBEB', 
    padding: 24, 
    borderRadius: 22, 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: C.yellow, 
    borderStyle: 'dashed',
    marginBottom: 25,
    shadowColor: C.yellow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  codeLabel: { fontSize: 10, fontWeight: '900', color: C.yellow, marginBottom: 8, letterSpacing: 1 },
  codeText: { fontSize: 38, fontWeight: '900', color: C.primary, letterSpacing: 8 },
  codeHint: { fontSize: 12, color: '#D97706', marginTop: 8, fontWeight: '600' },
  mainAction: { 
    backgroundColor: '#FEF9C3', 
    padding: 18, 
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.yellow,
  },
  mainActionText: { color: C.primary, fontWeight: '800', fontSize: 15 },
  footerActions: { flexDirection: 'row', gap: 10 },
  secAction: { 
    flex: 1,
    padding: 15, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: C.border, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 8,
  },
  secActionText: { color: C.textGray, fontWeight: '700', fontSize: 13 },
  helpText: { textAlign: 'center', color: C.textGray, fontSize: 12, marginTop: 25, fontWeight: '500' },
});
