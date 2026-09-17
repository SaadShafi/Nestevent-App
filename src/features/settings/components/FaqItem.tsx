import { useEffect, useRef } from 'react';
import { Animated, LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

type Props = { question: string; answer: string; open: boolean; onToggle: () => void };

function animateLayout() {
  try {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  } catch {
    // LayoutAnimation is a no-op / may throw on the new architecture in some cases.
  }
}

/** Accordion FAQ card: question + chevron (rotates 180° when open) and the answer. */
export function FaqItem({ question, answer, open, onToggle }: Props) {
  const rotation = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotation, { toValue: open ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, [open, rotation]);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <Pressable
      onPress={() => {
        haptic.selection();
        animateLayout();
        onToggle();
      }}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.row}>
        <AppText variant="h3" style={styles.question}>
          {question}
        </AppText>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Icon name="chevron-down" size={20} color={colors.text} />
        </Animated.View>
      </View>
      {open ? (
        <AppText secondary style={styles.answer}>
          {answer}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, paddingHorizontal: 20, paddingVertical: 18, marginBottom: 12 },
  pressed: { opacity: 0.9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  question: { flex: 1 },
  answer: { marginTop: 12, lineHeight: 21 },
});
