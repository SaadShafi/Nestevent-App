import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui';
import { formatCompact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { colors } from '@/theme';

type Props = {
  posts: number;
  followers: number;
  following: number;
  onPressPosts?: () => void;
  onPressFollowers?: () => void;
  onPressFollowing?: () => void;
  /** Right-hand action(s): "Friend list" pill, or Follow + Message. */
  action?: ReactNode;
  /** Space between the three counts (default 14). */
  statsGap?: number;
  style?: StyleProp<ViewStyle>;
};

function Stat({ value, label, onPress }: { value: number; label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={
        onPress
          ? () => {
              haptic.selection();
              onPress();
            }
          : undefined
      }
      disabled={!onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.stat, pressed && onPress && styles.pressed]}>
      <AppText variant="h2">{formatCompact(value)}</AppText>
      <AppText variant="caption" secondary>
        {label}
      </AppText>
    </Pressable>
  );
}

/** Posts / Followers / Followings card with a right-hand action slot. */
export function StatsRow({ posts, followers, following, onPressPosts, onPressFollowers, onPressFollowing, action, statsGap = 14, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.stats, { gap: statsGap }]}>
        <Stat value={posts} label="Posts" onPress={onPressPosts} />
        <Stat value={followers} label="Followers" onPress={onPressFollowers} />
        <Stat value={following} label="Followings" onPress={onPressFollowing} />
      </View>
      <View style={styles.spacer} />
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 14,
    marginTop: 20,
    gap: 14,
  },
  stats: { flexDirection: 'row', alignItems: 'center' },
  stat: { alignItems: 'center', gap: 2 },
  pressed: { opacity: 0.7 },
  spacer: { flex: 1 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
