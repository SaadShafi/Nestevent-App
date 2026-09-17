import { StyleSheet, View } from 'react-native';

import { BrandIcon, Button, Icon } from '@/components/ui';
import { colors } from '@/theme';

type Provider = 'google' | 'apple';

type Props = {
  provider: Provider;
  onPress: () => void;
  /** Frosted glass (onboarding hero) or dark surface (login card). */
  glass?: boolean;
  loading?: boolean;
};

/** Google "G" with the 4-brand-color look approximated by quadrant tints behind a white glyph. */
function GoogleG({ size = 20 }: { size?: number }) {
  const r = size / 2;
  return (
    <View style={[styles.g, { width: size, height: size, borderRadius: r }]}>
      <View style={styles.gRow}>
        <View style={[styles.gQuad, { backgroundColor: '#EA4335' }]} />
        <View style={[styles.gQuad, { backgroundColor: '#4285F4' }]} />
      </View>
      <View style={styles.gRow}>
        <View style={[styles.gQuad, { backgroundColor: '#FBBC05' }]} />
        <View style={[styles.gQuad, { backgroundColor: '#34A853' }]} />
      </View>
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.gCenter}>
          <BrandIcon name="google" size={size * 0.62} color={colors.white} />
        </View>
      </View>
    </View>
  );
}

export function SocialButton({ provider, onPress, glass, loading }: Props) {
  const isGoogle = provider === 'google';
  return (
    <Button
      variant="surface"
      loading={loading}
      onPress={onPress}
      title={isGoogle ? 'Continue with Google' : 'Continue with Apple'}
      left={isGoogle ? <GoogleG /> : <Icon name="logo-apple" size={20} color={colors.white} />}
      style={[styles.btn, glass && styles.glass]}
    />
  );
}

const styles = StyleSheet.create({
  btn: { marginBottom: 12 },
  glass: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  g: { overflow: 'hidden' },
  gRow: { flex: 1, flexDirection: 'row' },
  gQuad: { flex: 1 },
  gCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
