import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventMap } from '@/components/EventMap';
import { AppText, AvatarStack, Header, Icon, IconButton, Toggle } from '@/components/ui';
import type { EventItem, Organization, TicketType } from '@/data/types';
import { InfoRow } from '@/features/events/components/InfoRow';
import { formatCompact, formatDateRange, formatTime } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { colors, layout, radius } from '@/theme';

import { TicketTypeCard } from '../../shared/TicketTypeCard';
import { GUEST_AVATARS } from '../../shared/utils';

const HERO_H = 420;
export const GLASS = 'rgba(0,0,0,0.45)';

type Props = {
  event: EventItem;
  org?: Organization;
  headerTitle: string;
  headerRight?: ReactNode;
  footer: ReactNode;
  onToggleAttendees: (v: boolean) => void;
  onEditTicket: (tt: TicketType) => void;
  /** Extra sections rendered under the ticket types (organizer action rows). */
  children?: ReactNode;
};

/**
 * Organizer-side event page (Review Event / View Event). Mirrors the guest Event Details layout:
 * blurred flyer hero, overlay header, details sheet with attendees toggle, map and ticket types.
 */
export function EventOverview({ event, org, headerTitle, headerRight, footer, onToggleAttendees, onEditTicket, children }: Props) {
  const insets = useSafeAreaInsets();
  const [showMap, setShowMap] = useState(true);
  const avatars = event.attendeeAvatars.length ? event.attendeeAvatars : GUEST_AVATARS;
  const guests = event.attendees || 50;

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
            <View style={styles.orgRow}>
              <Image source={{ uri: org.logo }} style={styles.logo} contentFit="cover" />
              <View style={styles.flex}>
                <AppText variant="title">{org.name}</AppText>
                <View style={styles.rating}>
                  <Icon name="star" size={13} color={colors.primary} />
                  <AppText variant="captionMedium" color={colors.primary}>
                    {org.rating.toFixed(1)}
                  </AppText>
                  <AppText variant="caption" secondary>
                    ({formatCompact(org.ratingCount)}+)
                  </AppText>
                </View>
              </View>
            </View>
          ) : null}

          <InfoRow icon="calendar-outline" title={formatDateRange(event.startDate, event.endDate)} subtitle={formatTime(event.startDate)} />
          <InfoRow icon="location-outline" title={event.venueName || 'Venue to be announced'} />

          <AppText variant="h3" style={styles.sectionTitle}>
            Event Details
          </AppText>
          <AppText secondary style={styles.description}>
            {event.description || 'No description yet.'}
          </AppText>

          <AppText variant="h3" style={styles.sectionTitle}>
            Attendees
          </AppText>
          <View style={styles.attendees}>
            <AvatarStack uris={avatars} size={34} />
            <AppText variant="label" secondary>
              {guests} + Guests
            </AppText>
          </View>
          <View style={styles.toggleRow}>
            <AppText variant="bodyMedium" style={styles.flex}>
              Show Attendees List to Public
            </AppText>
            <Toggle
              value={event.showAttendeesPublic}
              onValueChange={(v) => {
                haptic.selection();
                onToggleAttendees(v);
              }}
            />
          </View>

          <AppText variant="h3" style={styles.sectionTitle}>
            Location
          </AppText>
          <View style={styles.addressRow}>
            <Icon name="location" size={18} color={colors.primary} />
            <AppText variant="label" style={styles.flex} numberOfLines={2}>
              {event.address || 'Add a location'}
            </AppText>
            <IconButton
              name="close"
              size={24}
              iconSize={14}
              backgroundColor={colors.primary}
              onPress={() => setShowMap((v) => !v)}
              accessibilityLabel={showMap ? 'Hide map' : 'Show map'}
            />
          </View>
          {showMap ? <EventMap coords={event.coords} title={event.venueName} address={event.address} height={150} style={styles.map} /> : null}

          {event.ticketTypes.length ? (
            <>
              <AppText variant="h3" style={styles.sectionTitle}>
                Choose Ticket Type
              </AppText>
              {event.ticketTypes.map((tt) => (
                <TicketTypeCard key={tt.id} ticket={tt} editLink={() => onEditTicket(tt)} />
              ))}
            </>
          ) : null}

          {children}
        </View>
      </ScrollView>

      <View style={[styles.header, { top: insets.top }]}>
        <Header overlay title={headerTitle} right={headerRight} />
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>{footer}</View>
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
  orgRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, marginTop: 12, marginBottom: 4 },
  logo: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceHigh },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  sectionTitle: { marginTop: 20, marginBottom: 8 },
  description: { lineHeight: 22 },
  attendees: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
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
});
