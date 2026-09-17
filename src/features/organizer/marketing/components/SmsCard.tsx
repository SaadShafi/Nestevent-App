import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, MCIcon } from '@/components/ui';
import type { SmsBlast } from '@/data/types';
import { formatNumericDate } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

/** SMS blast list card: orange mail icon, sent date, title + 2-line preview. */
export function SmsCard({ blast, onPress }: { blast: SmsBlast; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.top}>
        <MCIcon name="email-outline" size={30} color={colors.primary} />
        <AppText variant="caption" secondary>
          Sent: {formatNumericDate(blast.sentAt)}
        </AppText>
      </View>
      <AppText variant="title" numberOfLines={1}>
        {blast.title}
      </AppText>
      <AppText variant="caption" muted numberOfLines={2}>
        {blast.message}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, marginBottom: 12, gap: 8 },
  pressed: { opacity: 0.9 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
});
