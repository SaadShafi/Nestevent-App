import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

const TILE = 256;
/** Esri "Dark Gray Canvas" basemap — keyless, labelled, and its dark style matches the app. */
const tileUrl = (z: number, x: number, y: number) =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/${z}/${y}/${x}`;

/** Web-Mercator world pixel position of a coordinate at zoom `z`. */
function project(lat: number, lng: number, z: number) {
  const scale = TILE * 2 ** z;
  const sin = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

type Props = { latitude: number; longitude: number; zoom?: number };

/**
 * Static map preview built from map tiles, centred on the coordinate. Used on Android when no
 * Google Maps API key is configured (the Google SDK renders a blank map without one).
 */
export function TileMap({ latitude, longitude, zoom = 15 }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.width || height !== size.height) setSize({ width, height });
  };

  const center = project(latitude, longitude, zoom);
  const left = center.x - size.width / 2;
  const top = center.y - size.height / 2;
  const max = 2 ** zoom;
  const tiles: { key: string; x: number; y: number; uri: string }[] = [];
  if (size.width > 0) {
    for (let ty = Math.floor(top / TILE); ty <= Math.floor((top + size.height) / TILE); ty++) {
      for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + size.width) / TILE); tx++) {
        if (ty < 0 || ty >= max) continue;
        const wx = ((tx % max) + max) % max;
        tiles.push({ key: `${tx}:${ty}`, x: tx * TILE - left, y: ty * TILE - top, uri: tileUrl(zoom, wx, ty) });
      }
    }
  }

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout} pointerEvents="none">
      {tiles.map((t) => (
        <Image
          key={t.key}
          source={{ uri: t.uri }}
          style={[styles.tile, { left: t.x, top: t.y }]}
          cachePolicy="memory-disk"
          transition={150}
        />
      ))}
      <Text style={styles.attribution}>Esri, HERE, Garmin, © OpenStreetMap</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { position: 'absolute', width: TILE, height: TILE },
  attribution: {
    position: 'absolute',
    left: 8,
    bottom: 6,
    fontSize: 9,
    color: 'rgba(255,255,255,0.55)',
  },
});
