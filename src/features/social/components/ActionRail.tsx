import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon, type IoniconName } from '@/components/ui';
import type { Post } from '@/data/types';
import { formatCompact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { colors } from '@/theme';

type Props = {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
};

function RailButton({
  icon,
  color = colors.white,
  count,
  onPress,
  label,
}: {
  icon: IoniconName;
  color?: string;
  count: number;
  onPress: () => void;
  label: string;
}) {
  return (
    <View style={styles.item}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => {
          haptic.light();
          onPress();
        }}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
        <Icon name={icon} size={22} color={color} />
      </Pressable>
      <AppText variant="captionMedium" center style={styles.count}>
        {formatCompact(count)}
      </AppText>
    </View>
  );
}

/** Vertical like / comment / share / save rail on the right of a feed post. */
export function ActionRail({ post, onLike, onComment, onShare, onSave }: Props) {
  return (
    <View style={styles.rail}>
      <RailButton
        icon="heart"
        color={post.likedByMe ? '#FF3040' : colors.white}
        count={post.likes}
        onPress={onLike}
        label="Like"
      />
      <RailButton icon="chatbubble-ellipses" count={post.comments} onPress={onComment} label="Comments" />
      <RailButton icon="arrow-redo" count={post.shares} onPress={onShare} label="Share" />
      <RailButton
        icon={post.savedByMe ? 'bookmark' : 'bookmark-outline'}
        color={post.savedByMe ? colors.primary : colors.white}
        count={post.saves}
        onPress={onSave}
        label="Save"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { alignItems: 'center', gap: 14 },
  item: { alignItems: 'center', gap: 4 },
  btn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.94 }] },
  count: { color: colors.white },
});
