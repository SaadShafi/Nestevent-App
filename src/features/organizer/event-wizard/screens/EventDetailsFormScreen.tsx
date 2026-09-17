import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { pickImages, UploadDropzone } from '@/components/PhotoPicker';
import { AppText, Button, DateTimeField, Header, Icon, Input, Screen, Select, useToast } from '@/components/ui';
import { useMyOrganizations } from '@/features/organizer/hooks';
import { useEvent } from '@/hooks/useEvent';
import { haptic } from '@/lib/haptics';
import { required } from '@/lib/validation';
import { useOrganizerStore } from '@/store';
import { colors, layout, radius } from '@/theme';

import { EventLocationPicker } from '../../shared/EventLocationPicker';
import { combineDateTime, toDate } from '../../shared/utils';

const THUMB_GAP = 10;

type Errors = {
  name?: string;
  org?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  location?: string;
};

/** Create Event / Edit Event — step 1 of the wizard (event identity, date/time, location). */
export function EventDetailsFormScreen() {
  const router = useRouter();
  const toast = useToast();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const event = useEvent(edit);
  const draft = useOrganizerStore((s) => s.draft);
  const setDraft = useOrganizerStore((s) => s.setDraft);
  const loadDraftFromEvent = useOrganizerStore((s) => s.loadDraftFromEvent);
  const orgs = useMyOrganizations();
  const orgOptions = useMemo(() => orgs.map((o) => ({ value: o.id, label: o.name, description: o.type })), [orgs]);
  const isEdit = !!edit && !!event;
  const { width: windowWidth } = useWindowDimensions();
  // Explicit thumbnail size (3 per row): percentage + aspectRatio tiles inside a wrapping row
  // laid out with zero paint area on Android/Fabric.
  const thumbWidth = Math.floor((windowWidth - layout.screenPadding * 2 - THUMB_GAP * 2) / 3);
  const thumbHeight = Math.round(thumbWidth / 1.35);

  const [errors, setErrors] = useState<Errors>({});
  const clear = (...keys: (keyof Errors)[]) =>
    setErrors((e) => {
      if (!keys.some((k) => e[k])) return e;
      const next = { ...e };
      keys.forEach((k) => delete next[k]);
      return next;
    });

  useEffect(() => {
    if (edit && event && draft.id !== edit) loadDraftFromEvent(event);
  }, [edit, event, draft.id, loadDraftFromEvent]);

  const addPhotos = async () => {
    haptic.light();
    const uris = await pickImages({ multiple: true });
    if (uris.length) {
      setDraft({ photos: [...draft.photos, ...uris.filter((u) => !draft.photos.includes(u))] });
      haptic.success();
    }
  };

  const removePhoto = (uri: string) => setDraft({ photos: draft.photos.filter((p) => p !== uri) });

  const validate = (): Errors => {
    const e: Errors = {};
    if (!required(draft.name)) e.name = 'Event name is required';
    if (!draft.organizationId) e.org = orgOptions.length ? 'Select an organization' : 'Create an organization first';
    if (!required(draft.description)) e.description = 'Add an event description';
    if (!draft.startDate) e.startDate = 'Pick a start date';
    if (!draft.endDate) e.endDate = 'Pick an end date';
    if (!draft.startTime) e.startTime = 'Pick a start time';
    if (!draft.endTime) e.endTime = 'Pick an end time';
    if (draft.startDate && draft.endDate && draft.startTime && draft.endTime) {
      const start = new Date(combineDateTime(draft.startDate, draft.startTime)).getTime();
      const end = new Date(combineDateTime(draft.endDate, draft.endTime)).getTime();
      if (end <= start) {
        const sameDay = new Date(draft.startDate).toDateString() === new Date(draft.endDate).toDateString();
        if (sameDay) e.endTime = 'End time must be after the start time';
        else e.endDate = 'End must be after the start';
      }
    }
    if (!required(draft.venueName)) e.venue = 'Venue name is required';
    if (!required(draft.location)) e.location = 'Enter the event location';
    return e;
  };

  const next = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      haptic.error();
      toast('Please fix the highlighted fields', 'error');
      return;
    }
    router.push('/organizer/create-event/flyer');
  };

  return (
    <Screen scroll keyboard footer={<Button title={isEdit ? 'Save & Continue' : 'Next'} variant="white" onPress={next} />}>
      <Header title={isEdit ? 'Edit Event' : 'Create Event'} />

      <UploadDropzone
        title={draft.photos.length ? 'Add More Photos' : 'Upload Event Photo'}
        subtitle={draft.photos.length ? `${draft.photos.length} selected` : 'You can select several'}
        cta="Upload"
        onPick={addPhotos}
        height={170}
      />
      {draft.photos.length ? (
        <View style={styles.grid}>
          {draft.photos.map((uri) => (
            <View key={uri} style={[styles.thumb, { width: thumbWidth, height: thumbHeight }]}>
              <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
              <Pressable onPress={() => removePhoto(uri)} style={styles.remove} hitSlop={6} accessibilityLabel="Remove photo">
                <View style={styles.removeDot}>
                  <Icon name="close" size={8} color={colors.white} />
                </View>
                <AppText variant="caption">Remove</AppText>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <Input
        label="Event Name"
        placeholder="Midnight Garden"
        value={draft.name}
        onChangeText={(t) => {
          setDraft({ name: t });
          clear('name');
        }}
        error={errors.name}
      />
      <Select
        label="Organization"
        options={orgOptions}
        value={draft.organizationId}
        onChange={(id) => {
          setDraft({ organizationId: id });
          clear('org');
        }}
        error={errors.org}
        sheetTitle="Organization"
        placeholder={orgOptions.length ? 'Select' : 'Create an organization first'}
      />
      <Input
        label="Description"
        placeholder="Full Event Description"
        value={draft.description}
        onChangeText={(t) => {
          setDraft({ description: t });
          clear('description');
        }}
        multiline
        maxLength={1000}
        error={errors.description}
      />

      <AppText variant="h3" style={styles.section}>
        Date, Time & Location
      </AppText>
      <View style={styles.row}>
        <DateTimeField
          label="Start Date"
          mode="date"
          value={toDate(draft.startDate)}
          onChange={(d) => {
            const iso = d.toISOString();
            const end = draft.endDate && new Date(draft.endDate) >= d ? draft.endDate : iso;
            setDraft({ startDate: iso, endDate: end });
            clear('startDate', 'endDate', 'endTime');
          }}
          error={errors.startDate}
          containerStyle={styles.flex}
        />
        <DateTimeField
          label="End Date"
          mode="date"
          value={toDate(draft.endDate)}
          minimumDate={toDate(draft.startDate) ?? undefined}
          onChange={(d) => {
            setDraft({ endDate: d.toISOString() });
            clear('endDate', 'endTime');
          }}
          error={errors.endDate}
          containerStyle={styles.flex}
        />
      </View>
      <View style={styles.row}>
        <DateTimeField
          label="Start Time"
          mode="time"
          value={toDate(draft.startTime)}
          onChange={(d) => {
            setDraft({ startTime: d.toISOString() });
            clear('startTime', 'endTime');
          }}
          error={errors.startTime}
          containerStyle={styles.flex}
        />
        <DateTimeField
          label="End Time"
          mode="time"
          value={toDate(draft.endTime)}
          onChange={(d) => {
            setDraft({ endTime: d.toISOString() });
            clear('endTime', 'endDate');
          }}
          error={errors.endTime}
          containerStyle={styles.flex}
        />
      </View>

      <Input
        label="Venue Name"
        placeholder="Garden Hall"
        value={draft.venueName}
        onChangeText={(t) => {
          setDraft({ venueName: t });
          clear('venue');
        }}
        error={errors.venue}
      />
      <EventLocationPicker
        label="Location"
        value={draft.location}
        onChangeText={(t) => {
          // Typing a new address invalidates the last GPS fix so the map won't point at a stale pin.
          setDraft({ location: t, coords: t === draft.location ? draft.coords : null });
          clear('location');
        }}
        onLocated={({ coords, label, city, country, zipcode }) =>
          setDraft({
            coords,
            location: label,
            city: city ?? draft.city,
            country: country ?? draft.country,
            zipcode: zipcode ?? draft.zipcode,
          })
        }
        error={errors.location}
      />
      <View style={styles.row}>
        <Input label="Country" placeholder="Country" value={draft.country} onChangeText={(t) => setDraft({ country: t })} containerStyle={styles.flex} />
        <Input label="City" placeholder="City" value={draft.city} onChangeText={(t) => setDraft({ city: t })} containerStyle={styles.flex} />
      </View>
      <Input label="Zipcode" placeholder="Enter" value={draft.zipcode} onChangeText={(t) => setDraft({ zipcode: t })} keyboardType="number-pad" />
    </Screen>
  );
}

export default EventDetailsFormScreen;

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: THUMB_GAP, marginBottom: 20 },
  thumb: { borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surface },
  remove: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  removeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
  section: { marginTop: 4, marginBottom: 14 },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});
