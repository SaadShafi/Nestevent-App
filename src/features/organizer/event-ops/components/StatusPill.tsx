import { StyleSheet, View } from 'react-native';

import { AppText, Icon, type IoniconName } from '@/components/ui';
import { colors, radius } from '@/theme';

type Tone = 'success' | 'danger' | 'neutral' | 'primary';

const TONES: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: colors.successSoft, fg: colors.success },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  neutral: { bg: colors.surfaceHigh, fg: colors.textSecondary },
  primary: { bg: colors.primarySoft, fg: colors.primary },
};

/** Small status chip: "Scanned" (green), "Refunded", "Declined" (red), "Pending" (neutral). */
export function StatusPill({ label, tone = 'neutral', icon }: { label: string; tone?: Tone; icon?: IoniconName }) {
  const t = TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      {icon ? <Icon name={icon} size={12} color={t.fg} /> : null}
      <AppText variant="captionMedium" color={t.fg}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
});
