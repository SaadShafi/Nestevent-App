import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, IconButton, Screen } from '@/components/ui';
import type { Comment } from '@/data/types';
import { formatCompact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useSocialStore } from '@/store';
import { colors, layout } from '@/theme';

import { CommentComposer } from '../components/CommentComposer';
import { CommentList, type CommentSort } from '../components/CommentList';
import { SortMenu, SortTrigger } from '../components/SortMenu';

/** Full-screen comments list for a post ("Comment 2k"). */
export function CommentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = useSocialStore((s) => s.posts.find((p) => p.id === id));
  const addComment = useSocialStore((s) => s.addComment);
  const [sort, setSort] = useState<CommentSort>('best');
  const [sortOpen, setSortOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const inputRef = useRef<TextInput>(null);

  const send = (text: string) => {
    if (!id) return;
    addComment(id, text, replyTo?.id);
    haptic.success();
    setReplyTo(null);
  };

  return (
    <Screen padded={false} glow>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <IconButton name="chevron-back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} accessibilityLabel="Go back" />
          <AppText variant="h3" center style={styles.title}>
            Comment {post ? formatCompact(post.comments) : ''}
          </AppText>
          <View style={styles.right}>
            <SortTrigger value={sort} onPress={() => setSortOpen(true)} />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {id ? (
            <CommentList
              postId={id}
              sort={sort}
              onReply={(c) => {
                setReplyTo(c);
                inputRef.current?.focus();
              }}
            />
          ) : null}
        </ScrollView>
        <CommentComposer
          ref={inputRef}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onSend={send}
          bottomInset={insets.bottom}
        />
      </KeyboardAvoidingView>
      <SortMenu visible={sortOpen} value={sort} onClose={() => setSortOpen(false)} onChange={setSort} />
    </Screen>
  );
}

export default CommentsScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    height: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.bg,
  },
  title: { flex: 1 },
  right: { minWidth: 44, alignItems: 'flex-end' },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
});
