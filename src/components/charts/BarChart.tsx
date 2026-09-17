import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, radius } from '@/theme';

type Datum = { label: string; value: number; tooltip?: string };

type Props = {
  data: Datum[];
  height?: number;
  /** Index highlighted (white bar + tooltip). Defaults to max value. */
  activeIndex?: number;
  onSelect?: (index: number) => void;
};

/** Rounded vertical bar chart (Analytics "4 hours" weekly chart). Pure Views — no SVG needed. */
export function BarChart({ data, height = 170, activeIndex, onSelect }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const defaultActive = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const [internal, setInternal] = useState(activeIndex ?? defaultActive);
  const active = activeIndex ?? internal;

  return (
    <View style={styles.wrap}>
      <View style={[styles.bars, { height }]}>
        {data.map((d, i) => {
          const h = Math.max(24, (d.value / max) * height);
          const isActive = i === active;
          return (
            <Pressable
              key={d.label}
              onPress={() => {
                setInternal(i);
                onSelect?.(i);
              }}
              style={styles.col}>
              {isActive && d.tooltip ? (
                <View style={styles.tooltip}>
                  <AppText variant="captionMedium" color={colors.black}>
                    {d.tooltip}
                  </AppText>
                  <View style={styles.tooltipArrow} />
                </View>
              ) : null}
              <View style={[styles.bar, { height: h, backgroundColor: isActive ? colors.white : colors.chartTrack }]} />
            </Pressable>
          );
        })}
      </View>
      <View style={styles.labels}>
        {data.map((d, i) => (
          <AppText key={d.label} variant="caption" color={i === active ? colors.text : colors.textMuted} center style={styles.label}>
            {d.label}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, paddingTop: 40 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: radius.pill },
  tooltip: {
    position: 'absolute',
    top: -34,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignItems: 'center',
    zIndex: 2,
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -5,
    width: 10,
    height: 10,
    backgroundColor: colors.white,
    transform: [{ rotate: '45deg' }],
  },
  labels: { flexDirection: 'row', gap: 10, marginTop: 10 },
  label: { flex: 1 },
});
