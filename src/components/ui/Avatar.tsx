import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme';

type Props = {
  uri?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  /** Ring color around the avatar (e.g. success ring in Register Success) */
  ring?: string;
  online?: boolean;
};

export function Avatar({ uri, size = 48, style, ring, online }: Props) {
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2 },
        ring ? { borderWidth: 3, borderColor: ring, padding: 2 } : null,
        style,
      ]}>
      <Image
        source={uri ? { uri } : undefined}
        style={{ width: '100%', height: '100%', borderRadius: size / 2, backgroundColor: colors.surfaceHigh }}
        contentFit="cover"
        transition={150}
        cachePolicy="memory-disk"
      />
      {online ? <View style={[styles.online, { right: size * 0.02, bottom: size * 0.02 }]} /> : null}
    </View>
  );
}

export function AvatarStack({ uris, size = 28, max = 4 }: { uris: string[]; size?: number; max?: number }) {
  const shown = uris.slice(0, max);
  return (
    <View style={[styles.stack, { height: size }]}>
      {shown.map((u, i) => (
        <View
          key={`${u}-${i}`}
          style={{
            marginLeft: i === 0 ? 0 : -size * 0.35,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: colors.bg,
            zIndex: shown.length - i,
          }}>
          <Avatar uri={u} size={size - 4} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { flexDirection: 'row', alignItems: 'center' },
  online: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.bg,
  },
});
