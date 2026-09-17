import { SvgXml } from 'react-native-svg';

import { colors } from '@/theme';

import { FIGMA_ICONS, type FigmaIconName } from './figmaIcons';

type Props = { name: FigmaIconName; size?: number; color?: string; width?: number; height?: number };

/** Renders one of the vuesax icons exported from the Figma file, tinted with `color`. */
export function FigmaIcon({ name, size = 24, color = colors.white, width, height }: Props) {
  const xml = FIGMA_ICONS[name].replace(/currentColor/g, color);
  return <SvgXml xml={xml} width={width ?? size} height={height ?? size} />;
}

export type { FigmaIconName };
