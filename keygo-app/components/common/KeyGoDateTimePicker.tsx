import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
}

export default function KeyGoDateTimePicker({ value, onChange, onClose }: Props) {
  return (
    <DateTimePicker
      value={value}
      mode="datetime"
      is24Hour={true}
      onChange={(event: any, date?: Date) => {
        onClose();
        if (date) onChange(date);
      }}
    />
  );
}
