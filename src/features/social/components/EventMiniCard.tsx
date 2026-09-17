import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { EventItem } from '@/data/types';
import { formatCurrency } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

import { formatFeedEventDate } from '../utils';

/** Compact event strip under a verified event post: thumb, title, date, city + "Get Tickets" pill. */
export function EventMiniCard({ event }: { event: EventItem }) {
  const router = useRouter();
  const open = () => {
    haptic.light();
    router.push({ pathname: '/event/[id]', params: { id: event.id } });
  };
  return (
    <Pressable onPress={open} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Image source={{ uri: event.cover }} style={styles.thumb} contentFit="cover" transition={150} />
      <View style={styles.body}>
        <AppText variant="h3" numberOfLines={1}>
          {event.title}
        </AppText>
        <AppText variant="caption" secondary numberOfLines={1}>
          {formatFeedEventDate(event.startDate)}
        </AppText>
        <AppText variant="caption" secondary numberOfLines={1}>
          {event.city}
        </AppText>
      </View>
      <Pressable onPress={open} style={({ pressed }) => [styles.cta, pressed && styles.pressed]} accessibilityRole="button">
        <AppText variant="label" style={styles.ctaText}>
          Get Tickets
        </AppText>
        <AppText variant="caption" style={styles.ctaText}>
          {event.priceFrom > 0 ? `From ${formatCurrency(event.priceFrom)}` : 'Free'}
        </AppText>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 10,
  },
  pressed: { opacity: 0.9 },
  thumb: { width: 64, height: 64, borderRadius: radius.sm, backgroundColor: colors.surfaceHigh },
  body: { flex: 1, gap: 2 },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  ctaText: { color: colors.white },
});
