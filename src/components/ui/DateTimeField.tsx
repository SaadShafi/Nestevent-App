import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { formatShortDate, formatTime } from '@/lib/format';
import { colors } from '@/theme';

import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Icon } from './Icon';
import { Input, type InputProps } from './Input';

type Props = Omit<InputProps, 'value' | 'onChange' | 'onChangeText' | 'onPressField'> & {
  value: Date | null;
  onChange: (d: Date) => void;
  mode?: 'date' | 'time';
  minimumDate?: Date;
};

/**
 * Platform-native date/time picker field.
 * iOS  → inline spinner inside a bottom sheet (matches the Figma TimePicker element).
 * Android → the system dialog via DateTimePickerAndroid.
 */
export function DateTimeField({ value, onChange, mode = 'date', minimumDate, placeholder, ...rest }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ?? new Date());

  const display = value ? (mode === 'date' ? formatShortDate(value) : formatTime(value)) : '';

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: value ?? new Date(),
        mode,
        is24Hour: false,
        minimumDate,
        onChange: (e: DateTimePickerEvent, d?: Date) => {
          if (e.type === 'set' && d) onChange(d);
        },
      });
    } else {
      setDraft(value ?? new Date());
      setOpen(true);
    }
  };

  return (
    <>
      <Input
        {...rest}
        placeholder={placeholder ?? (mode === 'date' ? 'Select date' : 'Select time')}
        value={display}
        onPressField={openPicker}
        right={<Icon name={mode === 'date' ? 'calendar-outline' : 'time-outline'} size={18} color={colors.textSecondary} />}
      />
      {Platform.OS === 'ios' ? (
        <BottomSheet visible={open} onClose={() => setOpen(false)} title={mode === 'date' ? 'Select date' : 'Select time'}>
          <View style={styles.picker}>
            <DateTimePicker
              value={draft}
              mode={mode}
              display={mode === 'date' ? 'inline' : 'spinner'}
              minimumDate={minimumDate}
              themeVariant="dark"
              accentColor={colors.primary}
              onChange={(_, d) => d && setDraft(d)}
            />
          </View>
          <Button
            title="Done"
            variant="white"
            onPress={() => {
              onChange(draft);
              setOpen(false);
            }}
          />
        </BottomSheet>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  picker: { alignItems: 'center', marginBottom: 16 },
});
