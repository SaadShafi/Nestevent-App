import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Chip, Header, Screen, useToast } from '@/components/ui';
import { INTERESTS } from '@/data/mock';
import { haptic } from '@/lib/haptics';
import { useAuthStore } from '@/store';

export function ChooseInterestsScreen() {
  const router = useRouter();
  const toast = useToast();
  const completeInterests = useAuthStore((s) => s.completeInterests);
  const existing = useAuthStore((s) => s.user.interests);
  const [selected, setSelected] = useState<string[]>(existing ?? []);

  const toggle = (tag: string) =>
    setSelected((cur) => (cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag]));

  const save = () => {
    if (selected.length === 0) {
      haptic.error();
      toast('Pick at least one interest', 'error');
      return;
    }
    haptic.success();
    completeInterests(selected);
    router.push('/(auth)/profile-setup');
  };

  return (
    <Screen edges={['top', 'bottom']} footer={<Button variant="white" title="Save & Continue" onPress={save} />}>
      <Header />
      <AppText variant="display" style={styles.title}>
        Choose{'\n'}Interests
      </AppText>
      <AppText secondary style={styles.subtitle}>
        Interest tags personalize discovery
      </AppText>
      <View style={styles.wrap}>
        {INTERESTS.map((tag) => (
          <Chip key={tag} label={tag} selected={selected.includes(tag)} removable onPress={() => toggle(tag)} />
        ))}
      </View>
    </Screen>
  );
}

export default ChooseInterestsScreen;

const styles = StyleSheet.create({
  title: { marginTop: 8, marginBottom: 10, fontSize: 40, lineHeight: 46 },
  subtitle: { marginBottom: 20 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
