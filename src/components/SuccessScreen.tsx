import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type NativeSyntheticEvent, type TextLayoutEventData } from 'react-native';

import { AppText, Button, Header, NestLogo, Screen } from '@/components/ui';
import { fonts, typography } from '@/theme';

type Props = {
  title: string;
  message: string;
  ctaLabel?: string;
  onCta?: () => void;
  showBack?: boolean;
};

/** Figma "Post successfully!": Syne Bold 34 on ~37pt lines, wrapping by word ("Post / successfully!"). */
const TITLE_SIZE = typography.display.fontSize;
const TITLE_LINE_RATIO = 37 / 34;
/** Figma title measure (375pt frame minus margins) — keeps the same line breaks on wider phones. */
const TITLE_MAX_W = 295;

/** Full-screen success state with logo (Post successfully! / Event Submitted / Ticket Sent Successfully). */
export function SuccessScreen({ title, message, ctaLabel, onCta, showBack = true }: Props) {
  const [available, setAvailable] = useState(0);
  const [longestWordWidth, setLongestWordWidth] = useState(0);
  const longestWord = title.split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), '');

  // Only shrink when the longest word can't fit on a line by itself; otherwise the title keeps the
  // Figma size and wraps between words. (iOS would rather break "successfully!" mid-word.)
  const titleSize =
    available > 0 && longestWordWidth > available ? Math.floor((TITLE_SIZE * available) / longestWordWidth) : TITLE_SIZE;

  const onWordLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
    const w = e.nativeEvent.lines[0]?.width ?? 0;
    if (Math.abs(w - longestWordWidth) > 0.5) setLongestWordWidth(w);
  };
  const onTitleWrapLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (Math.abs(w - available) > 0.5) setAvailable(w);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(255,107,0,0.08)', 'rgba(120,40,0,0.5)']}
        style={StyleSheet.absoluteFill}
      />
      {showBack ? <Header left="back" /> : null}
      <View style={styles.center}>
        <NestLogo size={66} />
        <View style={styles.titleWrap} onLayout={onTitleWrapLayout}>
          {/* Off-screen measurement of the longest word at full size. */}
          <AppText variant="display" numberOfLines={1} onTextLayout={onWordLayout} style={styles.measure} aria-hidden>
            {longestWord}
          </AppText>
          <AppText
            variant="display"
            center
            style={[styles.title, { fontSize: titleSize, lineHeight: Math.round(titleSize * TITLE_LINE_RATIO) }]}>
            {title}
          </AppText>
        </View>
        <AppText center style={styles.msg}>
          {message}
        </AppText>
      </View>
      {ctaLabel ? <Button title={ctaLabel} onPress={onCta} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  titleWrap: { alignSelf: 'stretch', maxWidth: TITLE_MAX_W, marginTop: 28 },
  measure: { position: 'absolute', width: 2000, opacity: 0 },
  title: { color: '#FCFCFC' },
  msg: { marginTop: 18, maxWidth: 260, fontFamily: fonts.light, fontSize: 14, lineHeight: 18, color: '#E3E0E0' },
});
