import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventCard } from '@/components/EventCard';
import { AppText, Button, EmptyState, Header, Icon, IconButton, Screen, SectionHeader } from '@/components/ui';
import { useOrganization } from '@/hooks/useEvent';
import { formatCompact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { shareContent } from '@/lib/share';
import { useChatStore, useEventsStore } from '@/store';
import { colors, layout, radius } from '@/theme';

const HERO_H = 240;
const GLASS = 'rgba(0,0,0,0.45)';

export function OrganizationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const org = useOrganization(id);
  const events = useEventsStore((s) => s.events);
  const followed = useEventsStore((s) => s.followedOrgs.includes(id ?? ''));
  const toggleFollowOrg = useEventsStore((s) => s.toggleFollowOrg);
  const openConversationWith = useChatStore((s) => s.openConversationWith);

  const orgEvents = useMemo(() => events.filter((e) => e.organizationId === id && e.status !== 'draft'), [events, id]);

  if (!org) {
    return (
      <Screen>
        <Header title="Details" />
        <EmptyState icon="business-outline" title="Organization not found" />
      </Screen>
    );
  }

  const onMessage = () => {
    haptic.light();
    const convId = openConversationWith(org.ownerId);
    router.push(`/messages/${convId}`);
  };

  const onShare = () =>
    shareContent({ title: org.name, message: `Check out ${org.name} on Nest`, url: `https://nest.app/o/${org.id}` });

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}>
        <View style={styles.hero}>
          <Image source={{ uri: org.cover }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(11,11,11,0.9)']} style={StyleSheet.absoluteFill} />
        </View>

        <View style={styles.sheet}>
          <View style={styles.topRow}>
            <Image source={{ uri: org.logo }} style={styles.logo} contentFit="cover" />
            <View style={styles.flex}>
              <View style={styles.nameRow}>
                <AppText variant="h1" numberOfLines={1} style={styles.name}>
                  {org.name}
                </AppText>
                {org.verified ? <Icon name="checkmark-circle" size={20} color={colors.primary} /> : null}
              </View>
              <AppText variant="caption" secondary>
                {org.categories[0] ?? org.type} · {formatCompact(org.followers)} followers
              </AppText>
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
          </View>

          {org.description ? (
            <AppText secondary style={styles.description}>
              {org.description}
            </AppText>
          ) : null}

          <View style={styles.actions}>
            <Button
              title={followed ? 'Following' : 'Follow'}
              variant={followed ? 'primary' : 'outline'}
              size="md"
              style={styles.flex}
              onPress={() => {
                haptic.selection();
                toggleFollowOrg(org.id);
              }}
            />
            <Button title="Message" size="md" style={styles.flex} onPress={onMessage} />
            <IconButton name="share-social-outline" size={46} onPress={onShare} accessibilityLabel="Share organization" />
          </View>

          <SectionHeader title="Events" />
          {orgEvents.length ? (
            orgEvents.map((e) => <EventCard key={e.id} event={e} />)
          ) : (
            <EmptyState icon="calendar-outline" title="No events yet" message="This organizer has not published any events." />
          )}
        </View>
      </ScrollView>

      <View style={[styles.header, { top: insets.top }]}>
        <Header
          overlay
          title="Details"
          right={<IconButton name="share-social-outline" backgroundColor={GLASS} onPress={onShare} accessibilityLabel="Share" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  hero: { height: HERO_H, backgroundColor: colors.surface },
  sheet: {
    marginTop: -32,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 20,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logo: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.surfaceHigh, borderWidth: 3, borderColor: colors.bg },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  description: { marginTop: 16, lineHeight: 22 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: 12 },
  header: { position: 'absolute', left: layout.screenPadding, right: layout.screenPadding },
});
