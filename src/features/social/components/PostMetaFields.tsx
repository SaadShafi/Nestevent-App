import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { LocationPicker } from '@/components/LocationPicker';
import { AppText, BottomSheet, Button, Icon, Toggle } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { useCreatePostStore } from '../store/createPost.store';

export const CAPTION_MAX = 300;

/** Caption / Add Location / Public rows shared by Post Details and Verified Event Post. */
export function PostMetaFields() {
  const caption = useCreatePostStore((s) => s.caption);
  const location = useCreatePostStore((s) => s.location);
  const isPublic = useCreatePostStore((s) => s.isPublic);
  const setDraft = useCreatePostStore((s) => s.set);
  const [locOpen, setLocOpen] = useState(false);
  const [locDraft, setLocDraft] = useState(location);

  const openLocation = () => {
    haptic.light();
    setLocDraft(location);
    setLocOpen(true);
  };

  return (
    <View>
      <View style={styles.row}>
        <Icon name="create-outline" size={22} color={colors.primary} />
        <TextInput
          value={caption}
          onChangeText={(t) => setDraft({ caption: t.slice(0, CAPTION_MAX) })}
          placeholder="Write a caption..."
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          multiline
          maxLength={CAPTION_MAX}
          style={styles.caption}
        />
        {caption.length > 0 ? (
          <AppText variant="caption" muted={caption.length < CAPTION_MAX} color={caption.length >= CAPTION_MAX ? colors.danger : undefined}>
            {caption.length}/{CAPTION_MAX}
          </AppText>
        ) : null}
      </View>
      <View style={styles.hairline} />
      <Pressable onPress={openLocation} style={styles.row} accessibilityRole="button">
        <Icon name="location-outline" size={22} color={colors.primary} />
        <AppText style={styles.flex} numberOfLines={1} color={location ? colors.text : colors.placeholder}>
          {location || 'Add Location'}
        </AppText>
        {location ? (
          <Pressable onPress={() => setDraft({ location: '' })} hitSlop={8} accessibilityLabel="Clear location">
            <Icon name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </Pressable>
      <View style={styles.hairline} />
      <View style={styles.publicRow}>
        <View style={styles.personWrap}>
          <Icon name="person-outline" size={18} color={colors.primary} />
        </View>
        <AppText style={styles.flex}>{isPublic ? 'Public' : 'Private'}</AppText>
        <Toggle value={isPublic} onValueChange={(v) => setDraft({ isPublic: v })} />
      </View>

      <BottomSheet visible={locOpen} onClose={() => setLocOpen(false)} title="Add Location">
        <LocationPicker value={locDraft} onChangeText={setLocDraft} autoFocus />
        <Button
          title="Use this location"
          variant="white"
          onPress={() => {
            setDraft({ location: locDraft.trim() });
            setLocOpen(false);
          }}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, minHeight: 60 },
  caption: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
    paddingVertical: 0,
    maxHeight: 120,
    textAlignVertical: 'center',
  },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  flex: { flex: 1 },
  publicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 8,
    marginTop: 20,
    marginBottom: 24,
  },
  personWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,107,0,0.22)', alignItems: 'center', justifyContent: 'center' },
});
