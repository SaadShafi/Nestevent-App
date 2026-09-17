import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Header, Input, Screen, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useOrganizerStore } from '@/store';
import { colors, radius } from '@/theme';

import { formatNumber } from '../../utils';

const PLACEHOLDER = 'Doors open at 10 PM. VIP uses the east entrance.';
const RECIPIENTS = 1005;

/** SMS Blast step 2: compose and send. */
export function SmsMessageScreen() {
  const router = useRouter();
  const toast = useToast();
  const { audience = 'Current attendees', scope = 'All NightBloom events', consent = 'Consented contacts only' } =
    useLocalSearchParams<{ audience?: string; scope?: string; consent?: string }>();
  const addSmsBlast = useOrganizerStore((s) => s.addSmsBlast);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | undefined>();

  const preview = message.trim() || PLACEHOLDER;

  const send = () => {
    const text = message.trim();
    if (!text) {
      setError('Write a message first');
      haptic.error();
      return;
    }
    const title = text.length > 42 ? `${text.slice(0, 42).trim()}…` : text;
    addSmsBlast({ title, message: text, audience, scope, consentFilter: consent, recipients: RECIPIENTS });
    haptic.success();
    toast(`SMS sent to ${formatNumber(RECIPIENTS)} contacts`, 'success');
    router.dismissTo('/organizer/marketing/sms');
  };

  return (
    <Screen scroll keyboard footer={<Button title="Send SMS" variant="white" onPress={send} />}>
      <Header title="SMS Blast Message" />
      <View style={styles.row}>
        <InfoCard title="Recipients" value={`${formatNumber(RECIPIENTS)} consented contacts`} />
        <InfoCard title="Message" value={preview} />
        <InfoCard title="Delivery" value="SMS provider" />
      </View>
      <Input
        outlined
        multiline
        label="Message"
        placeholder={PLACEHOLDER}
        value={message}
        onChangeText={(t) => {
          setMessage(t);
          if (error) setError(undefined);
        }}
        maxLength={320}
        error={error}
      />
    </Screen>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.info}>
      <AppText variant="h3" numberOfLines={1}>
        {title}
      </AppText>
      <AppText variant="caption" secondary numberOfLines={2}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  info: {
    flex: 1,
    minHeight: 84,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    borderRadius: radius.md,
    padding: 12,
    gap: 4,
  },
});
