import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, MCIcon, type MCIName } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

const ITEMS: { title: string; caption: string; icon: MCIName; path: string }[] = [
  { title: 'Promo codes', caption: 'Discount Campaigns', icon: 'ticket-percent-outline', path: '/organizer/marketing/promo-codes' },
  { title: 'Tracking links', caption: 'Promotional Attribution', icon: 'link-variant', path: '/organizer/marketing/tracking-links' },
  { title: 'SMS blast', caption: 'Past Attendee Messaging', icon: 'email-outline', path: '/organizer/marketing/sms' },
  { title: 'Event boost', caption: 'Paid Discovery Priority', icon: 'flash-outline', path: '/organizer/marketing/boost' },
];

/** Dashboard → Marketing Hub tab: 2x2 grid of feature cards. */
export function MarketingHubTab() {
  const router = useRouter();
  return (
    <View style={styles.grid}>
      {ITEMS.map((it) => (
        <Pressable
          key={it.title}
          onPress={() => {
            haptic.light();
            router.push(it.path);
          }}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <View style={styles.icon}>
            <MCIcon name={it.icon} size={22} color={colors.white} />
          </View>
          <View>
            <AppText variant="h2">{it.title}</AppText>
            <AppText variant="caption" secondary>
              {it.caption}
            </AppText>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: {
    width: '47%',
    flexGrow: 1,
    height: 170,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 16,
    justifyContent: 'space-between',
  },
  pressed: { opacity: 0.9 },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' },
});
