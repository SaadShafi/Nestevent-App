import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';
import { Icon } from './Icon';
import { Input, type InputProps } from './Input';

export type SelectOption<T extends string = string> = { value: T; label: string; description?: string };

type Props<T extends string> = Omit<InputProps, 'value' | 'onChange' | 'onChangeText' | 'onPressField'> & {
  options: SelectOption<T>[];
  value?: T | null;
  onChange: (value: T) => void;
  sheetTitle?: string;
};

/** Dropdown field that opens a bottom sheet of options (Organization Type, Category, etc.). */
export function Select<T extends string>({ options, value, onChange, sheetTitle, placeholder = 'Select', ...rest }: Props<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <>
      <Input
        {...rest}
        placeholder={placeholder}
        value={current?.label ?? ''}
        onPressField={() => setOpen(true)}
        right={<Icon name="chevron-down" size={18} color={colors.textSecondary} />}
      />
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={sheetTitle ?? rest.label ?? 'Select'} scroll>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => {
                onChange(o.value);
                setOpen(false);
              }}
              style={[styles.row, active && styles.active]}>
              <View style={styles.flex}>
                <AppText variant="title">{o.label}</AppText>
                {o.description ? (
                  <AppText variant="caption" secondary>
                    {o.description}
                  </AppText>
                ) : null}
              </View>
              {active ? <Icon name="checkmark-circle" size={20} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  active: { borderWidth: 1.5, borderColor: colors.primary },
  flex: { flex: 1 },
});
