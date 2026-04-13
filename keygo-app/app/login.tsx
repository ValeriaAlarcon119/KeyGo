import React, { useState, useRef, useEffect } from 'react';
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
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const isDesktop = width > 768;

const COLORS = {
  primary: '#1E4FA3',
  yellow: '#F4C430',
  danger: '#E53935',
  success: '#10B981',
  dark: '#1F2937',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  background: '#FFFFFF',
  white: '#FFFFFF',
  inputBorder: '#E5E7EB',
};

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

type MsgType = 'success' | 'error' | 'info' | null;
interface Msg { type: MsgType; text: string }

export default function LoginScreen() {
  const { login, isLoading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [msg, setMsg] = useState<Msg>({ type: null, text: '' });

  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Navigation listener: when user is set after login, go to dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'OWNER') router.replace('/(owner)/dashboard');
      else if (user.role === 'STORE') router.replace('/(store)/dashboard');
      else if (user.role === 'ADMIN') router.replace('/(admin)/dashboard');
    }
  }, [user]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const showMsg = (type: MsgType, text: string) => {
    setMsg({ type, text });
    if (type !== 'info') setTimeout(() => setMsg({ type: null, text: '' }), 6000);
  };

  const handleLogin = async () => {
    setMsg({ type: null, text: '' });
    if (!email.trim()) { 
      showMsg('error', '📧 Por favor ingresa tu correo electrónico.'); 
      shake(); 
      return; 
    }
    if (!EMAIL_REGEX.test(email.trim())) { 
      showMsg('error', '📧 El correo no tiene un formato válido.'); 
      shake(); 
      return; 
    }
    if (!password.trim()) { 
      showMsg('error', '🔒 Por favor ingresa tu contraseña.'); 
      shake(); 
      return; 
    }

    try {
      await login({ email: email.trim().toLowerCase(), password });
      // Navigation is handled by useEffect when 'user' state changes
    } catch (error: any) {
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.message;
      const msgStr = Array.isArray(serverMsg) ? serverMsg.join(' ') : (typeof serverMsg === 'string' ? serverMsg : '');

      if (status === 401) {
        if (msgStr.toLowerCase().includes('password') || msgStr.toLowerCase().includes('contraseña')) {
          showMsg('error', '🔑 Contraseña incorrecta. Verifica e intenta de nuevo.');
        } else {
          showMsg('error', '🔑 Credenciales inválidas. Revisa tu correo y contraseña.');
        }
      } else if (status === 404 || msgStr.toLowerCase().includes('not found') || msgStr.toLowerCase().includes('no encontrado')) {
        showMsg('info', '👤 No encontramos una cuenta con ese correo. ¿Quieres registrarte gratis?');
      } else if (!error?.response) {
        showMsg('error', '📡 Sin conexión al servidor. Verifica tu internet e intenta de nuevo.');
      } else {
        showMsg('error', msgStr || '⚠️ Ocurrió un error inesperado. Intenta de nuevo.');
      }
      shake();
    }
  };

  const msgBg = msg.type === 'success' ? '#F0FDF4' : msg.type === 'info' ? '#EFF6FF' : '#FEF2F2';
  const msgColor = msg.type === 'success' ? '#10B981' : msg.type === 'info' ? COLORS.primary : COLORS.danger;

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

          {/* Login Form */}
          <View style={[styles.formContainer, isDesktop && styles.desktopForm]}>
            {msg.type && (
              <Animated.View style={[styles.msgBox, { backgroundColor: msgBg, borderColor: msgColor, transform: [{ translateX: shakeAnim }] }]}>
                <Text style={[styles.msgText, { color: msgColor }]}>{msg.text}</Text>
                {msg.type === 'info' && (
                  <TouchableOpacity style={styles.msgCta} onPress={() => router.push('/register')}>
                    <Text style={styles.msgCtaText}>Registrarme →</Text>
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={[styles.inputWrapper, emailFocused && styles.inputFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor={COLORS.lightGray}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={[styles.inputWrapper, passFocused && styles.inputFocused]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••••••"
                  placeholderTextColor={COLORS.lightGray}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Text>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, isLoading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <Text style={styles.loginBtnText}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.forgotBtn} 
              onPress={() => router.push('/forgot-password')}
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <View style={styles.registerWrap}>
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerLink}>Regístrate aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: -60,
    width: '100%',
  },
  logo: {
    width: width * 1.3,
    height: 300,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  desktopForm: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  msgBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  msgText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  msgCta: {
    marginTop: 8,
  },
  msgCtaText: {
    color: '#1E4FA3',
    fontWeight: '700',
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFocused: {
    borderColor: '#1E4FA3',
  },
  input: {
    height: 52,
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  eyeBtn: {
    padding: 8,
  },
  loginBtn: {
    backgroundColor: '#F4C430',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#F4C430',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#1E4FA3',
    fontSize: 18,
    fontWeight: '800',
  },
  forgotBtn: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  registerWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  registerText: {
    color: '#64748b',
    fontSize: 14,
  },
  registerLink: {
    color: '#1E4FA3',
    fontSize: 14,
    fontWeight: '700',
  },
});
