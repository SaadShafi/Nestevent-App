import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LocationPicker } from '@/components/LocationPicker';
import { AppText, Button, DateTimeField, Header, Screen, Select } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useEventsStore, type EventFilters } from '@/store';

import { tabPath } from '../../home/utils';
import { RangeSlider } from '../components/RangeSlider';

const CATEGORY_OPTIONS: { value: EventFilters['category']; label: string }[] = [
  { value: 'Events', label: 'Events' },
  { value: 'Organizations', label: 'Organizations' },
  { value: 'Users', label: 'Users' },
];

export function FilterScreen() {
  const router = useRouter();
  const filters = useEventsStore((s) => s.filters);
  const setFilters = useEventsStore((s) => s.setFilters);

  const [category, setCategory] = useState<EventFilters['category']>(filters.category);
  const [location, setLocation] = useState(filters.location);
  const [date, setDate] = useState<Date | null>(filters.date ? new Date(filters.date) : null);
  const [price, setPrice] = useState({ min: filters.priceMin, max: filters.priceMax });
  const [distance, setDistance] = useState({ min: filters.distanceMin, max: filters.distanceMax });

  const apply = () => {
    haptic.medium();
    setFilters({
      category,
      location,
      date: date ? date.toISOString() : null,
      priceMin: price.min,
      priceMax: price.max,
      distanceMin: distance.min,
      distanceMax: distance.max,
    });
    router.replace({ pathname: tabPath('search'), params: { results: '1' } });
  };

  return (
    <Screen
      scroll
      keyboard
      glow
      footer={<Button title="Apply Filter" variant="white" onPress={apply} />}>
      <Header title="Filter" />
      <Select label="Category" options={CATEGORY_OPTIONS} value={category} onChange={setCategory} sheetTitle="Category" />
      <LocationPicker label="Location" value={location} onChangeText={setLocation} />
      <DateTimeField label="Date" mode="date" value={date} onChange={setDate} placeholder="Any date" minimumDate={new Date()} />

      <View style={styles.rangeHeader}>
        <AppText variant="label">Price Range</AppText>
      </View>
      <AppText variant="caption" secondary style={styles.rangeHint}>
        Min To Max
      </AppText>
      <RangeSlider
        min={0}
        max={500}
        step={5}
        minValue={price.min}
        maxValue={price.max}
        onChange={(min, max) => setPrice({ min, max })}
        format={(v) => `$${v.toFixed(2)}`}
      />

      <View style={[styles.rangeHeader, styles.section]}>
        <AppText variant="label">Distance</AppText>
      </View>
      <AppText variant="caption" secondary style={styles.rangeHint}>
        500 KM
      </AppText>
      <RangeSlider
        min={0}
        max={500}
        step={5}
        minValue={distance.min}
        maxValue={distance.max}
        onChange={(min, max) => setDistance({ min, max })}
        format={(v) => `${v} KM`}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rangeHeader: { marginBottom: 4 },
  rangeHint: { alignSelf: 'flex-end' },
  section: { marginTop: 24 },
});
