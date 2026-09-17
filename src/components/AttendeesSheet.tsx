import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, BottomSheet, EmptyState } from '@/components/ui';
import { USERS } from '@/data/mock';
import type { EventItem, User } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

const REACTIONS = ['👋', '❤️', '🥳', '👍'];

type Props = { event: EventItem | null; visible: boolean; onClose: () => void; onReact?: (userId: string, emoji: string) => void };

/**
 * "Attendees" bottom sheet from the Figma: a two-column grid of attendee cards (avatar, name,
 * quick-reaction emojis). Opened from the "50 + Guests" row on the event pages.
 */
export function AttendeesSheet({ event, visible, onClose, onReact }: Props) {
  const router = useRouter();
  const attendees: User[] = event ? USERS.filter((u) => u.kind !== 'promoter').slice(0, 8) : [];

  return (
    <BottomSheet visible={visible} onClose={onClose} scroll closeButton={false}>
      {!event || (event.showAttendeesPublic === false && attendees.length === 0) ? (
        <EmptyState icon="people-outline" title="Attendee list is private" message="The organizer has hidden who's going." />
      ) : (
        <View style={styles.grid}>
          {attendees.map((u) => (
            <Pressable
              key={u.id}
              onPress={() => {
                haptic.light();
                onClose();
                setTimeout(() => router.push(`/user/${u.id}`), 200);
              }}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={`View ${u.displayName}`}>
              <Avatar uri={u.avatar} size={92} />
              <AppText variant="captionMedium" center numberOfLines={1} style={styles.name}>
                {u.displayName}
              </AppText>
              <View style={styles.reactions}>
                {REACTIONS.map((e) => (
                  <Pressable
                    key={e}
                    hitSlop={4}
                    onPress={() => {
                      haptic.selection();
                      onReact?.(u.id, e);
                    }}
                    accessibilityLabel={`React ${e} to ${u.displayName}`}>
                    <AppText style={styles.emoji}>{e}</AppText>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingBottom: 8 },
  card: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 8,
  },
  pressed: { opacity: 0.85 },
  name: { paddingHorizontal: 8 },
  reactions: { flexDirection: 'row', gap: 8 },
  emoji: { fontSize: 22, lineHeight: 26 },
});
