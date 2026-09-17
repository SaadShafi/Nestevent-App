import {
  Feather,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { type StyleProp, type TextStyle } from 'react-native';

import { colors } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type FeatherName = ComponentProps<typeof Feather>['name'];
type MCIName = ComponentProps<typeof MaterialCommunityIcons>['name'];
type MIName = ComponentProps<typeof MaterialIcons>['name'];
type FA6Name = ComponentProps<typeof FontAwesome6>['name'];

type Base = { size?: number; color?: string; style?: StyleProp<TextStyle> };

/**
 * Thin wrappers over @expo/vector-icons so screens can stay declarative.
 * `Icon` = Ionicons (default set), plus named sets for glyphs Ionicons lacks.
 */
export function Icon({ name, size = 22, color = colors.text, style }: Base & { name: IoniconName }) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}
export function FeatherIcon({ name, size = 22, color = colors.text, style }: Base & { name: FeatherName }) {
  return <Feather name={name} size={size} color={color} style={style} />;
}
export function MCIcon({ name, size = 22, color = colors.text, style }: Base & { name: MCIName }) {
  return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
}
export function MIcon({ name, size = 22, color = colors.text, style }: Base & { name: MIName }) {
  return <MaterialIcons name={name} size={size} color={color} style={style} />;
}
export function BrandIcon({ name, size = 22, color = colors.text, style }: Base & { name: FA6Name }) {
  return <FontAwesome6 name={name} size={size} color={color} style={style} />;
}

export type { IoniconName, FeatherName, MCIName };
