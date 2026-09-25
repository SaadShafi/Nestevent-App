import { Image } from 'expo-image';
import { Linking, StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { AppText, Header, ListRow, Screen, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

const SUPPORT_EMAIL = 'support@example.com';

/** Figma email mark: filled orange envelope with the flap "V" cut out (row surface shows through). */
function MailIcon() {
  return (
    <Svg width={27} height={23} viewBox="0 0 27 23">
      <Rect x={0.5} y={0.5} width={26} height={22} rx={6} fill={colors.primary} />
      <Path d="M5.5 6.5l6.6 5.2a2.3 2.3 0 0 0 2.8 0l6.6-5.2" stroke={colors.surface} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** Support: illustration, "Need more help?" and the Email Support row. */
export function SupportScreen() {
  const toast = useToast();

  const email = async () => {
    haptic.light();
    try {
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
    } catch {
      toast('No mail app available', 'error');
    }
  };

  return (
    <Screen scroll>
      <Header title="Support" />
      <View style={styles.illustrationWrap}>
        <Image source={require('@/assets/images/support-illustration.png')} style={styles.illustration} contentFit="contain" />
      </View>
      <AppText variant="h1" center style={styles.title}>
        Need more help?
      </AppText>
      <AppText center secondary style={styles.subtitle}>
        Our dedicated team is ready to connect and support you anytime.
      </AppText>
      <ListRow
        title="Email Support"
        subtitle="Support@xample.com"
        left={<MailIcon />}
        onPress={email}
        style={styles.row}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  illustrationWrap: { marginTop: 8, alignItems: 'center' },
  // Figma support illustration (transparent cut-out, 250×208).
  illustration: { width: 250, aspectRatio: 250 / 208 },
  title: { marginTop: 28 },
  subtitle: { marginTop: 10, paddingHorizontal: 24, lineHeight: 22 },
  row: { marginTop: 32, borderRadius: radius.xl },
});
