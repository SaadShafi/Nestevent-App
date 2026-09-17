import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon, IconButton } from '@/components/ui';
import type { Organization } from '@/data/types';
import { formatCompact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useEventsStore } from '@/store';
import { colors, radius } from '@/theme';

/** Organization result card: cover + category pill + heart, name, followers, logo row, rating, verified. */
export function OrgCard({ org }: { org: Organization }) {
  const router = useRouter();
  const followed = useEventsStore((s) => s.followedOrgs.includes(org.id));
  const toggleFollowOrg = useEventsStore((s) => s.toggleFollowOrg);

  return (
    <Pressable
      onPress={() => {
        haptic.light();
        router.push(`/organization/${org.id}`);
      }}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.coverWrap}>
        <Image source={{ uri: org.cover }} style={styles.cover} contentFit="cover" transition={200} />
        <View style={styles.categoryPill}>
          <AppText variant="captionMedium">{org.category}</AppText>
        </View>
        <IconButton
          name={followed ? 'heart' : 'heart-outline'}
          color={followed ? colors.primary : colors.white}
          backgroundColor="rgba(0,0,0,0.35)"
          borderColor="rgba(255,255,255,0.25)"
          style={styles.heart}
          onPress={() => toggleFollowOrg(org.id)}
          accessibilityLabel={followed ? 'Unfollow' : 'Follow'}
        />
      </View>
      <View style={styles.body}>
        <AppText variant="h2" numberOfLines={1}>
          {org.name} Organizer
        </AppText>
        <AppText variant="caption" secondary>
          {org.categories[0] ?? org.type} · {formatCompact(org.followers)} followers
        </AppText>
        <View style={styles.row}>
          <Image source={{ uri: org.logo }} style={styles.logo} contentFit="cover" />
          <View style={styles.flex}>
            <AppText variant="title">{org.name}</AppText>
            <View style={styles.rating}>
              <Icon name="star" size={12} color={colors.primary} />
              <AppText variant="captionMedium" color={colors.primary}>
                {org.rating.toFixed(1)}
              </AppText>
              <AppText variant="caption" secondary>
                ({formatCompact(org.ratingCount)}+)
              </AppText>
            </View>
          </View>
          {org.verified ? (
            <View style={styles.verified}>
              <AppText variant="captionMedium" color="#9BE83A">
                Verified
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', marginBottom: 16 },
  pressed: { opacity: 0.92 },
  flex: { flex: 1 },
  coverWrap: { width: '100%', aspectRatio: 16 / 10 },
  cover: { width: '100%', height: '100%' },
  categoryPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  heart: { position: 'absolute', top: 10, right: 10 },
  body: { padding: 14, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  logo: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceHigh },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verified: {
    backgroundColor: 'rgba(155,232,58,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
});
