import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import type { Organization } from '@/data/types';
import { formatCompact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

type Props = { org: Organization; onPress: () => void; onEdit: () => void };

/** Organizer dashboard organization card: cover + category pill + "Edit" pill, name, followers, logo + rating. */
export function OrganizationTile({ org, onPress, onEdit }: Props) {
  return (
    <Pressable
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.coverWrap}>
        <Image source={{ uri: org.cover }} style={styles.cover} contentFit="cover" transition={200} />
        <View style={styles.categoryPill}>
          <AppText variant="captionMedium">{org.category}</AppText>
        </View>
        <Pressable
          onPress={() => {
            haptic.light();
            onEdit();
          }}
          hitSlop={8}
          style={({ pressed }) => [styles.editPill, pressed && styles.pressed]}>
          <Icon name="pencil-outline" size={12} color={colors.black} />
          <AppText variant="captionMedium" color={colors.black}>
            Edit
          </AppText>
        </Pressable>
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
        </View>
      </View>
    </Pressable>
  );
}

/** Dashed "Create Organization" tile at the end of the organizations list. */
export function CreateOrganizationTile({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={({ pressed }) => [styles.create, pressed && styles.pressed]}>
      <View style={styles.createIcon}>
        <Icon name="add" size={26} color={colors.primary} />
      </View>
      <AppText variant="h3">Create Organization</AppText>
      <AppText variant="caption" secondary center>
        Add a new promoter, venue or collective profile
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', marginBottom: 16 },
  pressed: { opacity: 0.9 },
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
  editPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  body: { padding: 14, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  logo: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceHigh },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  create: {
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    padding: 24,
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  createIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
});
