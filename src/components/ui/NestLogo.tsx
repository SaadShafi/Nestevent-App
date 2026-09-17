import { Image } from 'expo-image';
import { type ImageStyle, type StyleProp } from 'react-native';

type Props = { size?: number; style?: StyleProp<ImageStyle>; variant?: 'orange' | 'white' };

/**
 * Official NEST logotype exported from Figma. `size` is the rendered height.
 * `variant="white"` is the white mark used on the orange Home headers.
 */
const LOGO = require('@/assets/images/nest-logo.png');
const LOGO_WHITE = require('@/assets/images/nest-logo-white.png');
const ASPECT = 1010 / 660;

export function NestLogo({ size = 48, style, variant = 'orange' }: Props) {
  return (
    <Image
      source={variant === 'white' ? LOGO_WHITE : LOGO}
      accessibilityLabel="Nest"
      contentFit="contain"
      style={[{ width: size * ASPECT, height: size }, style]}
    />
  );
}
