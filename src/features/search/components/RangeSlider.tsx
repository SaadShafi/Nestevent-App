import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { AppText } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors } from '@/theme';

type Props = {
  min?: number;
  max?: number;
  step?: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
  /** Formats the value label shown under each thumb */
  format?: (v: number) => string;
};

const THUMB = 22;
const TRACK_H = 4;

/**
 * Two-thumb range slider (Price Range / Distance on the Filter screen).
 * Pure PanResponder + Views — no extra dependencies.
 */
export function RangeSlider({ min = 0, max = 500, step = 1, minValue, maxValue, onChange, format = (v) => `${v}` }: Props) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const values = useRef({ min: minValue, max: maxValue });
  const startVal = useRef(0);

  useEffect(() => {
    values.current = { min: minValue, max: maxValue };
  }, [minValue, maxValue]);

  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const toX = (v: number) => (widthRef.current > 0 ? ((v - min) / (max - min)) * widthRef.current : 0);
  const fromDx = (dx: number) => (widthRef.current > 0 ? (dx / widthRef.current) * (max - min) : 0);

  const makeResponder = (which: 'min' | 'max') =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        haptic.selection();
        startVal.current = values.current[which];
      },
      onPanResponderMove: (_, g) => {
        const next = clamp(startVal.current + fromDx(g.dx));
        if (which === 'min') {
          const v = Math.min(next, values.current.max);
          if (v !== values.current.min) {
            values.current.min = v;
            onChange(v, values.current.max);
          }
        } else {
          const v = Math.max(next, values.current.min);
          if (v !== values.current.max) {
            values.current.max = v;
            onChange(values.current.min, v);
          }
        }
      },
      onPanResponderTerminationRequest: () => false,
    });

  // Responders read from refs, so they can be created once.
  const minPan = useMemo(() => makeResponder('min'), []); // eslint-disable-line react-hooks/exhaustive-deps
  const maxPan = useMemo(() => makeResponder('max'), []); // eslint-disable-line react-hooks/exhaustive-deps

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width - THUMB;
    widthRef.current = w;
    setWidth(w);
  };

  const left = width > 0 ? toX(minValue) : 0;
  const right = width > 0 ? toX(maxValue) : 0;
  // When the thumbs sit close together their labels would overlap: show one combined "min – max" label instead.
  const merged = right - left < LABEL_W;

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <View style={styles.track} />
      <View style={[styles.fill, { left: left + THUMB / 2, width: Math.max(0, right - left) }]} />
      <View {...minPan.panHandlers} style={[styles.thumbHit, { left }]} hitSlop={10}>
        <View style={styles.thumb} />
        {!merged ? (
          <AppText variant="caption" style={styles.value}>
            {format(minValue)}
          </AppText>
        ) : null}
      </View>
      <View {...maxPan.panHandlers} style={[styles.thumbHit, { left: right }]} hitSlop={10}>
        <View style={styles.thumb} />
        {!merged ? (
          <AppText variant="caption" style={styles.value}>
            {format(maxValue)}
          </AppText>
        ) : null}
      </View>
      {merged ? (
        <View pointerEvents="none" style={[styles.mergedWrap, { left: Math.min(Math.max((left + right) / 2 + THUMB / 2 - LABEL_W, 0), Math.max(width + THUMB - LABEL_W * 2, 0)) }]}>
          <AppText variant="caption" style={styles.mergedValue}>
            {format(minValue)} – {format(maxValue)}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const LABEL_W = 70;

const styles = StyleSheet.create({
  wrap: { height: THUMB + 28, justifyContent: 'flex-start', marginTop: 8 },
  track: {
    position: 'absolute',
    left: THUMB / 2,
    right: THUMB / 2,
    top: (THUMB - TRACK_H) / 2,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: colors.surfaceHigh,
  },
  fill: { position: 'absolute', top: (THUMB - TRACK_H) / 2, height: TRACK_H, backgroundColor: colors.primary },
  thumbHit: { position: 'absolute', top: 0, width: THUMB, alignItems: 'center' },
  thumb: { width: THUMB, height: THUMB, borderRadius: THUMB / 2, backgroundColor: colors.primary },
  value: { marginTop: 8, width: LABEL_W, textAlign: 'center' },
  mergedWrap: { position: 'absolute', top: THUMB + 8, width: LABEL_W * 2, alignItems: 'center' },
  mergedValue: { textAlign: 'center' },
});
