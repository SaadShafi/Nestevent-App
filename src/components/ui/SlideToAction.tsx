import { useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { haptic } from '@/lib/haptics';
import { colors, layout, radius, typography } from '@/theme';

import { Icon } from './Icon';

type Props = {
  title?: string;
  onComplete: () => void;
  disabled?: boolean;
};

const KNOB = layout.buttonHeight - 4;
const PAD = 5;

/**
 * "Get Started" slider: drag the orange knob from left to right to continue.
 * Snaps back if released early; completes with a haptic when it reaches the end.
 */
export function SlideToAction({ title = 'Get Started', onComplete, disabled }: Props) {
  const x = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);
  const maxX = Math.max(0, trackWidth - KNOB - PAD * 2);
  const maxRef = useRef(0);
  maxRef.current = maxX;
  const doneRef = useRef(false);

  const reset = () => {
    doneRef.current = false;
    Animated.spring(x, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 180 }).start();
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, g) => !disabled && Math.abs(g.dx) > 4,
      onPanResponderGrant: () => haptic.light(),
      onPanResponderMove: (_, g) => {
        const nx = Math.min(Math.max(g.dx, 0), maxRef.current);
        x.setValue(nx);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx >= maxRef.current * 0.85 && !doneRef.current) {
          doneRef.current = true;
          Animated.timing(x, { toValue: maxRef.current, duration: 120, useNativeDriver: true }).start(() => {
            haptic.success();
            onComplete();
            setTimeout(reset, 600);
          });
        } else {
          reset();
        }
      },
      onPanResponderTerminate: reset,
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  const labelOpacity = x.interpolate({ inputRange: [0, Math.max(maxX * 0.6, 1)], outputRange: [1, 0], extrapolate: 'clamp' });
  // The fill is a full-width pill slid in from the left with translateX (the native driver can't animate `width`).
  const fillTranslate = x.interpolate({ inputRange: [0, Math.max(maxX, 1)], outputRange: [-(trackWidth || 0) + KNOB + PAD * 2, 0], extrapolate: 'clamp' });

  return (
    <View onLayout={onLayout} style={[styles.track, disabled && styles.disabled]} accessibilityRole="adjustable" accessibilityLabel={`${title}. Slide right to continue`}>
      {trackWidth > 0 ? (
        <Animated.View pointerEvents="none" style={[styles.fill, { width: trackWidth, transform: [{ translateX: fillTranslate }] }]} />
      ) : null}
      <Animated.View pointerEvents="none" style={[styles.labelWrap, { opacity: labelOpacity }]}>
        <Animated.Text style={styles.label}>{title}</Animated.Text>
      </Animated.View>
      <View pointerEvents="none" style={styles.chevrons}>
        {[0.25, 0.4, 0.6].map((o, i) => (
          <Icon key={i} name="chevron-forward" size={16} color={`rgba(255,255,255,${o})`} style={styles.chev} />
        ))}
      </View>
      <Animated.View {...pan.panHandlers} style={[styles.knob, { transform: [{ translateX: x }] }]}>
        <Icon name="arrow-forward" size={22} color={colors.white} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: layout.buttonHeight + 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  disabled: { opacity: 0.5 },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,107,0,0.18)', borderRadius: radius.pill },
  labelWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  label: { ...typography.button, color: colors.text },
  chevrons: { position: 'absolute', right: 22, flexDirection: 'row', alignItems: 'center' },
  chev: { marginLeft: -6 },
  knob: {
    position: 'absolute',
    left: PAD,
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
