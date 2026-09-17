import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { colors, fonts, radius } from '@/theme';

import { Icon } from './Icon';
import { IconButton } from './IconButton';

type Props = TextInputProps & {
  onFilterPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  /** Search icon on the right (SMS blast search) */
  iconRight?: boolean;
};

export function SearchBar({ onFilterPress, containerStyle, iconRight, ...rest }: Props) {
  return (
    <View style={[styles.row, containerStyle]}>
      <View style={styles.field}>
        {!iconRight ? <Icon name="search-outline" size={20} color={colors.textSecondary} /> : null}
        <TextInput
          placeholder="Search"
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          {...rest}
        />
        {iconRight ? <Icon name="search-outline" size={20} color={colors.textSecondary} /> : null}
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
  input: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 15, height: '100%' },
});
