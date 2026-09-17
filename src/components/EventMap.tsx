import { useRouter } from 'expo-router';
import { Linking, Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';

import { Icon } from '@/components/ui';
import { colors, radius } from '@/theme';

type Props = {
  coords: { latitude: number; longitude: number };
  title?: string;
  address?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
  interactive?: boolean;
  /** Called when the orange locate button is pressed. Defaults to opening the native maps app. */
  onLocate?: () => void;
};

/**
 * Map preview used on Event Details / Review Event.
 * iOS → Apple Maps (PROVIDER_DEFAULT), Android → Google Maps. Dark map style on Google.
 */
export function EventMap({ coords, title, address, height = 150, style, interactive = false, onLocate }: Props) {
  useRouter();
  const openDirections = () => {
    const label = encodeURIComponent(title ?? address ?? 'Event');
    const url = Platform.select({
      ios: `maps://?daddr=${coords.latitude},${coords.longitude}&q=${label}`,
      android: `geo:${coords.latitude},${coords.longitude}?q=${coords.latitude},${coords.longitude}(${label})`,
      default: `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`,
    }) as string;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={[styles.wrap, { height }, style]}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        initialRegion={{ ...coords, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        userInterfaceStyle="dark"
        customMapStyle={Platform.OS === 'android' ? DARK_MAP_STYLE : undefined}>
        <Marker coordinate={coords} title={title} description={address}>
          <View style={styles.pin}>
            <Icon name="location" size={18} color={colors.white} />
          </View>
        </Marker>
      </MapView>
      <Pressable onPress={onLocate ?? openDirections} style={styles.locate} accessibilityLabel="Open directions">
        <Icon name="navigate" size={16} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  locate: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373737' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#181818' }] },
];
