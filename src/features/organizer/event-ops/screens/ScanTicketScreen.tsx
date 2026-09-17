import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, BottomSheet, Button, Icon, IconButton, Input, Screen, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useTicketsStore } from '@/store';
import { colors, layout, radius } from '@/theme';

import { HolderTicketsSheet } from '../components/HolderTicketsSheet';
import { ticketsForHolder } from '../utils';

const FRAME = 260;
const GLASS = 'rgba(0,0,0,0.45)';
const GLASS_BORDER = 'rgba(255,255,255,0.25)';

type Holder = { name: string; avatar?: string };

/** Scan Ticket — full-screen QR scanner with torch, manual entry and a post-scan holder sheet. */
export function ScanTicketScreen() {
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const scanTicket = useTicketsStore((s) => s.scanTicket);
  const soldTickets = useTicketsStore((s) => s.soldTickets);
  const myTickets = useTicketsStore((s) => s.myTickets);

  const lockedRef = useRef(false);
  const [torch, setTorch] = useState(false);
  const [holder, setHolder] = useState<Holder | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [code, setCode] = useState('');

  const holderTickets = useMemo(
    () => (holder && id ? ticketsForHolder(holder.name, id, soldTickets, myTickets) : []),
    [holder, id, soldTickets, myTickets],
  );

  const handleScan = useCallback(
    (data: string) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      const res = scanTicket(data.trim());
      if (res.ok && res.ticket) {
        haptic.success();
        setHolder({ name: res.ticket.holderName, avatar: res.ticket.holderAvatar });
        return;
      }
      haptic.error();
      toast(res.reason ?? 'Invalid ticket', 'error');
      if (res.ticket) {
        // Already scanned: still show the holder so the door team can review their tickets.
        setHolder({ name: res.ticket.holderName, avatar: res.ticket.holderAvatar });
        return;
      }
      setTimeout(() => {
        lockedRef.current = false;
      }, 1500);
    },
    [scanTicket, toast],
  );

  const closeResult = () => {
    setHolder(null);
    lockedRef.current = false;
  };

  const checkManual = () => {
    const value = code.trim();
    if (!value) {
      haptic.error();
      toast('Enter a ticket code', 'error');
      return;
    }
    setManualOpen(false);
    setCode('');
    setTimeout(() => handleScan(value), 350);
  };

  const testScan = () => {
    const next = soldTickets.find((t) => t.eventId === id && !t.scanned);
    if (!next) {
      haptic.error();
      toast('Every ticket for this event is already scanned', 'info');
      return;
    }
    handleScan(next.qrValue);
  };

  const close = () => (router.canGoBack() ? router.back() : router.replace(`/organizer/event/${id}`));

  if (!permission?.granted) {
    return (
      <Screen edges={['top', 'bottom']}>
        <View style={styles.permHeader}>
          <IconButton name="close" onPress={close} accessibilityLabel="Close scanner" />
        </View>
        <View style={styles.permBody}>
          <View style={styles.permIcon}>
            <Icon name="scan-outline" size={34} color={colors.primary} />
          </View>
          <AppText variant="displaySm" center>
            Scan Ticket
          </AppText>
          <AppText center secondary style={styles.permText}>
            Nest needs camera access to read attendee QR codes at the door.
          </AppText>
          <Button
            title="Grant permission"
            onPress={async () => {
              const res = await requestPermission();
              if (!res.granted) toast('Camera permission is required to scan tickets', 'error');
            }}
            style={styles.permCta}
          />
          <Button title="Test scan" variant="surface" onPress={testScan} />
        </View>
        <HolderTicketsSheet visible={!!holder} onClose={closeResult} holderName={holder?.name ?? ''} holderAvatar={holder?.avatar} tickets={holderTickets} />
      </Screen>
    );
  }

  return (
    <View style={styles.root}>
      {isFocused ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={holder || manualOpen ? undefined : (r) => handleScan(r.data)}
        />
      ) : null}

      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <IconButton name="close" backgroundColor={GLASS} borderColor={GLASS_BORDER} onPress={close} accessibilityLabel="Close scanner" />
        <AppText variant="h3" center style={styles.title}>
          Scan Ticket
        </AppText>
        <IconButton
          name={torch ? 'flash' : 'flash-off-outline'}
          color={torch ? colors.primary : colors.white}
          backgroundColor={GLASS}
          borderColor={GLASS_BORDER}
          onPress={() => setTorch((v) => !v)}
          accessibilityLabel={torch ? 'Turn torch off' : 'Turn torch on'}
        />
      </View>

      <View style={styles.center} pointerEvents="none">
        <View style={styles.frame}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
        <AppText variant="label" center style={styles.caption}>
          Align the QR code within the frame
        </AppText>
      </View>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <Pressable onPress={() => setManualOpen(true)} hitSlop={8} style={styles.manual}>
          <Icon name="keypad-outline" size={16} color={colors.white} />
          <AppText variant="label">Enter code manually</AppText>
        </Pressable>
        <Button title="Test scan" variant="surface" size="sm" fullWidth={false} onPress={testScan} style={styles.test} />
      </View>

      <BottomSheet visible={manualOpen} onClose={() => setManualOpen(false)} title="Enter ticket code">
        <Input
          placeholder="NEST|tk_h1|…  or ticket id"
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={checkManual}
        />
        <Button title="Check ticket" variant="white" onPress={checkManual} />
      </BottomSheet>

      <HolderTicketsSheet visible={!!holder} onClose={closeResult} holderName={holder?.name ?? ''} holderAvatar={holder?.avatar} tickets={holderTickets} />
    </View>
  );
}

export default ScanTicketScreen;

const CORNER = 34;
const THICK = 4;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  title: { flex: 1 },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 20 },
  frame: { width: FRAME, height: FRAME },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: colors.primary },
  tl: { top: 0, left: 0, borderTopWidth: THICK, borderLeftWidth: THICK, borderTopLeftRadius: radius.md },
  tr: { top: 0, right: 0, borderTopWidth: THICK, borderRightWidth: THICK, borderTopRightRadius: radius.md },
  bl: { bottom: 0, left: 0, borderBottomWidth: THICK, borderLeftWidth: THICK, borderBottomLeftRadius: radius.md },
  br: { bottom: 0, right: 0, borderBottomWidth: THICK, borderRightWidth: THICK, borderBottomRightRadius: radius.md },
  caption: { backgroundColor: GLASS, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, overflow: 'hidden' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', gap: 14, paddingHorizontal: layout.screenPadding },
  manual: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    paddingHorizontal: 18,
    height: 46,
    borderRadius: radius.pill,
  },
  test: { opacity: 0.85 },
  permHeader: { height: layout.headerHeight, justifyContent: 'center' },
  permBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 12 },
  permIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  permText: { maxWidth: 280, marginBottom: 10 },
  permCta: { marginBottom: 2 },
});
