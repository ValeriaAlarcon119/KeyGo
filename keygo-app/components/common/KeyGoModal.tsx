import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface KeyGoModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const C = {
  primary:  '#1E4FA3',
  yellow:   '#F4C430',
  white:    '#FFFFFF',
  textDark: '#0F172A',
  textGray: '#64748B',
  success:  '#10B981',
  error:    '#EF4444',
  warning:  '#F59E0B',
};

export default function KeyGoModal({
  visible,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText = 'Entendido',
  cancelText = 'Cancelar',
}: KeyGoModalProps) {
  
  const getIcon = () => {
    switch (type) {
      case 'success': return { name: 'checkmark-circle', color: C.success };
      case 'error':   return { name: 'close-circle',     color: C.error };
      case 'warning': return { name: 'warning',          color: C.warning };
      default:        return { name: 'information-circle', color: C.primary };
    }
  };

  const icon = getIcon();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={[s.iconBg, { backgroundColor: icon.color + '15' }]}>
            <Ionicons name={icon.name as any} size={40} color={icon.color} />
          </View>

          <Text style={s.title}>{title}</Text>
          <Text style={s.message}>{message}</Text>

          <View style={s.footer}>
            {onCancel && (
              <TouchableOpacity style={s.cancelBtn} onPress={onCancel}>
                <Text style={s.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[s.confirmBtn, { backgroundColor: type === 'error' ? C.error : C.yellow }]} 
              onPress={onConfirm}
            >
              <Text style={[s.confirmText, { color: type === 'error' ? C.white : C.primary }]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: Platform.OS === 'web' ? 400 : width - 48,
    backgroundColor: C.white,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: C.textDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: C.textGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  confirmBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.yellow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textGray,
  },
});
