import { useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';

/** Height of the wave band that overlaps the bottom of a cover image. */
export const WAVE_H = 32;

/**
 * Hill-shaped top edge traced from the Figma User Details / View Event frames: slightly raised on
 * the left, dipping to its lowest just past the middle, peaking near the right edge.
 */
function wavePath(w: number, h: number) {
  return [
    `M0 ${h * 0.12}`,
    `C ${w * 0.18} ${h * 0.12} ${w * 0.3} ${h} ${w * 0.5} ${h}`,
    `C ${w * 0.7} ${h} ${w * 0.8} 0 ${w * 0.93} 0`,
    `C ${w * 0.97} 0 ${w} ${h * 0.08} ${w} ${h * 0.14}`,
    `L ${w} ${h + 1} L 0 ${h + 1} Z`,
  ].join(' ');
}

/**
 * Full-width wavy top edge for a dark sheet laid over a cover. Place it directly above the sheet
 * with `marginTop: -WAVE_H` on their wrapper so the wave sits on the image.
 */
export function WaveEdge({ color = colors.bg }: { color?: string }) {
  const { width } = useWindowDimensions();
  return (
    <Svg width={width} height={WAVE_H + 1}>
      <Path d={wavePath(width, WAVE_H)} fill={color} />
    </Svg>
  );
}
