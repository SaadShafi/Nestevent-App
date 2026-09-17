import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventMap } from '@/components/EventMap';
import { AttendeesSheet } from '@/components/AttendeesSheet';
import { AppText, AvatarStack, Button, EmptyState, Header, Icon, IconButton, Screen, useToast } from '@/components/ui';
import { useEvent, useOrganization } from '@/hooks/useEvent';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { formatCurrency, formatDateRange, formatTime } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useCartStore, useTicketsStore } from '@/store';
import { colors, layout, radius } from '@/theme';

import { InfoRow } from '../components/InfoRow';
import { OrganizerRow } from '../components/OrganizerRow';
import { addEventToCalendar, shareEvent } from '../utils';

const HERO_H = 420;
const GLASS = 'rgba(0,0,0,0.45)';

export function EventDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const requireAuth = useRequireAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useEvent(id);
  const org = useOrganization(event?.organizationId);
  const hasTicket = useTicketsStore((s) => s.myTickets.some((t) => t.eventId === id));
  const setCartEvent = useCartStore((s) => s.setEvent);

  const [expanded, setExpanded] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [rsvped, setRsvped] = useState(false);
  const [attendeesOpen, setAttendeesOpen] = useState(false);

  const lowestPrice = useMemo(() => {
    if (!event) return 0;
    const prices = event.ticketTypes.filter((t) => t.enabled).map((t) => t.price);
    return prices.length ? Math.min(...prices) : event.priceFrom;
  }, [event]);

  if (!event) {
    return (
      <Screen>
        <Header title="Ticket Details" />
        <EmptyState icon="alert-circle-outline" title="Event not found" message="This event may have been removed." />
      </Screen>
    );
  }

  const onShare = () => shareEvent(event);

  const onCalendar = async () => {
    const res = await addEventToCalendar(event);
    if (res.ok) {
      haptic.success();
      toast('Added to your calendar', 'success');
    } else {
      haptic.error();
      toast(res.reason, 'error');
    }
  };

  const onBuy = () =>
    requireAuth(() => {
      haptic.medium();
      if (event.attendance === 'rsvp') {
        setRsvped(true);
        haptic.success();
        toast('RSVP confirmed', 'success');
        return;
      }
      setCartEvent(event.id);
      router.push(`/event/${event.id}/cart`);
    });

  const isRsvp = event.attendance === 'rsvp';

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <View style={styles.hero}>
          <Image source={{ uri: event.cover }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={22} transition={200} />
          <View style={[StyleSheet.absoluteFill, styles.scrim]} />
          <LinearGradient colors={['rgba(0,0,0,0.55)', 'transparent']} style={styles.topGrad} />
          <View style={styles.flyerWrap}>
            <Image source={{ uri: event.cover }} style={styles.flyer} contentFit="cover" transition={200} />
          </View>
          <LinearGradient colors={['transparent', colors.bg]} style={styles.bottomGrad} />
        </View>

        <View style={styles.sheet}>
          <AppText variant="caption" secondary>
            {event.category === 'Music' ? 'Music Fest' : event.category}
          </AppText>
          <AppText variant="h1" style={styles.title}>
            {event.title}
          </AppText>
          {event.subtitle ? (
            <AppText secondary numberOfLines={1}>
              {event.subtitle}
            </AppText>
          ) : null}

          {org ? (
            <View style={styles.block}>
              <OrganizerRow org={org} />
            </View>
          ) : null}

          <InfoRow icon="calendar-outline" title={formatDateRange(event.startDate, event.endDate)} subtitle={formatTime(event.startDate)} />
          <InfoRow icon="location-outline" title={event.venueName} />

          <AppText variant="h3" style={styles.sectionTitle}>
            Description
          </AppText>
          <AppText secondary numberOfLines={expanded ? undefined : 3} style={styles.description}>
            {event.description}
          </AppText>
          <Pressable
            onPress={() => {
              haptic.selection();
              setExpanded((v) => !v);
            }}
            hitSlop={8}>
            <AppText variant="label" color={colors.primary}>
              {expanded ? 'Read Less' : 'Read More..'}
            </AppText>
          </Pressable>

          <AppText variant="h3" style={styles.sectionTitle}>
            Attendees
          </AppText>
          <Pressable
            onPress={() => {
              haptic.light();
              setAttendeesOpen(true);
            }}
            style={styles.attendees}
            accessibilityRole="button"
            accessibilityLabel="View attendees">
            <AvatarStack uris={event.attendeeAvatars} size={34} />
            <AppText variant="label" secondary>
              {event.attendees} + Guests
            </AppText>
            <Icon name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>

          <AppText variant="h3" style={styles.sectionTitle}>
            Location
          </AppText>
          <View style={styles.addressRow}>
            <Icon name="location" size={18} color={colors.primary} />
            <AppText variant="label" style={styles.address} numberOfLines={2}>
              {event.address}
            </AppText>
            <IconButton
              name={showMap ? 'close' : 'map-outline'}
              size={24}
              iconSize={14}
              backgroundColor={colors.primary}
              onPress={() => {
                haptic.selection();
                setShowMap((v) => !v);
              }}
              accessibilityLabel={showMap ? 'Hide map' : 'Show map'}
            />
          </View>
          {showMap ? (
            <EventMap coords={event.coords} title={event.venueName} address={event.address} height={150} style={styles.map} />
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.header, { top: insets.top }]}>
        <Header
          overlay
          title="Ticket Details"
          right={
            <>
              <IconButton name="share-social-outline" backgroundColor={GLASS} onPress={onShare} accessibilityLabel="Share" />
              <IconButton name="calendar-outline" backgroundColor={GLASS} onPress={onCalendar} accessibilityLabel="Add to calendar" />
            </>
          }
        />
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {hasTicket ? (
          <Button title="Ticket Order" variant="white" onPress={() => router.push(`/event/${event.id}/ticket-order`)} />
        ) : (
          <View style={styles.footerRow}>
            <View style={styles.flex}>
              <AppText variant="caption" secondary>
                Price
              </AppText>
              <View style={styles.priceRow}>
                <AppText variant="h1">{isRsvp ? 'Free' : formatCurrency(lowestPrice, { decimals: 2 }).replace('$', '$ ')}</AppText>
                <AppText variant="caption" secondary>
                  /Ticket
                </AppText>
              </View>
            </View>
            <Button
              title={isRsvp ? (rsvped ? 'RSVP Confirmed' : 'RSVP') : 'Buy Ticket'}
              fullWidth={false}
              disabled={rsvped}
              onPress={onBuy}
              style={styles.cta}
            />
          </View>
        )}
      </View>
      <AttendeesSheet event={event} visible={attendeesOpen} onClose={() => setAttendeesOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  hero: { height: HERO_H, backgroundColor: colors.surface, overflow: 'hidden' },
  scrim: { backgroundColor: 'rgba(0,0,0,0.35)' },
  topGrad: { position: 'absolute', top: 0, left: 0, right: 0, height: 140 },
  flyerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 70, paddingBottom: 30 },
  flyer: { width: '60%', aspectRatio: 0.72, borderRadius: radius.md, backgroundColor: colors.surfaceHigh },
  bottomGrad: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 },
  sheet: {
    marginTop: -36,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 24,
  },
  title: { marginTop: 4 },
  block: { marginTop: 12, marginBottom: 4 },
  sectionTitle: { marginTop: 20, marginBottom: 8 },
  description: { lineHeight: 22 },
  attendees: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  address: { flex: 1 },
  map: { marginBottom: 8 },
  header: { position: 'absolute', left: layout.screenPadding, right: layout.screenPadding },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 12,
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  cta: { paddingHorizontal: 36 },
});
