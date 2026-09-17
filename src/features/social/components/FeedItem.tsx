import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Button, Icon } from '@/components/ui';
import { findUser } from '@/data/mock';
import type { Post } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { shareContent } from '@/lib/share';
import { useEventsStore, useSocialStore } from '@/store';
import { colors } from '@/theme';

import { shortTimeAgo, splitCaption } from '../utils';
import { ActionRail } from './ActionRail';
import { EventMiniCard } from './EventMiniCard';
import { MediaCarousel } from './MediaCarousel';

type Props = {
  post: Post;
  height: number;
  /** Space reserved under the caption block (floating tab bar / safe area). */
  bottomPadding: number;
  onOpenComments: (post: Post) => void;
  onReport: (post: Post) => void;
};

const DOUBLE_TAP_MS = 280;

/** Full-screen feed post: full-bleed media, gradients, author + caption block, event strip and action rail. */
export function FeedItem({ post, height, bottomPadding, onOpenComments, onReport }: Props) {
  const router = useRouter();
  const author = findUser(post.authorId);
  const event = useEventsStore((s) => (post.eventId ? s.events.find((e) => e.id === post.eventId) : undefined));
  const following = useSocialStore((s) => s.following.includes(post.authorId));
  const { toggleLike, toggleSave, toggleFollow, share } = useSocialStore();
  const [expanded, setExpanded] = useState(false);
  const lastTap = useRef(0);
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const { title, body } = splitCaption(post.caption);

  const popHeart = () => {
    heartScale.setValue(0);
    heartOpacity.setValue(1);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.15, useNativeDriver: true, damping: 10, stiffness: 240 }),
      Animated.parallel([
        Animated.timing(heartScale, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(heartOpacity, { toValue: 0, duration: 380, delay: 260, useNativeDriver: true }),
      ]),
    ]).start();
  };

  const like = () => {
    haptic.medium();
    toggleLike(post.id);
    if (!post.likedByMe) popHeart();
  };

  const onImagePress = () => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      if (!post.likedByMe) like();
      else popHeart();
    } else {
      lastTap.current = now;
    }
  };

  const onShare = async () => {
    haptic.light();
    await shareContent({
      title: title || `${author.displayName} on Nest`,
      message: post.caption || `Check out ${author.displayName}'s post on Nest`,
      url: `https://nest.app/p/${post.id}`,
    });
    share(post.id);
  };

  const openAuthor = () => router.push({ pathname: '/user/[id]', params: { id: post.authorId } });

  return (
    <View style={[styles.item, { height }]}>
      <MediaCarousel media={post.media} height={height} onPress={onImagePress} onLongPress={() => onReport(post)} />
      <LinearGradient pointerEvents="none" colors={['rgba(0,0,0,0.75)', 'transparent']} style={styles.topGrad} />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.95)']}
        locations={[0, 0.45, 1]}
        style={styles.bottomGrad}
      />

      <Animated.View
        pointerEvents="none"
        style={[styles.bigHeart, { opacity: heartOpacity, transform: [{ scale: heartScale }] }]}>
        <Icon name="heart" size={110} color="#FF3040" />
      </Animated.View>

      <View style={[styles.bottom, { paddingBottom: bottomPadding }]} pointerEvents="box-none">
        <View style={styles.row} pointerEvents="box-none">
          <View style={styles.captionCol}>
            <View style={styles.authorRow}>
              <Pressable onPress={openAuthor} style={styles.author} hitSlop={6}>
                <Avatar uri={author.avatar} size={32} />
                <View>
                  <AppText variant="title" numberOfLines={1}>
                    {author.displayName}
                  </AppText>
                  <AppText variant="caption" secondary>
                    {shortTimeAgo(post.createdAt)}
                  </AppText>
                </View>
              </Pressable>
              {post.authorId !== 'me' ? (
                <Button
                  title={following ? 'Following' : 'Follow'}
                  variant="outlinePrimary"
                  size="sm"
                  fullWidth={false}
                  style={styles.follow}
                  onPress={() => toggleFollow(post.authorId)}
                />
              ) : null}
            </View>
            <Pressable onPress={() => setExpanded((e) => !e)}>
              {title ? (
                <AppText variant="h3" numberOfLines={expanded ? undefined : 1}>
                  {title}
                </AppText>
              ) : null}
              {body ? (
                <AppText variant="body" secondary numberOfLines={expanded ? undefined : 2} style={styles.body}>
                  {body}
                </AppText>
              ) : null}
            </Pressable>
          </View>
          <View style={styles.railCol}>
            <ActionRail
              post={post}
              onLike={like}
              onComment={() => onOpenComments(post)}
              onShare={onShare}
              onSave={() => {
                haptic.selection();
                toggleSave(post.id);
              }}
            />
          </View>
        </View>
        {event ? (
          <View style={styles.eventWrap}>
            <EventMiniCard event={event} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { width: '100%', backgroundColor: colors.black, overflow: 'hidden' },
  topGrad: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  bottomGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%' },
  bigHeart: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  captionCol: { flex: 1, gap: 8 },
  railCol: { width: 48, alignItems: 'center' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  author: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  follow: { height: 28, paddingHorizontal: 14 },
  body: { color: '#E6E6E6' },
  eventWrap: { marginTop: 14 },
});
