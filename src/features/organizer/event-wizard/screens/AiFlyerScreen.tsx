import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Header, Icon, Input, Screen, Select, useToast } from '@/components/ui';
import { IMG } from '@/data/images';
import { haptic } from '@/lib/haptics';
import { useOrganizerStore } from '@/store';
import { colors } from '@/theme';

import { WizardHeading } from '../../shared/WizardHeading';

const POOL = [IMG.flyerSunset, IMG.flyerNight, IMG.flyerUrban, IMG.flyerFestival, IMG.flyerJazz, IMG.flyerRooftop, IMG.flyerHula];
const KINDS = [
  { value: 'Flyer', label: 'Flyer' },
  { value: 'Poster', label: 'Poster' },
  { value: 'Story', label: 'Story' },
];

const randomFlyer = (exclude?: string | null) => {
  const pool = POOL.filter((p) => p !== exclude);
  return pool[Math.floor(Math.random() * pool.length)] ?? POOL[0]!;
};

/** AI Flyer Content Assistant — simulated generation with a preview, Save/Remove, Use Generated / Regenerate. */
export function AiFlyerScreen() {
  const router = useRouter();
  const toast = useToast();
  const draft = useOrganizerStore((s) => s.draft);
  const setDraft = useOrganizerStore((s) => s.setDraft);

  const [generated, setGenerated] = useState<string | null>(() => (draft.flyerMode === 'ai' && draft.flyer ? draft.flyer : randomFlyer()));
  const [prompt, setPrompt] = useState('Create A Sleek Midnight Garden Flyer For A 21+ House Event');
  const [kind, setKind] = useState('Flyer');
  const [loading, setLoading] = useState(false);
  const [promptError, setPromptError] = useState<string | undefined>();

  const regenerate = () => {
    if (!prompt.trim()) {
      setPromptError('Describe the flyer you want first');
      haptic.error();
      return;
    }
    setPromptError(undefined);
    setLoading(true);
    setTimeout(() => {
      setGenerated((g) => randomFlyer(g));
      setLoading(false);
      haptic.success();
    }, 1200);
  };

  const useGenerated = () => {
    if (!generated) {
      toast('Generate a flyer first', 'error');
      return;
    }
    setDraft({ flyer: generated, flyerMode: 'ai' });
    haptic.success();
    router.push('/organizer/create-event/visibility');
  };

  return (
    <Screen
      scroll
      keyboard
      footer={
        <View style={styles.footer}>
          <Button title="Use Generated" variant="white" onPress={useGenerated} style={styles.flex} disabled={!generated || loading} />
          <Button title="Regenerate" onPress={regenerate} loading={loading} style={styles.flex} />
        </View>
      }>
      <Header left="back" />
      <WizardHeading title="AI Flyer Content Assistant" />

      <View style={styles.preview}>
        {loading ? (
          <View style={styles.placeholder}>
            <ActivityIndicator color={colors.primary} />
            <AppText variant="caption" secondary>
              Generating your {kind.toLowerCase()}…
            </AppText>
          </View>
        ) : generated ? (
          <>
            <Image source={{ uri: generated }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
            <View style={styles.badges}>
              <Pressable
                onPress={() => {
                  haptic.success();
                  toast('Flyer saved to your media', 'success');
                }}
                style={[styles.badge, { backgroundColor: colors.success }]}>
                <Icon name="checkmark-circle" size={13} color={colors.white} />
                <AppText variant="captionMedium">Save</AppText>
              </Pressable>
              <Pressable onPress={() => setGenerated(null)} style={[styles.badge, { backgroundColor: colors.danger }]}>
                <Icon name="close-circle" size={13} color={colors.white} />
                <AppText variant="captionMedium">Remove</AppText>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Icon name="sparkles-outline" size={28} color={colors.primary} />
            <AppText variant="caption" secondary center>
              Your generated {kind.toLowerCase()} will appear here
            </AppText>
          </View>
        )}
      </View>

      <Input
        label="Prompt"
        value={prompt}
        onChangeText={(t) => {
          setPrompt(t);
          if (promptError) setPromptError(undefined);
        }}
        multiline
        maxLength={1000}
        placeholder="Describe the flyer you want"
        error={promptError}
      />
      <Select label="Generate" options={KINDS} value={kind} onChange={setKind} sheetTitle="Generate" />
    </Screen>
  );
}

export default AiFlyerScreen;

const styles = StyleSheet.create({
  preview: {
    height: 200,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: 20,
  },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  badges: { position: 'absolute', right: 10, bottom: 10, flexDirection: 'row', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  footer: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});
