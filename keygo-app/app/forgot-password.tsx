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
  white: '#FFFFFF',
};

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleResetRequest = async () => {
    setMsg({ type: null, text: '' });
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setMsg({ type: 'error', text: '📧 Por favor ingresa un correo electrónico válido.' });
      shake();
      return;
    }

    setIsLoading(true);
    // Simulating API call for now since backend doesn't have the endpoint yet
    setTimeout(() => {
      setIsLoading(false);
      setMsg({ 
        type: 'success', 
        text: '🕊️ Si tu correo está registrado, recibirás instrucciones para recuperar tu contraseña en unos minutos.' 
      });
    }, 1500);
  };

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
        >
          {/* Logo Section */}
          <TouchableOpacity 
            style={styles.logoSection} 
            onPress={() => router.replace('/login')}
          >
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Form Card */}
          <View style={[styles.card, isDesktop && styles.desktopForm]}>
            <Text style={styles.title}>Recuperar contraseña</Text>
            <Text style={styles.subtitle}>
              Ingresa tu correo electrónico y te enviaremos los pasos para restablecer tu cuenta.
            </Text>

            {msg.type && (
              <View style={[styles.msgBox, { backgroundColor: msg.type === 'success' ? '#F0FDF4' : '#FEF2F2', borderColor: msg.type === 'success' ? '#10B981' : '#E53935' }]}>
                <Text style={[styles.msgText, { color: msg.type === 'success' ? '#16A34A' : '#B91C1C' }]}>{msg.text}</Text>
              </View>
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

            <TouchableOpacity
              style={[styles.btn, isLoading && styles.btnDisabled]}
              onPress={handleResetRequest}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <Text style={styles.btnText}>Enviar instrucciones →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backText}>Volver al inicio de sesión</Text>
            </TouchableOpacity>
          </View>
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
  desktopForm: { shadowOpacity: 0.1 },
  
  title: { fontSize: 24, fontWeight: '900', color: COLORS.dark, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.gray, textAlign: 'center', marginBottom: 24, lineHeight: 20 },

  msgBox: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 20 },
  msgText: { fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18 },

  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.dark, marginBottom: 8 },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputFocused: { borderColor: COLORS.primary },
  input: { height: 52, fontSize: 16, color: COLORS.dark },

  btn: {
    backgroundColor: COLORS.yellow,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.yellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: COLORS.primary, fontSize: 17, fontWeight: '800' },

  backBtn: { marginTop: 24, alignItems: 'center' },
  backText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});
