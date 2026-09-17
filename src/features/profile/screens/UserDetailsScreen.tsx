import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { EventCard } from '@/components/EventCard';
import { AppText, Avatar, Button, EmptyState, Header, Icon, Screen } from '@/components/ui';
import { IMG } from '@/data/images';
import { findUser } from '@/data/mock';
import { haptic } from '@/lib/haptics';
import { useAuthStore, useChatStore, useEventsStore, useSocialStore } from '@/store';
import { colors, radius } from '@/theme';

import { PostGrid } from '../components/PostGrid';
import { ProfileHero } from '../components/ProfileHero';
import { SocialIconRow } from '../components/SocialIconRow';
import { StatsRow } from '../components/StatsRow';

type Tab = 'posts' | 'events';

/** Two equal-width orange pill tabs (Posts / Events) — the ui-kit SegmentTabs pills don't stretch. */
function HalfTabs({ value, onChange }: { value: Tab; onChange: (t: Tab) => void }) {
  const items: { key: Tab; label: string }[] = [
    { key: 'posts', label: 'Posts' },
    { key: 'events', label: 'Events' },
  ];
  return (
    <View style={styles.tabs}>
      {items.map((it) => {
        const active = it.key === value;
        return (
          <Pressable
            key={it.key}
            onPress={() => {
              haptic.selection();
              onChange(it.key);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.tab, active && styles.tabActive]}>
            <AppText variant={active ? 'title' : 'bodyMedium'} color={active ? colors.text : colors.textSecondary}>
              {it.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name={i <= Math.round(rating) ? 'star' : 'star-outline'} size={13} color={i <= Math.round(rating) ? colors.primary : colors.textMuted} />
      ))}
      <AppText variant="caption" secondary style={styles.ratingText}>
        {rating.toFixed(1)}
      </AppText>
    </View>
  );
}

/** Another user's profile (organizer → Posts/Events tabs; plain user → posts only). */
export function UserDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const role = useAuthStore((s) => s.role);
  const following = useSocialStore((s) => s.following);
  const toggleFollow = useSocialStore((s) => s.toggleFollow);
  const openConversationWith = useChatStore((s) => s.openConversationWith);
  const events = useEventsStore((s) => s.events);
  const organizations = useEventsStore((s) => s.organizations);
  const [tab, setTab] = useState<Tab>('posts');

  const userId = id ?? 'me';
  if (userId === 'me') {
    return <Redirect href={role === 'organizer' ? '/(organizer)/(tabs)/profile' : '/(guest)/(tabs)/profile'} />;
  }

  const user = findUser(userId);
  const isFollowing = following.includes(user.id);

  const ownedOrgIds = organizations.filter((o) => o.ownerId === user.id).map((o) => o.id);
  const ownEvents = events.filter((e) => ownedOrgIds.includes(e.organizationId));
  const userEvents = ownEvents.length ? ownEvents : events.slice(0, 2);

  const onFollow = () => {
    isFollowing ? haptic.selection() : haptic.success();
    toggleFollow(user.id);
  };

  const onMessage = () => {
    const convId = openConversationWith(user.id);
    router.push(`/messages/${convId}` as never);
  };

  const overlay = <Header title="Details" overlay titleColor={colors.white} style={styles.header} />;

  return (
    <Screen padded={false} scroll edges={[]}>
      <ProfileHero cover={user.cover ?? IMG.coverStage} height={240} overlay={overlay}>
        <View style={styles.identity}>
          <Avatar uri={user.avatar} size={64} />
          <View style={styles.identityText}>
            <View style={styles.nameRow}>
              <AppText variant="h1" numberOfLines={1} style={styles.name}>
                {user.displayName}
              </AppText>
              {user.verified ? <Icon name="checkmark-circle" size={20} color={colors.primary} /> : null}
            </View>
            {user.title ? (
              <AppText variant="caption" secondary>
                {user.title}
              </AppText>
            ) : null}
            <View style={styles.pinRow}>
              <Icon name="location-sharp" size={14} color={colors.primary} />
              <AppText variant="caption" numberOfLines={1}>
                {user.location}
              </AppText>
              {user.rating != null ? <Stars rating={user.rating} /> : null}
            </View>
          </View>
        </View>

        {user.bio ? (
          <AppText secondary style={styles.bio}>
            {user.bio}
          </AppText>
        ) : null}

        <SocialIconRow user={user} />

        <StatsRow posts={user.posts} followers={user.followers} following={user.following} />
        <View style={styles.actions}>
          <Button
            title={isFollowing ? 'Following' : 'Follow'}
            variant={isFollowing ? 'primary' : 'outlinePrimary'}
            size="md"
            onPress={onFollow}
            style={styles.pill}
          />
          <Button
            title="Message"
            size="md"
            variant={isFollowing ? 'outlinePrimary' : 'primary'}
            left={<Icon name="chatbubble-ellipses-outline" size={16} color={colors.white} />}
            onPress={onMessage}
            style={styles.pill}
          />
        </View>

        {user.role === 'organizer' ? (
          <>
            <HalfTabs value={tab} onChange={setTab} />
            {tab === 'posts' ? (
              <PostGrid />
            ) : (
              <View style={styles.events}>
                {userEvents.length ? (
                  userEvents.map((e) => <EventCard key={e.id} event={e} />)
                ) : (
                  <EmptyState icon="calendar-outline" title="No events yet" message="This organizer hasn't published any events." />
                )}
              </View>
            )}
          </>
        ) : (
          <PostGrid />
        )}
      </ProfileHero>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flex: 1, marginBottom: 0 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  identityText: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1 },
  pinRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 8 },
  ratingText: { marginLeft: 4 },
  bio: { marginTop: 18, lineHeight: 21 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  pill: { flex: 1 },
  tabs: { flexDirection: 'row', marginTop: 20, gap: 8 },
  tab: { flex: 1, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.primary },
  events: { marginTop: 20 },
});

export default UserDetailsScreen;
