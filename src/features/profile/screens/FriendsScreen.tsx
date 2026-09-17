import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, EmptyState, Header, Screen, SegmentTabs, useToast } from '@/components/ui';
import { findUser } from '@/data/mock';
import { formatCompact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useSocialStore } from '@/store';

import { FriendRow } from '../components/FriendRow';

type Tab = 'followers' | 'following' | 'requests';

const TABS: { key: Tab; label: string }[] = [
  { key: 'followers', label: 'Followers' },
  { key: 'following', label: 'Following' },
  { key: 'requests', label: 'Follow Requests' },
];

const isTab = (v: unknown): v is Tab => v === 'followers' || v === 'following' || v === 'requests';

/** Friends List: Followers / Following / Follow Requests. */
export function FriendsScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const toast = useToast();

  const followers = useSocialStore((s) => s.followers);
  const following = useSocialStore((s) => s.following);
  const followRequests = useSocialStore((s) => s.followRequests);
  const toggleFollow = useSocialStore((s) => s.toggleFollow);
  const removeFollower = useSocialStore((s) => s.removeFollower);
  const acceptRequest = useSocialStore((s) => s.acceptRequest);
  const declineRequest = useSocialStore((s) => s.declineRequest);

  const [tab, setTab] = useState<Tab>(isTab(params.tab) ? params.tab : 'followers');
  useEffect(() => {
    if (isTab(params.tab)) setTab(params.tab);
  }, [params.tab]);

  const ids = tab === 'followers' ? followers : tab === 'following' ? following : followRequests;
  const count = ids.length;
  const heading = tab === 'followers' ? 'All Followers' : tab === 'following' ? 'All Followings' : 'Follow Requests';

  const onRemove = (id: string) => {
    haptic.medium();
    removeFollower(id);
    toast(`${findUser(id).displayName} removed`, 'info');
  };
  const onUnfollow = (id: string) => {
    haptic.selection();
    toggleFollow(id);
  };
  const onAccept = (id: string) => {
    haptic.success();
    acceptRequest(id);
    toast(`You accepted ${findUser(id).displayName}`, 'success');
  };
  const onDecline = (id: string) => {
    haptic.selection();
    declineRequest(id);
  };

  return (
    <Screen scroll>
      <Header title="Friends List" />
      <SegmentTabs items={TABS} value={tab} onChange={setTab} variant="pill" scrollable style={styles.tabs} />

      <View style={styles.summary}>
        <AppText variant="h1" style={styles.bigNumber}>
          {formatCompact(count)}
        </AppText>
        <AppText variant="h3">{heading}</AppText>
      </View>

      {ids.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title={tab === 'requests' ? 'No pending requests' : tab === 'followers' ? 'No followers yet' : 'Not following anyone'}
          message={tab === 'requests' ? 'New follow requests will show up here.' : 'Discover people from the Search tab.'}
        />
      ) : (
        ids.map((id) => {
          const user = findUser(id);
          if (tab === 'followers') {
            const followBack = !following.includes(id);
            return (
              <FriendRow
                key={id}
                user={user}
                inlineAction={followBack ? { label: 'Follow', onPress: () => toggleFollow(id) } : undefined}
                right={<Button title="Remove" variant="white" size="sm" fullWidth={false} onPress={() => onRemove(id)} />}
              />
            );
          }
          if (tab === 'following') {
            return (
              <FriendRow
                key={id}
                user={user}
                right={<Button title="Following" variant="surface" size="sm" fullWidth={false} onPress={() => onUnfollow(id)} />}
              />
            );
          }
          return (
            <FriendRow
              key={id}
              user={user}
              right={
                <>
                  <Button title="Decline" variant="danger" size="sm" fullWidth={false} onPress={() => onDecline(id)} />
                  <Button title="Accept" variant="success" size="sm" fullWidth={false} onPress={() => onAccept(id)} />
                </>
              }
            />
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { paddingVertical: 4 },
  summary: { marginTop: 16, marginBottom: 4, gap: 2 },
  bigNumber: { fontSize: 34, lineHeight: 40 },
});

export default FriendsScreen;
