import { File, Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library/legacy';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { AppText, Button, EmptyState, Header, Icon, IconButton, Screen, useToast } from '@/components/ui';
import { useEvent } from '@/hooks/useEvent';
import { formatCurrency } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { shareContent } from '@/lib/share';
import { useTicketsStore } from '@/store';
import { colors, radius } from '@/theme';

type QrRef = { toDataURL: (cb: (base64: string) => void) => void } | null;

export function TicketScreen() {
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ticket = useTicketsStore((s) => s.myTickets.find((t) => t.id === id));
  const event = useEvent(ticket?.eventId);
  const qrRef = useRef<QrRef>(null);
  const [saving, setSaving] = useState(false);

  if (!ticket || !event) {
    return (
      <Screen>
        <Header title="Ticket" />
        <EmptyState icon="ticket-outline" title="Ticket not found" />
      </Screen>
    );
  }

  const onShare = () =>
    shareContent({
      title: event.title,
      message: `My ticket for ${event.title} — ${ticket.qty} × ${ticket.ticketTypeName}`,
      url: `https://nest.app/t/${ticket.id}`,
    });

  const onDownload = () => {
    if (!qrRef.current || saving) return;
    setSaving(true);
    haptic.light();
    qrRef.current.toDataURL(async (base64) => {
      try {
        const file = new File(Paths.cache, `nest-ticket-${ticket.id}.png`);
        file.write(base64, { encoding: 'base64' });
        const perm = await MediaLibrary.requestPermissionsAsync(true);
        if (perm.status !== 'granted') {
          toast('Photos permission is required', 'error');
          return;
        }
        await MediaLibrary.saveToLibraryAsync(file.uri);
        haptic.success();
        toast('QR saved to Photos', 'success');
      } catch (e) {
        haptic.error();
        toast(e instanceof Error ? e.message : 'Could not save QR code', 'error');
      } finally {
        setSaving(false);
      }
    });
  };

  return (
    <Screen
      scroll
      footer={
        <View style={styles.footer}>
          <Button
            title="Share Via"
            variant="surface"
            style={styles.flex}
            left={<Icon name="share-social" size={18} color={colors.white} />}
            onPress={onShare}
          />
          <Button
            title="Download QR"
            style={styles.flex}
            loading={saving}
            left={<Icon name="download-outline" size={18} color={colors.white} />}
            onPress={onDownload}
          />
        </View>
      }>
      <Header title="Ticket" right={<IconButton name="arrow-redo-outline" onPress={onShare} accessibilityLabel="Share ticket" />} />

      <View style={styles.cover}>
        <Image source={{ uri: event.cover }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.coverGrad} />
        <View style={styles.coverBody}>
          <View style={styles.pills}>
            <View style={styles.pill}>
              <AppText variant="captionMedium">{ticket.qty} Tickets</AppText>
            </View>
            {ticket.scanned ? (
              <View style={[styles.pill, styles.scanned]}>
                <Icon name="checkmark-done" size={12} color={colors.success} />
                <AppText variant="captionMedium" color={colors.success}>
                  Scanned
                </AppText>
              </View>
            ) : null}
          </View>
          <View style={styles.titleRow}>
            <AppText variant="h1" numberOfLines={2} style={styles.title}>
              {event.title}
            </AppText>
            <Icon name="checkmark-circle" size={22} color={colors.primary} />
          </View>
        </View>
      </View>

      <View style={styles.stub}>
        <AppText variant="caption" secondary>
          Place
        </AppText>
        <AppText variant="title" style={styles.place}>
          {event.venueName}, in {event.city}, {event.country === 'USA' ? 'US' : event.country}
        </AppText>

        <View style={styles.tiles}>
          <Tile value={`${ticket.qty}`} label="Person" />
          <Tile value={ticket.ticketTypeName} label="Class" />
          <Tile value={formatCurrency(ticket.cost)} label="Cost" />
        </View>

        <AppText variant="caption" secondary center style={styles.scanLabel}>
          Scan this QR Code
        </AppText>
        <View style={styles.divider}>
          <View style={[styles.notch, styles.notchLeft]} />
          <View style={styles.dashed} />
          <View style={[styles.notch, styles.notchRight]} />
        </View>

        <View style={styles.qr}>
          <QRCode
            value={ticket.qrValue}
            size={150}
            color={colors.white}
            backgroundColor={colors.surface}
            getRef={(c) => {
              qrRef.current = c;
            }}
          />
        </View>
      </View>
    </Screen>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.tile}>
      <AppText variant="h2" numberOfLines={1}>
        {value}
      </AppText>
      <AppText variant="caption" secondary>
        {label}
      </AppText>
    </View>
  );
}

const NOTCH = 28;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  footer: { flexDirection: 'row', gap: 12 },
  cover: { height: 220, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.surface, marginTop: 4 },
  coverGrad: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 150 },
  coverBody: { position: 'absolute', left: 16, right: 16, bottom: 16, gap: 10 },
  pills: { flexDirection: 'row', gap: 8 },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  scanned: { backgroundColor: 'rgba(34,197,94,0.2)' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flexShrink: 1 },
  stub: { marginTop: 16, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, overflow: 'hidden' },
  place: { marginTop: 2 },
  tiles: { flexDirection: 'row', gap: 10, marginTop: 16 },
  tile: { flex: 1, backgroundColor: colors.bg, borderRadius: radius.lg, paddingVertical: 16, alignItems: 'center', gap: 2 },
  scanLabel: { marginTop: 22 },
  divider: { flexDirection: 'row', alignItems: 'center', height: NOTCH, marginTop: 10, marginHorizontal: -16 },
  dashed: { flex: 1, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, marginHorizontal: 4 },
  notch: { width: NOTCH, height: NOTCH, borderRadius: NOTCH / 2, backgroundColor: colors.bg },
  notchLeft: { marginLeft: -NOTCH / 2 },
  notchRight: { marginRight: -NOTCH / 2 },
  qr: { alignItems: 'center', paddingVertical: 20 },
});
