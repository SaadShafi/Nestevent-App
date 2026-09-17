import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import type { Organization } from '@/data/types';
import { formatCompact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { colors } from '@/theme';

/** Organizer logo + name + orange star rating row (Event Details). */
export function OrganizerRow({ org }: { org: Organization }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => {
        haptic.light();
        router.push(`/organization/${org.id}`);
      }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Image source={{ uri: org.logo }} style={styles.logo} contentFit="cover" />
      <View style={styles.flex}>
        <AppText variant="title">{org.name}</AppText>
        <View style={styles.rating}>
          <Icon name="star" size={13} color={colors.primary} />
          <AppText variant="captionMedium" color={colors.primary}>
            {org.rating.toFixed(1)}
          </AppText>
          <AppText variant="caption" secondary>
            ({formatCompact(org.ratingCount)}+)
          </AppText>
        </View>
      </View>
      <Icon name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  pressed: { opacity: 0.8 },
  flex: { flex: 1 },
  logo: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceHigh },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
});
