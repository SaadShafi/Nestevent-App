import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { EventCard } from '@/components/EventCard';
import { AppText, BottomSheet, Button, Header, Icon, Screen, useToast } from '@/components/ui';
import { formatEventDate } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useEventsStore, useSocialStore, useTicketsStore } from '@/store';
import { colors, radius } from '@/theme';

import { PostMetaFields } from '../components/PostMetaFields';
import { useCreatePostStore } from '../store/createPost.store';

/** Create a verified event post: caption/location/public + an event picked from my tickets or all events. */
export function VerifiedEventPostScreen() {
  const router = useRouter();
  const toast = useToast();
  const draft = useCreatePostStore();
  const addPost = useSocialStore((s) => s.addPost);
  const events = useEventsStore((s) => s.events);
  const myTickets = useTicketsStore((s) => s.myTickets);
  const [pickerOpen, setPickerOpen] = useState(false);

  const event = events.find((e) => e.id === draft.eventId);

  const options = useMemo(() => {
    const mine = new Set(myTickets.map((t) => t.eventId));
    const first = events.filter((e) => mine.has(e.id));
    const rest = events.filter((e) => !mine.has(e.id));
    return [...first, ...rest];
  }, [events, myTickets]);

  const openPicker = () => {
    haptic.light();
    setPickerOpen(true);
  };

  const confirm = () => {
    if (!event) return toast('Choose an event first', 'error');
    addPost({
      authorId: 'me',
      eventId: event.id,
      media: [event.cover],
      caption: draft.caption.trim() || event.title,
      location: draft.location || event.city,
      isPublic: draft.isPublic,
    });
    haptic.success();
    draft.reset();
    router.replace('/create-post/success');
  };

  return (
    <Screen scroll keyboard glow footer={<Button title="Confirm & Upload" variant="white" disabled={!event} onPress={confirm} />}>
      <Header title="Create Post" />
      <PostMetaFields />
      {event ? (
        <EventCard event={event} height={260} favoritable={false} onPress={openPicker} />
      ) : (
        <Pressable onPress={openPicker} style={({ pressed }) => [styles.drop, pressed && styles.pressed]} accessibilityRole="button">
          <View style={styles.plus}>
            <Icon name="add" size={18} color={colors.black} />
          </View>
          <AppText variant="h2" center>
            Choose an event
          </AppText>
          <AppText muted center>
            Verified posts link to an event you attend or host
          </AppText>
        </Pressable>
      )}

      <BottomSheet visible={pickerOpen} onClose={() => setPickerOpen(false)} title="Choose an event" scroll>
        {options.map((e) => {
          const active = e.id === draft.eventId;
          return (
            <Pressable
              key={e.id}
              onPress={() => {
                haptic.selection();
                draft.set({ eventId: e.id });
                setPickerOpen(false);
              }}
              style={[styles.row, active && styles.rowActive]}>
              <Image source={{ uri: e.cover }} style={styles.thumb} contentFit="cover" />
              <View style={styles.rowBody}>
                <AppText variant="title" numberOfLines={1}>
                  {e.title}
                </AppText>
                <AppText variant="caption" secondary>
                  {formatEventDate(e.startDate)}
                </AppText>
              </View>
              {active ? <Icon name="checkmark-circle" size={20} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </BottomSheet>
    </Screen>
  );
}

export default VerifiedEventPostScreen;

const styles = StyleSheet.create({
  drop: {
    height: 260,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 24,
  },
  pressed: { opacity: 0.9 },
  plus: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, marginBottom: 8, backgroundColor: colors.surface },
  rowActive: { borderWidth: 1.5, borderColor: colors.primary },
  thumb: { width: 56, height: 56, borderRadius: radius.sm, backgroundColor: colors.surfaceHigh },
  rowBody: { flex: 1, gap: 2 },
});
