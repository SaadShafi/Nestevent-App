import { Linking, Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';

import { Icon } from '@/components/ui';
import { colors, radius } from '@/theme';

import { TileMap } from './TileMap';

/** Google Maps on Android needs a real API key in app.json; without one its map renders blank. */
const googleKey = Constants.expoConfig?.android?.config?.googleMaps?.apiKey ?? '';
const USE_TILE_MAP = Platform.OS === 'android' && (!googleKey || googleKey.startsWith('YOUR_'));

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
 * iOS → Apple Maps (PROVIDER_DEFAULT), Android → Google Maps (dark style), or a keyless tile map
 * when no Google Maps key is configured.
 */
export function EventMap({ coords, title, address, height = 150, style, interactive = false, onLocate }: Props) {
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
      {USE_TILE_MAP ? (
        <>
          <TileMap latitude={coords.latitude} longitude={coords.longitude} />
          <View pointerEvents="none" style={styles.centerPin}>
            <View style={styles.pin}>
              <Icon name="location" size={18} color={colors.white} />
            </View>
          </View>
        </>
      ) : (
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
      )}
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
  centerPin: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
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
