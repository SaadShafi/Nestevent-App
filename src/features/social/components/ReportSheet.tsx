import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, BottomSheet, Button, Chip, Input, useToast } from '@/components/ui';
import type { Post } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { useSocialStore, type ReportReason } from '@/store';
import { colors, radius } from '@/theme';

import { splitCaption } from '../utils';

const REASONS: ReportReason[] = ['Nudity', 'Offensive Language', 'Someone Else', 'Other'];

type Props = { post: Post | null; visible: boolean; onClose: () => void };

/** "Report" bottom sheet: post preview, reason chips, optional comment and Submit. */
export function ReportSheet({ post, visible, onClose }: Props) {
  const toast = useToast();
  const report = useSocialStore((s) => s.report);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setReason(null);
      setComment('');
      setError(null);
    }
  }, [visible]);

  const submit = () => {
    if (!post) return;
    if (!reason) {
      setError('Select a reason for your report');
      haptic.error();
      return;
    }
    if (reason === 'Other' && !comment.trim()) {
      setError('Tell us a bit more about the problem');
      haptic.error();
      return;
    }
    report(post.id, reason, comment.trim());
    haptic.success();
    onClose();
    toast('Report submitted', 'success');
  };

  const { title, body } = post ? splitCaption(post.caption) : { title: '', body: '' };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Report" scroll>
      {post ? (
        <View style={styles.postRow}>
          <Image source={{ uri: post.media[0] }} style={styles.thumb} contentFit="cover" />
          <View style={styles.postBody}>
            <View style={styles.pill}>
              <AppText variant="captionMedium">Post</AppText>
            </View>
            <AppText variant="h3" numberOfLines={1}>
              {title || 'Post'}
            </AppText>
            <AppText variant="caption" secondary numberOfLines={2}>
              {body || title}
            </AppText>
          </View>
        </View>
      ) : null}

      <AppText variant="label" style={styles.reasonLabel}>
        Reason
      </AppText>
      <View style={styles.chips}>
        {REASONS.map((r) => (
          <Chip
            key={r}
            label={r}
            selected={reason === r}
            danger={r === 'Other'}
            onPress={() => {
              haptic.selection();
              setReason(r);
              setError(null);
            }}
          />
        ))}
      </View>

      <Input
        multiline
        maxLength={100}
        showCounter
        placeholder="Enter Additional Comment"
        value={comment}
        onChangeText={(t) => {
          setComment(t);
          if (error) setError(null);
        }}
        error={error ?? undefined}
        fieldStyle={styles.field}
      />

      <Button title="Submit Report" variant="white" disabled={!reason} onPress={submit} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  postRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  thumb: { width: 84, height: 84, borderRadius: radius.sm, backgroundColor: colors.surfaceHigh },
  postBody: { flex: 1, gap: 4 },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  reasonLabel: { marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  field: { minHeight: 150 },
});
