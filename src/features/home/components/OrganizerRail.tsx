import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { Organization } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { colors, layout } from '@/theme';

const SIZE = 64;

/** Horizontal "Top Organizer Event" rail: ringed logo circles + name captions. */
export function OrganizerRail({ organizations }: { organizations: Organization[] }) {
  const router = useRouter();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
      {organizations.map((org) => (
        <Pressable
          key={org.id}
          onPress={() => {
            haptic.light();
            router.push(`/organization/${org.id}`);
          }}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
          <LinearGradient
            colors={['#FF2D55', '#FF6B00', '#FF2D55']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ring}>
            <View style={styles.inner}>
              <Image source={{ uri: org.logo }} style={styles.logo} contentFit="cover" transition={150} />
            </View>
          </LinearGradient>
          <AppText variant="caption" numberOfLines={1} style={styles.name}>
            {org.name}
          </AppText>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: { paddingHorizontal: layout.screenPadding, gap: 18, paddingBottom: 4 },
  item: { alignItems: 'center', width: SIZE + 20 },
  pressed: { opacity: 0.8 },
  ring: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, padding: 2, alignItems: 'center', justifyContent: 'center' },
  inner: {
    width: SIZE - 4,
    height: SIZE - 4,
    borderRadius: (SIZE - 4) / 2,
    backgroundColor: colors.white,
    padding: 3,
    overflow: 'hidden',
  },
  logo: { width: '100%', height: '100%', borderRadius: (SIZE - 10) / 2, backgroundColor: colors.surfaceHigh },
  name: { marginTop: 8, textAlign: 'center' },
});
