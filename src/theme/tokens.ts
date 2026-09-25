import { Platform } from 'react-native';

/**
 * Design tokens extracted from the Nest Event Figma (Guest + Organizer flows).
 * The app is dark-only by design.
 */
export const colors = {
  // Backgrounds
  bg: '#0B0B0B',
  bgElevated: '#131313',
  surface: '#1A1A1A',
  surfaceAlt: '#1F1F1F',
  surfaceHigh: '#262626',
  border: '#2A2A2A',
  borderSoft: '#1F1F1F',
  overlay: 'rgba(0,0,0,0.6)',

  // Brand
  primary: '#FF6B00',
  primaryDark: '#E85D00',
  primaryLight: '#FF8A3D',
  primarySoft: 'rgba(255,107,0,0.16)',
  primaryGlow: 'rgba(255,107,0,0.35)',

  // Text
  text: '#FFFFFF',
  textSecondary: '#B5B5B5',
  textMuted: '#7A7A7A',
  textInverse: '#0B0B0B',
  placeholder: '#8A8A8A',

  // Semantic
  success: '#22C55E',
  successSoft: 'rgba(34,197,94,0.16)',
  danger: '#EF4444',
  dangerSoft: 'rgba(239,68,68,0.16)',
  warning: '#F59E0B',
  info: '#3B82F6',
  white: '#FFFFFF',
  black: '#000000',

  // Chart palette
  chart1: '#FF6B00',
  chart2: '#4F6DF5',
  chart3: '#9BE83A',
  chartTrack: '#2B2B2B',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 64,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  pill: 999,
} as const;

/** Font family names registered via useFonts in the root layout. */
export const fonts = {
  display: 'Syne_800ExtraBold',
  displayBold: 'Syne_700Bold',
  light: 'Outfit_300Light',
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
} as const;

/** Figma screen headings are Syne Bold with -3% letter spacing. */
const HEADING_TRACKING = -0.03;

export const typography = {
  display: { fontFamily: fonts.displayBold, fontSize: 34, lineHeight: 40, letterSpacing: 34 * HEADING_TRACKING },
  displaySm: { fontFamily: fonts.displayBold, fontSize: 28, lineHeight: 34, letterSpacing: 28 * HEADING_TRACKING },
  /** Auth screen headings (Sign in / Sign Up / OTP). */
  heading: { fontFamily: fonts.displayBold, fontSize: 22, lineHeight: 30, letterSpacing: 22 * HEADING_TRACKING },
  h1: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30 },
  h2: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26 },
  h3: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  title: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21 },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  captionMedium: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  button: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 20 },
} as const;

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.35,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 6 },
    default: {},
  }),
  glow: Platform.select({
    ios: {
      shadowColor: colors.primary,
      shadowOpacity: 0.45,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 8 },
    default: {},
  }),
} as const;

/** Layout constants shared across screens. */
export const layout = {
  screenPadding: 16,
  /** Height of the floating pill tab bar + its bottom offset. Add to bottom padding of tab screens. */
  tabBarHeight: 70,
  tabBarBottomOffset: Platform.select({ ios: 24, android: 16, default: 16 }) as number,
  buttonHeight: 54,
  inputHeight: 54,
  headerHeight: 56,
} as const;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };
