import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabHeader, useAppDrawer } from '@/components/navigation/AppDrawer';
import { EmptyState, IconButton, SegmentTabs } from '@/components/ui';
import type { Post } from '@/data/types';
import { useAuthStore, useSocialStore } from '@/store';
import { colors, layout } from '@/theme';

import { CommentsSheet } from '../components/CommentsSheet';
import { FeedItem } from '../components/FeedItem';
import { ReportSheet } from '../components/ReportSheet';

type Tab = 'forYou' | 'following';
const TABS: { key: Tab; label: string }[] = [
  { key: 'forYou', label: 'For You' },
  { key: 'following', label: 'Following' },
];

const GLASS = 'rgba(0,0,0,0.35)';

/** Full-screen vertical paged social feed (For You / Following). Shared by guest + organizer tab groups. */
export function SocialFeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { openDrawer, drawer } = useAppDrawer();
  const posts = useSocialStore((s) => s.posts);
  const following = useSocialStore((s) => s.following);
  const [tab, setTab] = useState<Tab>('forYou');
  const [containerHeight, setContainerHeight] = useState(0);
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [reportFor, setReportFor] = useState<Post | null>(null);

  const itemHeight = containerHeight || windowHeight;
  const bottomPadding = layout.tabBarHeight + layout.tabBarBottomOffset + insets.bottom + 12;

  const data = useMemo(
    () => (tab === 'following' ? posts.filter((p) => following.includes(p.authorId)) : posts),
    [posts, following, tab],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    if (h && h !== containerHeight) setContainerHeight(h);
  };

  const openSearch = () => {
    const role = useAuthStore.getState().role;
    router.push(role === 'organizer' ? '/(organizer)/(tabs)/search' : '/(guest)/(tabs)/search');
  };

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <FeedItem
        post={item}
        height={itemHeight}
        bottomPadding={bottomPadding}
        onOpenComments={(p) => setCommentsFor(p.id)}
        onReport={setReportFor}
      />
    ),
    [itemHeight, bottomPadding],
  );

  return (
    <View style={styles.root} onLayout={onLayout}>
      <StatusBar style="light" />
      {data.length === 0 ? (
        <View style={[styles.empty, { paddingTop: insets.top + 140 }]}>
          <EmptyState icon="people-outline" title="Follow people to see their posts" message="Posts from people you follow will show up here." />
        </View>
      ) : (
        <FlatList
          key={`${tab}-${itemHeight}`}
          data={data}
          keyExtractor={(p) => p.id}
          renderItem={renderItem}
          pagingEnabled
          snapToInterval={itemHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, i) => ({ length: itemHeight, offset: itemHeight * i, index: i })}
          windowSize={3}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          removeClippedSubviews
        />
      )}

      <View pointerEvents="box-none" style={[styles.overlay, { paddingTop: insets.top + 4 }]}>
        <TabHeader
          onMenu={openDrawer}
          right={
            <>
              <IconButton name="search-outline" backgroundColor={GLASS} borderColor="rgba(255,255,255,0.2)" onPress={openSearch} accessibilityLabel="Search" />
              <IconButton
                name="chatbubble-ellipses-outline"
                backgroundColor={GLASS}
                borderColor="rgba(255,255,255,0.2)"
                onPress={() => router.push('/messages')}
                accessibilityLabel="Messages"
              />
            </>
          }
        />
        <View style={styles.tabs}>
          <SegmentTabs items={TABS} value={tab} onChange={setTab} />
        </View>
      </View>

      <CommentsSheet postId={commentsFor} visible={!!commentsFor} onClose={() => setCommentsFor(null)} />
      <ReportSheet post={reportFor} visible={!!reportFor} onClose={() => setReportFor(null)} />
      {drawer}
    </View>
  );
}

export default SocialFeedScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16 },
  tabs: { alignItems: 'center', marginTop: 4 },
  empty: { flex: 1, paddingHorizontal: 16 },
});
