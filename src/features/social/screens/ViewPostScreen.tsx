import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, Header, IconButton, Screen } from '@/components/ui';
import { useSocialStore } from '@/store';
import { colors } from '@/theme';

import { CommentsSheet } from '../components/CommentsSheet';
import { FeedItem } from '../components/FeedItem';
import { ReportSheet } from '../components/ReportSheet';

/** Single post, same layout as the feed item, with a "View Post" overlay header. */
export function ViewPostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { height: windowHeight } = useWindowDimensions();
  const post = useSocialStore((s) => s.posts.find((p) => p.id === id));
  const [containerHeight, setContainerHeight] = useState(0);
  const [comments, setComments] = useState(false);
  const [report, setReport] = useState(false);

  const onLayout = (e: LayoutChangeEvent) => setContainerHeight(Math.round(e.nativeEvent.layout.height));

  if (!post) {
    return (
      <Screen>
        <Header title="View Post" />
        <EmptyState icon="image-outline" title="Post not found" message="This post may have been removed." />
        <Button title="Go back" variant="outline" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      </Screen>
    );
  }

  return (
    <View style={styles.root} onLayout={onLayout}>
      <StatusBar style="light" />
      <FeedItem
        post={post}
        height={containerHeight || windowHeight}
        bottomPadding={Math.max(insets.bottom, 16) + 8}
        onOpenComments={() => setComments(true)}
        onReport={() => setReport(true)}
      />
      <View pointerEvents="box-none" style={[styles.overlay, { paddingTop: insets.top }]}>
        <Header
          title="View Post"
          overlay
          right={
            <IconButton
              name="information-circle"
              backgroundColor="rgba(0,0,0,0.45)"
              onPress={() => setReport(true)}
              accessibilityLabel="Report post"
            />
          }
        />
      </View>
      <CommentsSheet postId={comments ? post.id : null} visible={comments} onClose={() => setComments(false)} />
      <ReportSheet post={report ? post : null} visible={report} onClose={() => setReport(false)} />
    </View>
  );
}

export default ViewPostScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16 },
});
