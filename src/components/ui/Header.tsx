import { useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, layout } from '@/theme';

import { AppText } from './AppText';
import { IconButton } from './IconButton';

type Props = {
  title?: string;
  /** 'back' (chevron) | 'close' (x) | 'none' */
  left?: 'back' | 'close' | 'none' | ReactNode;
  right?: ReactNode;
  onBack?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Transparent header laid over imagery */
  overlay?: boolean;
  titleColor?: string;
};

/** Standard screen header: circular back button + centered title + optional right slot. */
export function Header({ title, left = 'back', right, onBack, style, overlay, titleColor }: Props) {
  const router = useRouter();
  const goBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  let leftNode: ReactNode = null;
  if (left === 'back') {
    leftNode = (
      <IconButton
        name="chevron-back"
        onPress={goBack}
        accessibilityLabel="Go back"
        backgroundColor={overlay ? 'rgba(0,0,0,0.45)' : colors.surface}
      />
    );
  } else if (left === 'close') {
    leftNode = (
      <IconButton
        name="close"
        onPress={goBack}
        accessibilityLabel="Close"
        backgroundColor={overlay ? 'rgba(0,0,0,0.45)' : colors.surface}
      />
    );
  } else if (left !== 'none') {
    leftNode = left;
  }

  return (
    <View style={[styles.row, style]}>
      <View style={styles.side}>{leftNode}</View>
      {title ? (
        <AppText variant="h3" center numberOfLines={1} style={[styles.title, titleColor ? { color: titleColor } : null]}>
          {title}
        </AppText>
      ) : (
        <View style={styles.title} />
      )}
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  side: { width: 88, flexDirection: 'row', alignItems: 'center', gap: 8 },
  right: { justifyContent: 'flex-end' },
  title: { flex: 1, fontSize: 16, lineHeight: 22 },
});
