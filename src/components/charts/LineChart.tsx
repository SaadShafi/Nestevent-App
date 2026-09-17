import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { AppText } from '@/components/ui';
import { colors } from '@/theme';

type Props = {
  values: number[];
  labels: string[];
  height?: number;
  /** Index of the highlighted point (tooltip). */
  highlightIndex?: number;
  highlightLabel?: string;
  color?: string;
};

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Smooth orange line over gradient columns (Event Analytics "Sales Performance"). */
export function LineChart({ values, labels, height = 180, highlightIndex, highlightLabel, color = colors.primary }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const padX = 12;
  const padY = 16;
  const innerW = Math.max(0, width - padX * 2);
  const innerH = height - padY * 2;
  const step = values.length > 1 ? innerW / (values.length - 1) : 0;
  const points = values.map((v, i) => ({
    x: padX + i * step,
    y: padY + innerH - ((v - min) / (max - min || 1)) * innerH,
  }));
  const colCount = 6;
  const colW = innerW / colCount;
  const hi = highlightIndex ?? values.indexOf(max);

  return (
    <View onLayout={onLayout} style={styles.wrap}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="col" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#3A3A3A" stopOpacity="0.2" />
              <Stop offset="1" stopColor="#5A5A5A" stopOpacity="0.9" />
            </LinearGradient>
          </Defs>
          {Array.from({ length: colCount }).map((_, i) => (
            <Rect key={i} x={padX + i * colW + 3} y={padY} width={colW - 6} height={innerH} rx={6} fill="url(#col)" />
          ))}
          <Path d={smoothPath(points)} stroke={color} strokeWidth={2.5} fill="none" />
          {points[hi] ? <Circle cx={points[hi].x} cy={points[hi].y} r={5} fill={color} stroke={colors.white} strokeWidth={2} /> : null}
        </Svg>
      ) : null}
      {highlightLabel && points[hi] ? (
        <View style={[styles.tooltip, { left: Math.min(Math.max(points[hi].x - 40, 0), width - 150), top: Math.max(points[hi].y - 36, 0) }]}>
          <AppText variant="captionMedium">
            <AppText variant="captionMedium" color={colors.primary}>
              {highlightLabel.split(':')[0]}:
            </AppText>{' '}
            {highlightLabel.split(':').slice(1).join(':').trim()}
          </AppText>
        </View>
      ) : null}
      <View style={styles.labels}>
        {labels.map((l, i) => (
          <AppText key={`${l}-${i}`} variant="caption" color={i === labels.length - 1 ? colors.primary : colors.textMuted}>
            {l}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  tooltip: {
    position: 'absolute',
    backgroundColor: colors.surfaceHigh,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, marginTop: 6 },
});
