import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { AppText } from '@/components/ui';
import { colors } from '@/theme';

export type DonutSlice = { label: string; value: number; color: string; amountLabel?: string };

type Props = { slices: DonutSlice[]; size?: number; thickness?: number; showLegend?: boolean };

function polar(cx: number, cy: number, r: number, angle: number) {
  const a = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number) {
  const large = end - start > 180 ? 1 : 0;
  const so = polar(cx, cy, rOuter, start);
  const eo = polar(cx, cy, rOuter, end);
  const si = polar(cx, cy, rInner, end);
  const ei = polar(cx, cy, rInner, start);
  return `M ${so.x} ${so.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${eo.x} ${eo.y} L ${si.x} ${si.y} A ${rInner} ${rInner} 0 ${large} 0 ${ei.x} ${ei.y} Z`;
}

/** Donut with percentage bubbles + legend (Event Analytics "Top Tickets Types"). */
export function DonutChart({ slices, size = 200, thickness = 34, showLegend = true }: Props) {
  const total = slices.reduce((n, s) => n + s.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 24;
  const rInner = rOuter - thickness;
  let angle = 0;
  const arcs = slices.map((s) => {
    const sweep = (s.value / total) * 360;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    const mid = polar(cx, cy, rOuter + 10, (start + end) / 2);
    return { ...s, start, end, mid, pct: Math.round((s.value / total) * 100) };
  });

  return (
    <View style={styles.wrap}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <G>
            {arcs.map((a) => (
              <Path key={a.label} d={arcPath(cx, cy, rOuter, rInner, a.start, Math.max(a.end - 1.5, a.start))} fill={a.color} />
            ))}
            <Circle cx={cx} cy={cy} r={rInner - 2} fill={colors.surface} />
          </G>
        </Svg>
        {arcs.map((a) => (
          <View key={`b-${a.label}`} style={[styles.bubble, { left: a.mid.x - 22, top: a.mid.y - 14 }]}>
            <AppText variant="captionMedium">{a.pct}%</AppText>
          </View>
        ))}
      </View>
      {showLegend ? (
        <View style={styles.legend}>
          {slices.map((s) => (
            <View key={s.label} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: s.color }]} />
              <AppText variant="label" secondary style={styles.legendLabel}>
                {s.label}
              </AppText>
              {s.amountLabel ? <AppText variant="label">{s.amountLabel}</AppText> : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  bubble: {
    position: 'absolute',
    width: 44,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: { alignSelf: 'stretch', marginTop: 16, gap: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1 },
});
