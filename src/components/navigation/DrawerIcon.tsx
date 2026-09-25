import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme';

export type DrawerIconName = 'dashboard' | 'support' | 'setting' | 'terms' | 'privacy' | 'faq' | 'profile';

type Props = { name: DrawerIconName; size?: number; color?: string };

/** Page-shaped document with a folded top-right corner (Terms / Privacy). */
const DOC = 'M13.2 2H7.5A3.5 3.5 0 0 0 4 5.5v13A3.5 3.5 0 0 0 7.5 22h9a3.5 3.5 0 0 0 3.5-3.5V8.8h-4.6a2.2 2.2 0 0 1-2.2-2.2z';
const DOC_FOLD = 'M14.8 2.4v4.1c0 .4.3.7.7.7h4.1z';

/**
 * Filled side-menu icons from the Figma "Welcome To Inspired" drawer (vuesax bold style), drawn as
 * vectors so they stay sharp at any density. Cut-outs use the drawer background colour.
 */
export function DrawerIcon({ name, size = 20, color = colors.white }: Props) {
  const cut = colors.bg;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'dashboard' ? (
        <>
          <Rect x={3} y={3} width={8} height={8} rx={2} fill={color} />
          <Rect x={13} y={3} width={8} height={8} rx={2} fill={color} opacity={0.45} />
          <Rect x={3} y={13} width={8} height={8} rx={2} fill={color} opacity={0.45} />
          <Rect x={13} y={13} width={8} height={8} rx={2} fill={color} />
        </>
      ) : null}
      {name === 'support' ? (
        <>
          <Path d="M4.5 13v-1.5a7.5 7.5 0 0 1 15 0V13" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
          <Rect x={2.5} y={11.5} width={4.5} height={7} rx={2.2} fill={color} />
          <Rect x={17} y={11.5} width={4.5} height={7} rx={2.2} fill={color} />
          <Path d="M19.3 18.5v.3a2.7 2.7 0 0 1-2.7 2.7h-2.4" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Rect x={10.2} y={20} width={4.6} height={3} rx={1.5} fill={color} />
        </>
      ) : null}
      {name === 'setting' ? (
        <>
          {/* Eight-tooth gear with a centre hole. */}
          <Circle cx={12} cy={12} r={7} fill={color} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <Rect key={deg} x={10.1} y={1.8} width={3.8} height={4.4} rx={1.2} fill={color} transform={`rotate(${deg} 12 12)`} />
          ))}
          <Circle cx={12} cy={12} r={3} fill={cut} />
        </>
      ) : null}
      {name === 'terms' || name === 'privacy' ? (
        <>
          <Path d={DOC} fill={color} />
          <Path d={DOC_FOLD} fill={color} />
          {name === 'terms' ? (
            <Path d="M8.2 16.2h7.6" stroke={cut} strokeWidth={2.2} strokeLinecap="round" />
          ) : (
            <Path d="M8.3 15.6l2.3 2.3 4.6-4.6" stroke={cut} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          )}
        </>
      ) : null}
      {name === 'faq' ? (
        <>
          <Rect x={3} y={3} width={18} height={18} rx={5} fill={color} />
          <Path d="M7.8 10h8.4M7.8 14.5h5" stroke={cut} strokeWidth={2} strokeLinecap="round" />
        </>
      ) : null}
      {name === 'profile' ? (
        <>
          <Circle cx={12} cy={7} r={4.6} fill={color} />
          <Path d="M3.6 20.3c0-3.9 3.8-6.8 8.4-6.8s8.4 2.9 8.4 6.8c0 .7-.5 1.2-1.2 1.2H4.8c-.7 0-1.2-.5-1.2-1.2z" fill={color} />
        </>
      ) : null}
    </Svg>
  );
}
