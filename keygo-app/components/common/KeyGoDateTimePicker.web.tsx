import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
}

export default function KeyGoDateTimePicker({ value, onChange, onClose }: Props) {
  // En Web usamos un input nativo de HTML5 para datetime-local
  const isoStr = new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <View style={s.container}>
      <input
        type="datetime-local"
        value={isoStr}
        onChange={(e) => {
          const d = new Date(e.target.value);
          onChange(d);
        }}
        style={{
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          width: '100%',
          fontSize: '16px',
          fontFamily: 'inherit',
          backgroundColor: '#FFFFFF',
          outline: 'none'
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 8,
  }
});
