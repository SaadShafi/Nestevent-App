import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Icon } from '@/components/ui';
import { findUser } from '@/data/mock';
import type { Comment } from '@/data/types';
import { formatCompact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useSocialStore } from '@/store';
import { colors } from '@/theme';

import { shortTimeAgo } from '../utils';

export type CommentSort = 'best' | 'newest';

export const SORT_LABEL: Record<CommentSort, string> = { best: 'Best comments', newest: 'Newest' };

type Props = {
  postId: string;
  sort: CommentSort;
  onReply: (comment: Comment) => void;
};

/** Hook shared by the sheet and full screen: comments of a post, sorted. */
export function useSortedComments(postId: string, sort: CommentSort) {
  const comments = useSocialStore((s) => s.comments);
  return useMemo(() => {
    const list = comments.filter((c) => c.postId === postId);
    return [...list].sort((a, b) =>
      sort === 'best' ? b.likes - a.likes : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [comments, postId, sort]);
}

function ReplyRow({ reply }: { reply: Comment }) {
  const author = findUser(reply.authorId);
  return (
    <View style={styles.reply}>
      <View style={styles.head}>
        <Avatar uri={author.avatar} size={22} />
        <AppText variant="label">{author.displayName}</AppText>
        <AppText variant="caption" secondary>
          {'  •  '}
          {shortTimeAgo(reply.createdAt)}
        </AppText>
      </View>
      <AppText variant="caption" style={styles.replyText}>
        {reply.text}
      </AppText>
    </View>
  );
}

function CommentCard({ comment, onReply }: { comment: Comment; onReply: (c: Comment) => void }) {
  const author = findUser(comment.authorId);
  const toggleCommentLike = useSocialStore((s) => s.toggleCommentLike);
  const [expanded, setExpanded] = useState(false);
  const replies = comment.replies ?? [];
  const shown = expanded ? replies : replies.slice(0, 1);
  const hidden = replies.length - shown.length;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Avatar uri={author.avatar} size={26} />
        <AppText variant="label" numberOfLines={1} style={styles.name}>
          {author.displayName}
        </AppText>
        <AppText variant="caption" secondary>
          {'•  '}
          {shortTimeAgo(comment.createdAt)}
        </AppText>
        <View style={styles.flex} />
        <Pressable
          hitSlop={8}
          onPress={() => {
            haptic.selection();
            toggleCommentLike(comment.id);
          }}
          style={styles.like}
          accessibilityRole="button"
          accessibilityLabel="Like comment">
          <Icon name="heart" size={16} color={comment.likedByMe ? '#FF3040' : colors.white} />
          <AppText variant="caption" secondary>
            {formatCompact(comment.likes)}
          </AppText>
        </Pressable>
      </View>
      <AppText variant="caption" style={styles.text}>
        {comment.text}
      </AppText>
      <Pressable onPress={() => onReply(comment)} hitSlop={8} style={styles.replyBtn} accessibilityRole="button">
        <AppText variant="label">Reply</AppText>
      </Pressable>
      {shown.map((r) => (
        <ReplyRow key={r.id} reply={r} />
      ))}
      {hidden > 0 ? (
        <Pressable onPress={() => setExpanded(true)} hitSlop={6} style={styles.more}>
          <AppText variant="captionMedium">View {hidden} more {hidden === 1 ? 'reply' : 'replies'}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Comment cards (with nested replies) sorted by likes or recency. Used by CommentsSheet and CommentsScreen. */
export function CommentList({ postId, sort, onReply }: Props) {
  const comments = useSortedComments(postId, sort);
  if (comments.length === 0) {
    return (
      <View style={styles.empty}>
        <Icon name="chatbubble-ellipses-outline" size={28} color={colors.textMuted} />
        <AppText variant="label" secondary center>
          No comments yet. Be the first!
        </AppText>
      </View>
    );
  }
  return (
    <View style={styles.list}>
      {comments.map((c) => (
        <CommentCard key={c.id} comment={c} onReply={onReply} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 12, gap: 6 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flexShrink: 1 },
  flex: { flex: 1 },
  like: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  text: { color: '#E6E6E6', lineHeight: 18 },
  replyBtn: { alignSelf: 'flex-end' },
  reply: { marginLeft: 8, marginTop: 4, gap: 4 },
  replyText: { color: '#E6E6E6', lineHeight: 18 },
  more: { marginLeft: 8, marginTop: 2 },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 40 },
});
