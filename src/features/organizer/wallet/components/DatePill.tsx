import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText, BottomSheet, Button, Icon } from '@/components/ui';
import { formatLongDate } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

type Props = { value: Date; onChange: (d: Date) => void };

/**
 * "Thursday, Nov 4, 2025" pill with a calendar icon (Transactions History).
 * Same platform behaviour as DateTimeField: iOS inline calendar in a sheet, Android system dialog.
 */
export function DatePill({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value);

  const openPicker = () => {
    haptic.light();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: 'date',
        onChange: (e: DateTimePickerEvent, d?: Date) => {
          if (e.type === 'set' && d) onChange(d);
        },
      });
    } else {
      setDraft(value);
      setOpen(true);
    }
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change date"
        onPress={openPicker}
        style={({ pressed }) => [styles.pill, pressed && styles.pressed]}>
        <AppText variant="label" style={styles.flex}>
          {formatLongDate(value)}
        </AppText>
        <Icon name="calendar-outline" size={18} color={colors.primary} />
      </Pressable>
      {Platform.OS === 'ios' ? (
        <BottomSheet visible={open} onClose={() => setOpen(false)} title="Select date">
          <View style={styles.picker}>
            <DateTimePicker
              value={draft}
              mode="date"
              display="inline"
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
  flex: { flex: 1 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    height: 50,
    marginBottom: 14,
  },
  pressed: { opacity: 0.85 },
  picker: { alignItems: 'center', marginBottom: 16 },
});
