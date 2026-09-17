import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Icon } from '@/components/ui';
import { findUser } from '@/data/mock';
import type { Conversation } from '@/data/types';
import { colors } from '@/theme';

import { shortClock } from '../utils';

/** Messages list row: avatar, name, last message / typing, time + unread badge. */
export function ConversationRow({ conversation, onPress }: { conversation: Conversation; onPress: () => void }) {
  const user = findUser(conversation.participantId);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]} accessibilityRole="button">
      <Avatar uri={user.avatar} size={52} />
      <View style={styles.body}>
        <AppText variant="h3" numberOfLines={1}>
          {user.displayName}
        </AppText>
        {conversation.typing ? (
          <View style={styles.typing}>
            <Icon name="pulse" size={14} color={colors.primary} />
            <AppText variant="body" color={colors.primary}>
              typing...
            </AppText>
          </View>
        ) : (
          <AppText variant="body" secondary numberOfLines={1}>
            {conversation.lastMessage || 'Say hi 👋'}
          </AppText>
        )}
      </View>
      <View style={styles.right}>
        <AppText variant="caption" secondary>
          {shortClock(conversation.lastAt)}
        </AppText>
        {conversation.unread > 0 ? (
          <View style={styles.badge}>
            <AppText variant="captionMedium">{conversation.unread}</AppText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  pressed: { opacity: 0.8 },
  body: { flex: 1, gap: 2 },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  right: { alignItems: 'flex-end', gap: 8, minHeight: 44, justifyContent: 'space-between' },
  badge: { minWidth: 24, height: 24, borderRadius: 12, paddingHorizontal: 7, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
