import { useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar } from '@/components/ui';
import type { User } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { colors } from '@/theme';

type Props = {
  user: User;
  /** Inline orange text link next to the name (e.g. "Follow"). */
  inlineAction?: { label: string; onPress: () => void };
  /** Right-hand button(s). */
  right?: ReactNode;
};

/** Avatar + name row with hairline separator (Friends List). Tapping the avatar/name opens the user. */
export function FriendRow({ user, inlineAction, right }: Props) {
  const router = useRouter();
  const openUser = () => {
    haptic.light();
    router.push({ pathname: '/user/[id]', params: { id: user.id } });
  };
  return (
    <View style={styles.row}>
      <Pressable onPress={openUser} style={({ pressed }) => [styles.person, pressed && styles.pressed]}>
        <Avatar uri={user.avatar} size={48} />
        <AppText variant="title" numberOfLines={1} style={styles.name}>
          {user.displayName}
        </AppText>
      </Pressable>
      {inlineAction ? (
        <Pressable
          onPress={() => {
            haptic.selection();
            inlineAction.onPress();
          }}
          hitSlop={8}
          style={styles.inline}>
          <AppText variant="label" color={colors.primary}>
            {inlineAction.label}
          </AppText>
        </Pressable>
      ) : null}
      <View style={styles.spacer} />
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  person: { flexDirection: 'row', alignItems: 'center', gap: 14, flexShrink: 1 },
  pressed: { opacity: 0.75 },
  name: { flexShrink: 1 },
  inline: { marginLeft: 12 },
  spacer: { flex: 1, minWidth: 8 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
