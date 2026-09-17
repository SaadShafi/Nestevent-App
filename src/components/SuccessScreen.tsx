import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Header, NestLogo, Screen } from '@/components/ui';

type Props = {
  title: string;
  message: string;
  ctaLabel?: string;
  onCta?: () => void;
  showBack?: boolean;
};

/** Full-screen success state with logo (Post successfully! / Event Submitted / Ticket Sent Successfully). */
export function SuccessScreen({ title, message, ctaLabel, onCta, showBack = true }: Props) {
  return (
    <Screen edges={['top', 'bottom']}>
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(255,107,0,0.08)', 'rgba(120,40,0,0.5)']}
        style={StyleSheet.absoluteFill}
      />
      {showBack ? <Header left="back" /> : null}
      <View style={styles.center}>
        <NestLogo size={56} />
        {/* Long single words ("successfully!") would break mid-word at display size — shrink to fit instead. */}
        <AppText variant="display" center numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.6} style={styles.title}>
          {title}
        </AppText>
        <AppText center secondary style={styles.msg}>
          {message}
        </AppText>
      </View>
      {ctaLabel ? <Button title={ctaLabel} onPress={onCta} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 24 },
  title: { marginTop: 8 },
  msg: { maxWidth: 260 },
});
