import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { canPickDocuments, captureAttachment, pickDocumentAttachment, pickMediaAttachment } from '@/components/AttachmentPicker';
import { AppText, BottomSheet, Header, Icon, IconButton, Screen, useToast } from '@/components/ui';
import { findUser } from '@/data/mock';
import type { Attachment, Message } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { useChatStore } from '@/store';
import { colors, radius } from '@/theme';

import { ChatInput } from '../components/ChatInput';
import { MessageBubble } from '../components/MessageBubble';
import { isSameDay } from '../utils';

/** 1:1 chat thread (inverted list, "Today" separator, scroll-to-latest FAB, input bar). */
export function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversation = useChatStore((s) => s.conversations.find((c) => c.id === id));
  const allMessages = useChatStore((s) => s.messages);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const markRead = useChatStore((s) => s.markRead);
  const listRef = useRef<FlatList<Message>>(null);
  const [awayFromBottom, setAwayFromBottom] = useState(false);
  const [pending, setPending] = useState<Attachment | null>(null);
  const [attachOpen, setAttachOpen] = useState(false);
  const toast = useToast();

  const participant = conversation ? findUser(conversation.participantId) : null;

  const messages = useMemo(
    () =>
      allMessages
        .filter((m) => m.conversationId === id)
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
    [allMessages, id],
  );

  useEffect(() => {
    if (id) markRead(id);
  }, [id, markRead]);

  const send = (text: string, attachment?: Attachment) => {
    if (!id || (!text && !attachment)) return;
    sendMessage(id, text, attachment);
    setPending(null);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const attach = () => {
    haptic.light();
    setAttachOpen(true);
  };

  const pick = async (fn: () => Promise<Attachment | null>) => {
    setAttachOpen(false);
    try {
      const a = await fn();
      if (a) {
        haptic.selection();
        setPending(a);
      }
    } catch {
      toast('Could not open the picker', 'error');
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const away = e.nativeEvent.contentOffset.y > 160;
    if (away !== awayFromBottom) setAwayFromBottom(away);
  };

  const oldest = messages[messages.length - 1];
  const separatorLabel = !oldest || isSameDay(oldest.at, new Date()) ? 'Today' : 'Earlier';

  return (
    <Screen padded={false}>
      <View style={styles.padded}>
        <Header
          title={participant?.displayName ?? 'Chat'}
          right={
            participant ? (
              <IconButton
                name="information-circle"
                onPress={() => router.push({ pathname: '/user/[id]', params: { id: participant.id } })}
                accessibilityLabel="View profile"
              />
            ) : null
          }
        />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        // Only the input bar's safe-area padding tucks under the keyboard; the usual 12pt gap stays.
        keyboardVerticalOffset={-(Math.max(insets.bottom, 12) - 12)}>
        <View style={styles.flex}>
          <FlatList
            ref={listRef}
            data={messages}
            inverted
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={onScroll}
            scrollEventThrottle={32}
            ListFooterComponent={
              <View style={styles.dateWrap}>
                <View style={styles.datePill}>
                  <AppText variant="caption">{separatorLabel}</AppText>
                </View>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <AppText variant="caption" muted center>
                  Say hello to {participant?.firstName ?? 'them'} 👋
                </AppText>
              </View>
            }
          />
          {awayFromBottom ? (
            <Pressable
              onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
              style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
              accessibilityLabel="Scroll to latest">
              <Icon name="chevron-down" size={22} color={colors.white} />
            </Pressable>
          ) : null}
        </View>
        <ChatInput onSend={send} onAttach={attach} pending={pending} onClearPending={() => setPending(null)} bottomInset={insets.bottom} />
      </KeyboardAvoidingView>
      <BottomSheet visible={attachOpen} onClose={() => setAttachOpen(false)} title="Share">
        {[
          { label: 'Photo or video', hint: 'From your library', icon: 'images-outline' as const, run: pickMediaAttachment },
          { label: 'Camera', hint: 'Take a photo', icon: 'camera-outline' as const, run: captureAttachment },
          {
            label: 'Document',
            hint: canPickDocuments() ? 'PDF, docs, zip…' : 'Needs a development build — opens your library in Expo Go',
            icon: 'document-text-outline' as const,
            run: pickDocumentAttachment,
          },
        ].map((o) => (
          <Pressable key={o.label} onPress={() => pick(o.run)} style={({ pressed }) => [styles.attachRow, pressed && styles.pressed]}>
            <View style={styles.attachIcon}>
              <Icon name={o.icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <AppText variant="title">{o.label}</AppText>
              <AppText variant="caption" secondary>
                {o.hint}
              </AppText>
            </View>
            <Icon name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </BottomSheet>
    </Screen>
  );
}

export default ChatScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: 16 },
  list: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8, flexGrow: 1, justifyContent: 'flex-end' },
  dateWrap: { alignItems: 'center', marginBottom: 16, marginTop: 4 },
  datePill: { backgroundColor: colors.surfaceHigh, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.xs },
  empty: { paddingVertical: 24, transform: [{ scaleY: -1 }] },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  attachRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  attachIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
});
