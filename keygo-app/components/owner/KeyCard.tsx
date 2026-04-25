import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';
import { Key } from '../../services/key.service';

interface KeyCardProps {
  item: Key;
  onPress: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  WAITING_DEPOSIT: { label: 'Esperando depósito', color: COLORS.textGray, bg: '#F1F5F9' },
  DEPOSITED: { label: 'En tienda', color: COLORS.success, bg: '#ECFDF5' },
  IN_USE: { label: 'En uso', color: COLORS.warning, bg: '#FFFBEB' },
  DELETED: { label: 'Eliminada', color: COLORS.danger, bg: '#FEF2F2' },
};

export const KeyCard: React.FC<KeyCardProps> = ({ item, onPress }) => {
  const status = STATUS_CONFIG[item.key_status] || STATUS_CONFIG.WAITING_DEPOSIT;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🔑</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{item.key_name}</Text>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 24,
    color: COLORS.textGray,
    marginLeft: SPACING.sm,
  },
});
