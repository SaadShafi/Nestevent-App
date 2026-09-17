import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Header, Screen, useToast } from '@/components/ui';
import { LEGAL_SECTIONS } from '@/data/mock';
import { haptic } from '@/lib/haptics';

type Props = {
  /** Header title (e.g. "Terms & Condition") */
  headerTitle: string;
  /** Display heading (e.g. "Our Terms and Conditions") */
  title: string;
  sections?: { heading: string; body: string }[];
};

/** Shared Terms & Conditions / Privacy Policy page with Decline / Accept footer. */
export function LegalDocument({ headerTitle, title, sections = LEGAL_SECTIONS }: Props) {
  const router = useRouter();
  const toast = useToast();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const decline = () => {
    haptic.selection();
    goBack();
  };
  const accept = () => {
    haptic.success();
    toast('Thanks for accepting', 'success');
    goBack();
  };

  return (
    <Screen
      scroll
      footer={
        <View style={styles.footer}>
          <Button title="Decline" variant="danger" onPress={decline} style={styles.btn} />
          <Button title="Accept" variant="success" onPress={accept} style={styles.btn} />
        </View>
      }>
      <Header title={headerTitle} />
      <AppText variant="h1" style={styles.title}>
        {title}
      </AppText>
      {sections.map((s) => (
        <View key={s.heading} style={styles.section}>
          <AppText variant="h3" style={styles.heading}>
            {s.heading}
          </AppText>
          <AppText secondary style={styles.body}>
            {s.body}
          </AppText>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 4, marginBottom: 16 },
  section: { marginBottom: 22 },
  heading: { marginBottom: 6 },
  body: { lineHeight: 22 },
  footer: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1 },
});
