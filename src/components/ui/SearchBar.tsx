import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { colors, fonts, radius } from '@/theme';

import { Icon } from './Icon';
import { IconButton } from './IconButton';

type Props = TextInputProps & {
  onFilterPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  /** Search icon on the right (SMS blast search) */
  iconRight?: boolean;
  /**
   * Figma field styles with a white icon + placeholder:
   * 'glass' — translucent dark glass over the orange Home header;
   * 'dark'  — near-black gradient field with a grey hairline ring (Messages).
   */
  tone?: 'glass' | 'dark';
};

export function SearchBar({ onFilterPress, containerStyle, iconRight, tone, ...rest }: Props) {
  const iconColor = tone ? colors.white : colors.textSecondary;
  return (
    <View style={[styles.row, containerStyle]}>
      <View style={[styles.field, tone === 'glass' && styles.glass, tone === 'dark' && styles.dark]}>
        {tone === 'dark' ? <LinearGradient colors={['#050506', '#111112']} style={StyleSheet.absoluteFill} /> : null}
        {!iconRight ? <Icon name="search-outline" size={20} color={iconColor} /> : null}
        <TextInput
          placeholder="Search"
          placeholderTextColor={tone ? colors.white : colors.placeholder}
          selectionColor={colors.primary}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          {...rest}
        />
        {iconRight ? <Icon name="search-outline" size={20} color={iconColor} /> : null}
      </View>
      {onFilterPress ? (
        <IconButton onPress={onFilterPress} size={50} accessibilityLabel="Filters">
          <Icon name="options-outline" size={22} />
        </IconButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  field: {
    flex: 1,
    height: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  glass: { backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  dark: { overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  input: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 15, height: '100%' },
});
