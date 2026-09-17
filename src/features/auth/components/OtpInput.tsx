import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, fonts, radius } from '@/theme';

type Props = { value: string; onChange: (v: string) => void; length?: number };

/** Dark rounded container with N circles; filled orange with the digit when entered. Hidden input captures keys. */
export function OtpInput({ value, onChange, length = 4 }: Props) {
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => ref.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  const digits = value.split('');

  return (
    <Pressable onPress={() => ref.current?.focus()} style={styles.wrap} accessibilityLabel="Verification code">
      {Array.from({ length }).map((_, i) => {
        const d = digits[i];
        const active = focused && i === value.length;
        return (
          <View key={i} style={[styles.circle, d ? styles.filled : null, active && styles.active]}>
            {d ? <AppText style={styles.digit}>{d}</AppText> : null}
          </View>
        );
      })}
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus
        caretHidden
        textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : undefined}
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        style={styles.hidden}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    paddingVertical: 22,
    paddingHorizontal: 12,
  },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  filled: { backgroundColor: colors.primary },
  active: { borderColor: colors.primary },
  digit: { fontFamily: fonts.semibold, fontSize: 18, color: colors.white },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
