import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { formatBytes } from '@/components/AttachmentPicker';
import { AppText, Icon } from '@/components/ui';
import type { Attachment } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

type Props = {
  onSend: (text: string, attachment?: Attachment) => void;
  onAttach: () => void;
  /** Attachment staged for the next message (shown as a preview chip above the input). */
  pending?: Attachment | null;
  onClearPending?: () => void;
  bottomInset?: number;
};

/** Pill "Type a message ..." input with emoji + attach icons, a staged-attachment preview and an orange send button. */
export function ChatInput({ onSend, onAttach, pending, onClearPending, bottomInset = 0 }: Props) {
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0 || !!pending;

  const send = () => {
    if (!canSend) return;
    haptic.light();
    onSend(text.trim(), pending ?? undefined);
    setText('');
  };

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(bottomInset, 12) }]}>
      {pending ? (
        <View style={styles.pending}>
          {pending.kind === 'file' ? (
            <View style={styles.pendingFileIcon}>
              <Icon name="document-text" size={18} color={colors.white} />
            </View>
          ) : (
            <Image source={{ uri: pending.uri }} style={styles.pendingThumb} contentFit="cover" />
          )}
          <View style={styles.flex}>
            <AppText variant="label" numberOfLines={1}>
              {pending.name ?? (pending.kind === 'video' ? 'Video' : 'Photo')}
            </AppText>
            <AppText variant="caption" secondary numberOfLines={1}>
              {[pending.kind === 'file' ? pending.mimeType : pending.kind, formatBytes(pending.size)].filter(Boolean).join(' · ')}
            </AppText>
          </View>
          <Pressable onPress={onClearPending} hitSlop={8} accessibilityLabel="Remove attachment">
            <Icon name="close-circle" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
      ) : null}
      <View style={styles.row}>
        <View style={styles.field}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message ..."
            placeholderTextColor={colors.placeholder}
            selectionColor={colors.primary}
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={send}
            submitBehavior="submit"
          />
          <Pressable hitSlop={8} onPress={() => setText((t) => `${t}😊`)} accessibilityLabel="Add emoji">
            <Icon name="happy-outline" size={22} color={colors.text} />
          </Pressable>
          <Pressable hitSlop={8} onPress={onAttach} accessibilityLabel="Attach file">
            <Icon name="attach" size={22} color={colors.text} />
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
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { paddingHorizontal: 16, paddingTop: 10, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  field: {
    flex: 1,
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 12,
  },
  input: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 15, height: '100%' },
  send: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.6 },
  pressed: { opacity: 0.8 },
  pending: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: radius.md, padding: 8 },
  pendingThumb: { width: 44, height: 44, borderRadius: 8 },
  pendingFileIcon: { width: 44, height: 44, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
