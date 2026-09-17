import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { findUser } from '@/data/mock';
import type { Comment } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

type Props = {
  replyTo: Comment | null;
  onCancelReply: () => void;
  onSend: (text: string) => void;
  bottomInset?: number;
};

/** Pill "Type a message ..." input with emoji icon + orange send button. Shows the "Replying to X" chip. */
export const CommentComposer = forwardRef<TextInput, Props>(function CommentComposer(
  { replyTo, onCancelReply, onSend, bottomInset = 0 },
  ref,
) {
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    haptic.light();
    onSend(text.trim());
    setText('');
  };

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(bottomInset, 12) }]}>
      {replyTo ? (
        <View style={styles.replyChip}>
          <AppText variant="caption" secondary>
            Replying to {findUser(replyTo.authorId).displayName}
          </AppText>
          <Pressable onPress={onCancelReply} hitSlop={8} accessibilityLabel="Cancel reply">
            <Icon name="close" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>
      ) : null}
      <View style={styles.row}>
        <View style={styles.field}>
          <TextInput
            ref={ref}
            value={text}
            onChangeText={setText}
            placeholder="Type a message ..."
            placeholderTextColor={colors.placeholder}
            selectionColor={colors.primary}
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={send}
            blurOnSubmit={false}
          />
          <Pressable hitSlop={8} onPress={() => setText((t) => `${t}😊`)} accessibilityLabel="Add emoji">
            <Icon name="happy-outline" size={22} color={colors.text} />
          </Pressable>
        </View>
        <Pressable
          onPress={send}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Send"
          style={({ pressed }) => [styles.send, !canSend && styles.sendDisabled, pressed && styles.pressed]}>
          <Icon name="paper-plane" size={22} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 10, gap: 8 },
  replyChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  field: {
    flex: 1,
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 10,
  },
  input: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 15, height: '100%' },
  send: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.6 },
  pressed: { opacity: 0.8 },
});
