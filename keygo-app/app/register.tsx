import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { authService } from '../services/auth.service';

const { width } = Dimensions.get('window');
const isDesktop = width > 768;

const COLORS = {
  primary: '#1E4FA3',
  yellow: '#F4C430',
  danger: '#E53935',
  success: '#10B981',
  warning: '#F59E0B',
  dark: '#1F2937',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  background: '#FFFFFF',
  white: '#FFFFFF',
  inputBorder: '#E5E7EB',
};

// Validation helpers
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const HAS_NUMBER = /\d/;
const PASSWORD_RULES = {
  length: (p: string) => p.length >= 8,
  upper: (p: string) => /[A-Z]/.test(p),
  lower: (p: string) => /[a-z]/.test(p),
  number: (p: string) => /\d/.test(p),
  special: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
};

type Role = 'OWNER' | 'STORE' | 'ADMIN';

interface FieldError {
  fullName?: string;
  email?: string;
  password?: string;
  role?: string;
}

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('OWNER');
  const [errors, setErrors] = useState<FieldError>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const pwStrength = () => {
    const passed = Object.values(PASSWORD_RULES).filter(r => r(password)).length;
    if (passed <= 1) return { label: 'Muy débil', color: '#EF4444', pct: 0.2 };
    if (passed === 2) return { label: 'Débil', color: '#F97316', pct: 0.4 };
    if (passed === 3) return { label: 'Regular', color: COLORS.warning, pct: 0.6 };
    if (passed === 4) return { label: 'Fuerte', color: '#84CC16', pct: 0.8 };
    return { label: '¡Excelente!', color: COLORS.success, pct: 1 };
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const validate = (): boolean => {
    const newErrors: FieldError = {};

    if (!fullName.trim()) {
      newErrors.fullName = '✏️ El nombre completo es obligatorio.';
    } else if (HAS_NUMBER.test(fullName)) {
      newErrors.fullName = '✏️ El nombre no puede contener números.';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = '✏️ El nombre debe tener al menos 3 caracteres.';
    }

    if (!email.trim()) {
      newErrors.email = '📧 El correo es obligatorio.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = '📧 Ingresa un correo electrónico válido.';
    }

    if (!password) {
      newErrors.password = '🔒 La contraseña es obligatoria.';
    } else {
      const strength = pwStrength();
      if (strength.pct < 0.6) {
        newErrors.password = '🔒 La contraseña es muy débil. Usa mayúsculas, números y símbolos.';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      shake();
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setSuccessMsg('');
    try {
      await authService.register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      setSuccessMsg('🎉 ¡Cuenta creada correctamente! Ahora puedes iniciar sesión.');
      setTimeout(() => router.replace('/login'), 2500);
    } catch (error: any) {
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.message;
      if (status === 409 || serverMsg?.toLowerCase().includes('already') || serverMsg?.toLowerCase().includes('existe')) {
        setErrors({ email: '📧 Este correo ya está registrado. ¿Deseas iniciar sesión?' });
      } else {
        setErrors({ email: serverMsg || '⚠️ Error al crear la cuenta. Intenta de nuevo.' });
      }
      shake();
    } finally {
      setIsLoading(false);
    }
  };

  const strength = pwStrength();

  const roles: { value: Role; label: string; emoji: string }[] = [
    { value: 'OWNER', label: 'Propietario', emoji: '🏠' },
    { value: 'STORE', label: 'Punto aliado', emoji: '🏪' },
    { value: 'ADMIN', label: 'Administrador', emoji: '🛡️' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section - Massive & Clickable */}
          <TouchableOpacity 
            style={styles.logoSection} 
            onPress={() => router.replace('/')}
            activeOpacity={0.8}
          >
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Form Card */}
          <Animated.View style={[styles.card, isDesktop && styles.cardDesktop, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={styles.cardTitle}>Crear cuenta</Text>

            {/* Success message */}
            {successMsg ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            ) : null}

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nombre completo</Text>
              <View style={[styles.inputWrap, errors.fullName ? styles.inputError : null]}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="María González (sin números)"
                  placeholderTextColor={COLORS.lightGray}
                  autoCapitalize="words"
                  value={fullName}
                  onChangeText={(t) => {
                    setFullName(t);
                    if (errors.fullName) setErrors(e => ({ ...e, fullName: undefined }));
                  }}
                />
              </View>
              {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={[styles.inputWrap, errors.email ? styles.inputError : null]}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.input}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={COLORS.lightGray}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errors.email) setErrors(e => ({ ...e, email: undefined }));
                  }}
                />
              </View>
              {errors.email ? (
                <View>
                  <Text style={styles.errorText}>{errors.email}</Text>
                  {errors.email.includes('registrado') && (
                    <TouchableOpacity onPress={() => router.replace('/login')}>
                      <Text style={styles.errorLink}>Ir a iniciar sesión →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={[styles.inputWrap, errors.password ? styles.inputError : null]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor={COLORS.lightGray}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errors.password) setErrors(e => ({ ...e, password: undefined }));
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Text>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              {/* Password strength bar */}
              {password.length > 0 && (
                <View style={styles.strengthWrap}>
                  <View style={styles.strengthBar}>
                    <View style={[styles.strengthFill, { width: `${strength.pct * 100}%` as any, backgroundColor: strength.color }]} />
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                </View>
              )}
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Role selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>¿Cuál es tu rol?</Text>
              <View style={styles.rolesWrap}>
                {roles.map(r => (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.roleCard, role === r.value && styles.roleCardActive]}
                    onPress={() => setRole(r.value)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.roleEmoji}>{r.emoji}</Text>
                    <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>
                      {r.label}
                    </Text>
                    {role === r.value && (
                      <View style={styles.roleCheck}>
                        <Text style={styles.roleCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.btn, isLoading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.88}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <Text style={styles.btnText}>Crear mi cuenta →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/login')}>
              <Text style={styles.loginLinkText}>
                ¿Ya tienes cuenta? <Text style={styles.loginLinkBold}>Inicia sesión aquí</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  
  logoSection: {
    alignItems: 'center',
    marginBottom: -80,
    width: '100%',
  },
  logo: {
    width: width * 1.3,
    height: 280,
  },

  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardDesktop: { shadowOpacity: 0.1 },
  cardTitle: { fontSize: 28, fontWeight: '900', color: COLORS.dark, marginBottom: 20, textAlign: 'center' },

  successBox: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: COLORS.success, borderRadius: 12, padding: 14, marginBottom: 18 },
  successText: { color: '#16A34A', fontSize: 14, fontWeight: '600', textAlign: 'center' },

  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.dark, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  inputError: { borderColor: COLORS.danger, backgroundColor: '#FFF5F5' },
  inputIcon: { fontSize: 17 },
  input: { flex: 1, height: 50, fontSize: 16, color: COLORS.dark },
  eyeBtn: { padding: 8 },
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: 6, fontWeight: '500' },
  errorLink: { color: COLORS.primary, fontSize: 12, marginTop: 4, fontWeight: '700', textAlign: 'center' },

  strengthWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
  strengthBar: { flex: 1, height: 4, backgroundColor: '#F3F4F6', borderRadius: 2, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '700', minWidth: 70 },

  rolesWrap: { flexDirection: 'row', gap: 10 },
  roleCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  roleCardActive: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
  roleEmoji: { fontSize: 28 },
  roleLabel: { fontSize: 12, fontWeight: '700', color: COLORS.gray, textAlign: 'center' },
  roleLabelActive: { color: COLORS.primary },
  roleCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCheckText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },

  btn: {
    backgroundColor: COLORS.yellow,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.yellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: COLORS.primary, fontSize: 17, fontWeight: '800' },

  loginLink: { marginTop: 20, alignItems: 'center' },
  loginLinkText: { color: COLORS.gray, fontSize: 14 },
  loginLinkBold: { color: COLORS.primary, fontWeight: '700' },
});
