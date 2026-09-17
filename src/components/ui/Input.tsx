import { forwardRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, layout, radius } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

export type InputProps = TextInputProps & {
  label?: string;
  labelHint?: string;
  error?: string;
  left?: ReactNode;
  right?: ReactNode;
  /** Renders eye toggle and secures text */
  password?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  fieldStyle?: StyleProp<ViewStyle>;
  /** Shows "n / max" counter for multiline fields */
  maxLength?: number;
  showCounter?: boolean;
  /** Renders the field as a pressable (for pickers) */
  onPressField?: () => void;
  /** Outlined variant (thin border, used by Marketing Hub forms) */
  outlined?: boolean;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    labelHint,
    error,
    left,
    right,
    password,
    containerStyle,
    fieldStyle,
    multiline,
    maxLength,
    showCounter,
    value,
    onPressField,
    outlined,
    style,
    editable = true,
    ...rest
  },
  ref,
) {
  const [hidden, setHidden] = useState(!!password);
  const [focused, setFocused] = useState(false);

  const field = (
    <View
      style={[
        styles.field,
        multiline && styles.multiline,
        outlined && styles.outlined,
        focused && styles.focused,
        !!error && styles.errorBorder,
        fieldStyle,
      ]}>
      {left ? <View style={styles.adornment}>{left}</View> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.placeholder}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        secureTextEntry={hidden}
        multiline={multiline}
        maxLength={maxLength}
        value={value}
        editable={editable && !onPressField}
        pointerEvents={onPressField ? 'none' : 'auto'}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[styles.input, multiline && styles.inputMultiline, style]}
        {...rest}
      />
      {password ? (
        <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} style={styles.adornment}>
          <Icon name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textSecondary} />
        </Pressable>
      ) : right ? (
        <View style={styles.adornment}>{right}</View>
      ) : null}
      {multiline && (showCounter || maxLength) ? (
        <AppText variant="caption" muted style={styles.counter}>
          {(value?.length ?? 0)} / {maxLength ?? 0}
        </AppText>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <AppText variant="label">{label}</AppText>
          {labelHint ? (
            <AppText variant="label" muted>
              {' '}
              {labelHint}
            </AppText>
          ) : null}
        </View>
      ) : null}
      {onPressField ? (
        <Pressable onPress={onPressField}>{field}</Pressable>
      ) : (
        field
      )}
      {error ? (
        <AppText variant="caption" color={colors.danger} style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  field: {
    minHeight: layout.inputHeight,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  outlined: { backgroundColor: colors.bg, borderColor: '#2C2C3A', borderRadius: radius.md },
  multiline: {
    minHeight: 130,
    borderRadius: radius.lg,
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingBottom: 30,
  },
  focused: { borderColor: colors.primary },
  errorBorder: { borderColor: colors.danger },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
    paddingVertical: 0,
    height: '100%',
  },
  inputMultiline: { textAlignVertical: 'top', height: undefined, minHeight: 90 },
  adornment: { alignItems: 'center', justifyContent: 'center' },
  counter: { position: 'absolute', right: 16, bottom: 10 },
  error: { marginTop: 6, marginLeft: 6 },
});
