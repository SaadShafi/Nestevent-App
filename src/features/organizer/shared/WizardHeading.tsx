import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';

type Props = { title: string; subtitle?: string };

/** Bold Syne display heading + optional subtitle used across the organizer onboarding + Create Event wizard. */
export function WizardHeading({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <AppText variant="display">{title}</AppText>
      {subtitle ? (
        <AppText secondary style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 4, marginBottom: 20 },
  subtitle: { marginTop: 8 },
});
