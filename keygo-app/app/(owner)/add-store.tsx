import React, { useState } from 'react';
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
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { storeService } from '../../services/store.service';

const COLORS = {
  primary: '#1E4FA3',
  yellow: '#F4C430',
  textDark: '#1A1A2E',
  textGray: '#71717A',
  background: '#F6F8FF',
  white: '#FFFFFF',
  success: '#10B981',
  border: '#E4E4E7',
  blueLight: '#EFF6FF',
  red: '#EF4444',
};

interface Field {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
  keyboardType?: any;
}

const FIELDS: Field[] = [
  { key: 'store_name',    label: 'Nombre del punto *',       placeholder: 'Ej: Tienda La Esquina',              required: true },
  { key: 'address',       label: 'Dirección *',              placeholder: 'Ej: Cl. 10 #45-12',                 required: true },
  { key: 'city',          label: 'Ciudad *',                 placeholder: 'Ej: Bogotá',                        required: true },
  { key: 'main_phone',    label: 'Teléfono principal *',     placeholder: 'Ej: 3001234567',                    required: true, keyboardType: 'phone-pad' },
  { key: 'owner_phone',   label: 'Teléfono del encargado',  placeholder: 'Ej: 3001234568',                    keyboardType: 'phone-pad' },
  { key: 'whatsapp',      label: 'WhatsApp (con código)',    placeholder: 'Ej: 573001234567',                  keyboardType: 'phone-pad' },
  { key: 'email',         label: 'Correo electrónico',       placeholder: 'Ej: tienda@correo.com',             keyboardType: 'email-address' },
  { key: 'opening_hours', label: 'Horario de atención',      placeholder: 'Ej: Lun-Sab 8:00am - 8:00pm',      multiline: true },
  { key: 'google_maps_link', label: 'Enlace Google Maps',   placeholder: 'https://maps.google.com/?q=...' },
  { key: 'instructions',  label: 'Instrucciones para el cliente', placeholder: 'Ej: Preguntar por la encargada en el mostrador.', multiline: true },
];

export default function AddStoreScreen() {
  const { token } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<Record<string, string>>(
    Object.fromEntries(FIELDS.map((f) => [f.key, ''])),
  );
  const [saving, setSaving] = useState(false);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    // Validar campos obligatorios
    const missing = FIELDS.filter((f) => f.required && !form[f.key].trim());
    if (missing.length > 0) {
      Alert.alert(
        'Campos requeridos',
        `Completa: ${missing.map((f) => f.label.replace(' *', '')).join(', ')}`,
      );
      return;
    }
    if (!token) return;

    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      FIELDS.forEach((f) => {
        if (form[f.key].trim()) payload[f.key] = form[f.key].trim();
      });

      await storeService.create(payload as any, token);

      Alert.alert(
        '✅ Punto aliado registrado',
        `"${form.store_name}" ha sido agregado al sistema. Ya puedes asignar llaves a este punto.`,
        [{ text: 'Ir al dashboard', onPress: () => router.replace('/(owner)/dashboard') }],
      );
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo registrar el punto. Intenta de nuevo.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Nuevo punto aliado</Text>
          <Text style={styles.headerSub}>Registrar punto físico de depósito</Text>
        </View>
      </View>

      {/* Indicador */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>🏪</Text>
        <Text style={styles.infoText}>
          Los puntos aliados son las tiendas donde los propietarios depositan sus llaves.
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.groupTitle}>📍 UBICACIÓN Y NOMBRE</Text>
          {FIELDS.slice(0, 3).map((field) => (
            <View key={field.key} style={styles.fieldGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={[styles.input, field.required && !form[field.key].trim() && styles.inputRequired]}
                placeholder={field.placeholder}
                placeholderTextColor="#9CA3AF"
                value={form[field.key]}
                onChangeText={(v) => update(field.key, v)}
              />
            </View>
          ))}

          <Text style={styles.groupTitle}>📞 CONTACTO DE LA TIENDA</Text>
          {FIELDS.slice(3, 7).map((field) => (
            <View key={field.key} style={styles.fieldGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="#9CA3AF"
                value={form[field.key]}
                onChangeText={(v) => update(field.key, v)}
                keyboardType={field.keyboardType || 'default'}
              />
            </View>
          ))}

          <Text style={styles.groupTitle}>⏰ OPERACIÓN E INSTRUCCIONES</Text>
          {FIELDS.slice(7).map((field) => (
            <View key={field.key} style={styles.fieldGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={[styles.input, field.multiline && styles.inputMulti]}
                placeholder={field.placeholder}
                placeholderTextColor="#9CA3AF"
                value={form[field.key]}
                onChangeText={(v) => update(field.key, v)}
                multiline={field.multiline}
                numberOfLines={field.multiline ? 3 : 1}
              />
            </View>
          ))}

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={styles.saveBtnText}>✅ Registrar Punto Aliado</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background,
    maxWidth: Platform.OS === 'web' ? 700 : '100%',
    alignSelf: Platform.OS === 'web' ? 'center' : 'auto',
    width: '100%',
  },

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
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textDark },
  headerSub: { fontSize: 13, color: COLORS.textGray, marginTop: 2 },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blueLight,
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoIcon: { fontSize: 22 },
  infoText: { flex: 1, fontSize: 13, color: COLORS.primary, lineHeight: 19 },

  form: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 8 },
  groupTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 16,
    opacity: 0.8,
  },
  fieldGroup: { marginBottom: 18 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textDark,
  },
  inputMulti: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  inputRequired: {
    borderColor: '#FCA5A5',
  },

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 24 },

  saveBtn: {
    backgroundColor: COLORS.yellow,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 5,
    shadowColor: COLORS.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  saveBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: '800' },

  cancelBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cancelBtnText: { color: COLORS.textGray, fontSize: 15, fontWeight: '600' },

  note: {
    fontSize: 11,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 18,
  },
});
