import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/ui';
import { useEvent } from '@/hooks/useEvent';
import { useOrganizerStore } from '@/store';
import { colors } from '@/theme';

/**
 * /organizer/event/[id]/edit — loads the event into the wizard draft, then hands off to
 * Create Event step 1 in edit mode (EventDetailsFormScreen reads `?edit=<id>`).
 */
export function EditEventRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useEvent(id);
  const loadDraftFromEvent = useOrganizerStore((s) => s.loadDraftFromEvent);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (event) loadDraftFromEvent(event);
    setReady(true);
  }, [event, loadDraftFromEvent]);

  if (!ready) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }
  if (!event) return <Redirect href="/(organizer)/(tabs)/events" />;
  return <Redirect href={`/organizer/create-event?edit=${event.id}`} />;
}

export default EditEventRedirect;

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
