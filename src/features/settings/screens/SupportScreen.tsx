import { Image } from 'expo-image';
import { Linking, StyleSheet, View } from 'react-native';

import { AppText, Header, Icon, ListRow, Screen, useToast } from '@/components/ui';
import { IMG } from '@/data/images';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

const SUPPORT_EMAIL = 'support@example.com';

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
        <Image source={{ uri: IMG.supportIllustration }} style={styles.illustration} contentFit="cover" transition={200} cachePolicy="memory-disk" />
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
        left={
          <View style={styles.mailIcon}>
            <Icon name="mail" size={18} color={colors.white} />
          </View>
        }
        onPress={email}
        style={styles.row}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  illustrationWrap: { marginTop: 8, alignItems: 'center' },
  illustration: { width: '100%', height: 220, borderRadius: radius.xl, backgroundColor: colors.surface },
  title: { marginTop: 28 },
  subtitle: { marginTop: 10, paddingHorizontal: 24, lineHeight: 22 },
  mailIcon: { width: 32, height: 32, borderRadius: radius.xs + 2, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  row: { marginTop: 32, borderRadius: radius.xl },
});
