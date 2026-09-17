import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText, BrandIcon, Toggle } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

export type Socials = { instagram?: string; x?: string; youtube?: string; snapchat?: string };

const NETWORKS: { key: keyof Socials; icon: 'instagram' | 'x-twitter' | 'youtube' | 'snapchat'; bg: string; color: string }[] = [
  { key: 'instagram', icon: 'instagram', bg: '#D6249F', color: '#fff' },
  { key: 'x', icon: 'x-twitter', bg: '#000', color: '#fff' },
  { key: 'youtube', icon: 'youtube', bg: '#FF0000', color: '#fff' },
  { key: 'snapchat', icon: 'snapchat', bg: '#FFFC00', color: '#000' },
];

type Props = { value: Socials; onChange: (v: Socials) => void };

/** "Add Social Media (Optional)" rows with brand icon, URL input and toggle. */
export function SocialLinksEditor({ value, onChange }: Props) {
  // "+ Add" enables the next network that is still switched off (all on → nothing left to add).
  const nextToAdd = NETWORKS.find((n) => value[n.key] == null);
  const addNext = () => {
    if (!nextToAdd) return;
    haptic.selection();
    onChange({ ...value, [nextToAdd.key]: '' });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <AppText variant="label">
          Add Social Media <AppText variant="label" muted>(Optional)</AppText>
        </AppText>
        <Pressable onPress={addNext} disabled={!nextToAdd} hitSlop={8} accessibilityRole="button" accessibilityLabel="Add social link">
          <AppText variant="label" muted={!nextToAdd}>
            + Add
          </AppText>
        </Pressable>
      </View>
      {NETWORKS.map((n) => {
        const enabled = value[n.key] != null;
        return (
          <View key={n.key} style={styles.row}>
            <View style={[styles.icon, { backgroundColor: n.bg }]}>
              <BrandIcon name={n.icon} size={14} color={n.color} />
            </View>
            <TextInput
              placeholder="Enter URL"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              value={value[n.key] ?? ''}
              editable={enabled}
              onChangeText={(t) => onChange({ ...value, [n.key]: t })}
              style={[styles.input, !enabled && styles.inputDisabled]}
            />
            <Toggle
              value={enabled}
              onValueChange={(v) => {
                const next = { ...value };
                if (v) next[n.key] = '';
                else delete next[n.key];
                onChange(next);
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    height: 54,
    marginBottom: 10,
  },
  icon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 15, height: '100%' },
  inputDisabled: { opacity: 0.6 },
});
