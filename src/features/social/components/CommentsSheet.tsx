import { useEffect, useRef, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, BottomSheet } from '@/components/ui';
import type { Comment } from '@/data/types';
import { formatCompact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useSocialStore } from '@/store';

import { CommentComposer } from './CommentComposer';
import { CommentList, type CommentSort } from './CommentList';
import { SortMenu, SortTrigger } from './SortMenu';

const SCREEN_H = Dimensions.get('window').height;
const MAX_H = SCREEN_H * 0.75;

type Props = { postId: string | null; visible: boolean; onClose: () => void };

/** Comments as a bottom sheet over the feed / view post (g-viewcomment). */
export function CommentsSheet({ postId, visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const post = useSocialStore((s) => s.posts.find((p) => p.id === postId));
  const addComment = useSocialStore((s) => s.addComment);
  const [sort, setSort] = useState<CommentSort>('best');
  const [sortOpen, setSortOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) setReplyTo(null);
  }, [visible]);

  const send = (text: string) => {
    if (!postId) return;
    addComment(postId, text, replyTo?.id);
    haptic.success();
    setReplyTo(null);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight={MAX_H} contentStyle={styles.content} style={styles.sheet}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <AppText variant="h3">Comment {post ? formatCompact(post.comments) : ''}</AppText>
          <SortTrigger value={sort} onPress={() => setSortOpen(true)} />
        </View>
        <ScrollView
          style={{ maxHeight: MAX_H - 190 - insets.bottom }}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {postId ? (
            <CommentList
              postId={postId}
              sort={sort}
              onReply={(c) => {
                setReplyTo(c);
                inputRef.current?.focus();
              }}
            />
          ) : null}
        </ScrollView>
        <CommentComposer ref={inputRef} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} onSend={send} />
      </KeyboardAvoidingView>
      <SortMenu visible={sortOpen} value={sort} onClose={() => setSortOpen(false)} onChange={setSort} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingBottom: 0 },
  content: { paddingHorizontal: 0, paddingTop: 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 12 },
});
