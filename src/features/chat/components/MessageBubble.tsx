import { Image } from 'expo-image';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { formatBytes } from '@/components/AttachmentPicker';
import { AppText, Avatar, Icon, IconButton } from '@/components/ui';
import { findUser } from '@/data/mock';
import type { Attachment, Message } from '@/data/types';
import { colors, radius } from '@/theme';

import { shortClock } from '../utils';

/** Incoming (dark, avatar below-left) or outgoing (orange, double-check) chat bubble with image / file attachments. */
export function MessageBubble({ message }: { message: Message }) {
  const mine = message.senderId === 'me';
  const hasText = message.text.trim().length > 0;
  if (mine) {
    return (
      <View style={styles.outWrap}>
        <View style={[styles.outBubble, message.attachment?.kind !== 'file' && message.attachment ? styles.mediaBubble : null]}>
          {message.attachment ? <AttachmentView attachment={message.attachment} mine /> : null}
          {hasText ? (
            <AppText variant="bodyMedium" style={styles.outText}>
              {message.text}
            </AppText>
          ) : null}
          <View style={styles.meta}>
            <AppText variant="caption" style={styles.outMeta}>
              {shortClock(message.at)}
            </AppText>
            <Icon name="checkmark-done" size={13} color={colors.white} />
          </View>
        </View>
        <View style={styles.outTail} />
      </View>
    );
  }
  const sender = findUser(message.senderId);
  return (
    <View style={styles.inWrap}>
      <View style={styles.inBubble}>
        <AppText variant="caption" secondary style={styles.sender}>
          {sender.displayName}
        </AppText>
        {message.attachment ? <AttachmentView attachment={message.attachment} /> : null}
        <View style={styles.inRow}>
          {hasText ? (
            <AppText variant="body" style={styles.inText}>
              {message.text}
            </AppText>
          ) : (
            <View style={styles.inText} />
          )}
          <AppText variant="caption" muted style={styles.inMeta}>
            {shortClock(message.at)}
          </AppText>
        </View>
        <View style={styles.inTail} />
      </View>
      <Avatar uri={sender.avatar} size={32} style={styles.avatar} />
    </View>
  );
}

function AttachmentView({ attachment, mine }: { attachment: Attachment; mine?: boolean }) {
  const [open, setOpen] = useState(false);
  const { width, height } = useWindowDimensions();

  if (attachment.kind === 'file') {
    const openFile = async () => {
      try {
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(attachment.uri, { mimeType: attachment.mimeType, dialogTitle: attachment.name });
        else await Linking.openURL(attachment.uri);
      } catch {
        // ignore
      }
    };
    return (
      <Pressable onPress={openFile} style={[styles.file, mine && styles.fileMine]} accessibilityRole="button" accessibilityLabel={`Open ${attachment.name}`}>
        <View style={[styles.fileIcon, mine && styles.fileIconMine]}>
          <Icon name="document-text" size={20} color={colors.white} />
        </View>
        <View style={styles.fileText}>
          <AppText variant="label" numberOfLines={1} color={colors.white}>
            {attachment.name ?? 'File'}
          </AppText>
          <AppText variant="caption" color={mine ? 'rgba(255,255,255,0.85)' : colors.textSecondary} numberOfLines={1}>
            {[attachment.mimeType?.split('/').pop()?.toUpperCase(), formatBytes(attachment.size)].filter(Boolean).join(' · ')}
          </AppText>
        </View>
        <Icon name="download-outline" size={18} color={colors.white} />
      </Pressable>
    );
  }

  const ratio = attachment.width && attachment.height ? attachment.width / attachment.height : 4 / 3;
  const w = Math.min(240, width * 0.6);
  return (
    <>
      <Pressable onPress={() => setOpen(true)} accessibilityRole="imagebutton" accessibilityLabel="Open attachment">
        <Image source={{ uri: attachment.uri }} style={[styles.image, { width: w, height: Math.min(320, w / ratio) }]} contentFit="cover" transition={150} />
        {attachment.kind === 'video' ? (
          <View style={styles.play}>
            <Icon name="play" size={22} color={colors.white} />
          </View>
        ) : null}
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.viewer}>
          <Image source={{ uri: attachment.uri }} style={{ width, height: height * 0.8 }} contentFit="contain" />
          <IconButton name="close" onPress={() => setOpen(false)} style={styles.viewerClose} backgroundColor="rgba(255,255,255,0.15)" accessibilityLabel="Close" />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  outWrap: { alignSelf: 'flex-end', maxWidth: '80%', marginBottom: 10, marginRight: 8 },
  outBubble: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
  },
  mediaBubble: { paddingHorizontal: 6, paddingTop: 6 },
  outText: { color: colors.white, marginTop: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 2 },
  outMeta: { color: 'rgba(255,255,255,0.85)', fontSize: 10 },
  outTail: {
    position: 'absolute',
    right: -6,
    bottom: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderLeftColor: colors.primary,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
  },
  inWrap: { alignSelf: 'flex-start', maxWidth: '80%', marginBottom: 10, marginLeft: 4 },
  inBubble: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    marginLeft: 8,
  },
  sender: { marginBottom: 2 },
  inRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  inText: { flexShrink: 1, marginTop: 4 },
  inMeta: { fontSize: 10 },
  inTail: {
    position: 'absolute',
    left: -6,
    bottom: 0,
    width: 0,
    height: 0,
    borderRightWidth: 8,
    borderRightColor: colors.surfaceAlt,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
  },
  avatar: { marginTop: 6 },
  image: { borderRadius: radius.md, backgroundColor: colors.surfaceHigh },
  play: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -22,
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  file: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.md, padding: 8, minWidth: 200, marginBottom: 4 },
  fileMine: { backgroundColor: 'rgba(0,0,0,0.18)' },
  fileIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  fileIconMine: { backgroundColor: 'rgba(255,255,255,0.22)' },
  fileText: { flex: 1 },
  viewer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center' },
  viewerClose: { position: 'absolute', top: 56, right: 16 },
});
