import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText, AvatarStack, Icon, IconButton } from '@/components/ui';
import type { EventItem } from '@/data/types';
import { formatCurrency, formatEventDate } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useEventsStore } from '@/store';
import { colors, radius } from '@/theme';

type Props = {
  event: EventItem;
  style?: StyleProp<ViewStyle>;
  /** Override navigation target */
  onPress?: () => void;
  /** Show the heart button (guest) */
  favoritable?: boolean;
  /** Blurred cover fills the card with the flyer centered (Figma style) */
  height?: number;
};

/** Large event card with blurred flyer background, category pill, attendees, title, date and price. */
export function EventCard({ event, style, onPress, favoritable = true, height = 470 }: Props) {
  const router = useRouter();
  const isFav = useEventsStore((s) => s.favorites.includes(event.id));
  const toggleFavorite = useEventsStore((s) => s.toggleFavorite);

  return (
    <Pressable
      onPress={() => {
        haptic.light();
        onPress ? onPress() : router.push({ pathname: '/event/[id]', params: { id: event.id } });
      }}
      style={({ pressed }) => [styles.card, { height }, pressed && styles.pressed, style]}>
      <Image source={{ uri: event.cover }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={18} transition={200} />
      <View style={[StyleSheet.absoluteFill, styles.dim]} />
      <View style={styles.flyerWrap}>
        <Image source={{ uri: event.cover }} style={styles.flyer} contentFit="cover" transition={200} />
      </View>
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.bottomGrad} />
      {favoritable ? (
        <IconButton
          name={isFav ? 'heart' : 'heart-outline'}
          color={isFav ? colors.primary : colors.white}
          backgroundColor="rgba(0,0,0,0.35)"
          borderColor="rgba(255,255,255,0.25)"
          style={styles.heart}
          onPress={() => toggleFavorite(event.id)}
          accessibilityLabel="Favorite"
        />
      ) : null}
      <View style={styles.body}>
        <View style={styles.categoryPill}>
          <AppText variant="captionMedium">{event.category}</AppText>
        </View>
        <View style={styles.attendees}>
          <AvatarStack uris={event.attendeeAvatars} size={30} />
          <AppText variant="label" secondary>
            {event.attendees} + Guests
          </AppText>
        </View>
        <AppText variant="h2" numberOfLines={1}>
          {event.title}
        </AppText>
        <View style={styles.meta}>
          <Icon name="calendar-outline" size={16} color={colors.textSecondary} />
          <AppText variant="label" secondary style={styles.date}>
            {formatEventDate(event.startDate)}
          </AppText>
          <AppText variant="h2">{event.priceFrom > 0 ? formatCurrency(event.priceFrom, { decimals: 2 }) : 'Free'}</AppText>
        </View>
      </View>
    </Pressable>
  );
}

/** Compact horizontal event row (used for organizer analytics header + checkout order details). */
export function EventRow({ event, onPress, right }: { event: EventItem; onPress?: () => void; right?: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.row}>
      <Image source={{ uri: event.cover }} style={styles.rowImg} contentFit="cover" />
      <View style={styles.rowBody}>
        <AppText variant="title" numberOfLines={1}>
          {event.title}
        </AppText>
        <AppText variant="caption" secondary numberOfLines={2}>
          {event.description}
        </AppText>
        <AppText variant="title" color={colors.primary}>
          {formatCurrency(event.priceFrom, { decimals: 2 })}
        </AppText>
      </View>
      {right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.surface, marginBottom: 16 },
  pressed: { opacity: 0.95 },
  dim: { backgroundColor: 'rgba(0,0,0,0.25)' },
  flyerWrap: { position: 'absolute', top: 24, left: 0, right: 0, alignItems: 'center' },
  flyer: { width: '46%', aspectRatio: 0.72, borderRadius: radius.sm },
  bottomGrad: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 220 },
  heart: { position: 'absolute', top: 14, right: 14 },
  body: { position: 'absolute', left: 16, right: 16, bottom: 16, gap: 8 },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  attendees: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { flex: 1 },
  row: { flexDirection: 'row', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12 },
  rowImg: { width: 84, height: 84, borderRadius: radius.md },
  rowBody: { flex: 1, gap: 4 },
});
