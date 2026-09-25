import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, View, type TextInput } from 'react-native';

import { colors } from '@/theme';

import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';
import { Icon } from './Icon';
import { Input, type InputProps } from './Input';

export const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
];

type Props = Omit<InputProps, 'left' | 'keyboardType'> & {
  countryCode?: string;
  onCountryChange?: (code: string) => void;
};

/** Phone field with flag + dial code selector, matching the Figma "Phone Number" input. */
export const PhoneInput = forwardRef<TextInput, Props>(function PhoneInput({ countryCode = '+1', onCountryChange, dense, ...rest }, ref) {
  const [open, setOpen] = useState(false);
  const current = COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0];
  return (
    <>
      <Input
        ref={ref}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        placeholder="Phone Number"
        left={
          <Pressable onPress={() => setOpen(true)} style={styles.prefix} hitSlop={6}>
            <AppText style={styles.flag}>{current.flag}</AppText>
            <Icon name="chevron-down" size={14} color={colors.textSecondary} />
            <AppText variant={dense ? 'caption' : 'label'} secondary>
              {current.code}
            </AppText>
            <View style={styles.divider} />
          </Pressable>
        }
        dense={dense}
        {...rest}
      />
      <BottomSheet visible={open} onClose={() => setOpen(false)} title="Country code">
        {COUNTRY_CODES.map((c) => (
          <Pressable
            key={c.code}
            onPress={() => {
              onCountryChange?.(c.code);
              setOpen(false);
            }}
            style={styles.row}>
            <AppText style={styles.flag}>{c.flag}</AppText>
            <AppText style={styles.rowName}>{c.name}</AppText>
            <AppText secondary>{c.code}</AppText>
            {c.code === countryCode ? <Icon name="checkmark-circle" color={colors.primary} size={20} /> : null}
          </Pressable>
        ))}
      </BottomSheet>
    </>
  );
});

const styles = StyleSheet.create({
  prefix: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flag: { fontSize: 22 },
  divider: { width: 1, height: 22, backgroundColor: colors.border, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowName: { flex: 1 },
});
