# Nest Event — Architecture & Conventions

Expo SDK 57 · expo-router · React Native 0.86 · TypeScript strict · zustand · dark-only UI.

Two roles share one codebase: **Guest** (`(guest)` route group) and **Organizer** (`(organizer)` route group).
Screens common to both live at the root of `src/app` (event details, checkout, messages, settings…).

## Folder layout

```
src/
  app/                    # expo-router routes ONLY. Each file is a thin re-export of a feature screen.
    _layout.tsx           # fonts, providers, root Stack (modals declared here)
    index.tsx             # splash + auth-state redirect
    (auth)/               # onboarding + sign in/up flow
    (guest)/(tabs)/       # guest floating tab bar: home, search, create(+), social, tickets, profile
    (organizer)/(tabs)/   # organizer tab bar: home, search, events, social, tickets, profile
    event/[id]/…          # shared event screens (details, cart, checkout, ticket-order)
    organizer/…           # organizer-only stack screens
  features/<feature>/
    screens/              # one file per screen, default export + named export
    components/           # feature-local components
    hooks.ts / utils.ts   # optional
  components/ui/          # shared UI kit (import from '@/components/ui')
  components/             # shared composite components (EventCard, EventMap, PhotoPicker, …)
  components/charts/      # BarChart, LineChart, DonutChart (react-native-svg / pure views)
  components/navigation/  # FloatingTabBar, SideDrawer
  store/                  # zustand stores (persisted with AsyncStorage) — import from '@/store'
  data/                   # types.ts (domain types), mock.ts (seed data), images.ts (remote placeholders)
  lib/                    # format.ts, haptics.ts, location.ts, share.ts, validation.ts, storage.ts
  hooks/                  # useEvent/useOrganization/useMyEvents, useRequireAuth
  theme/                  # tokens: colors, spacing, radius, fonts, typography, layout
```

### Route file pattern

```tsx
// src/app/(guest)/(tabs)/home.tsx
export { HomeScreen as default } from '@/features/home/screens/HomeScreen';
```

Feature screens own all logic and layout. Route files never contain JSX beyond a re-export.

## UI kit (`@/components/ui`)

| Component | Purpose |
|---|---|
| `Screen` | page wrapper. props: `scroll`, `padded` (default true), `glow` (orange bottom glow), `withTabBar` (adds bottom space for the floating tab bar), `keyboard`, `footer` (fixed bottom CTA), `edges` (default `['top']`). |
| `Header` | `title`, `left: 'back' \| 'close' \| 'none' \| ReactNode`, `right`, `overlay` (over imagery). |
| `AppText` | `variant`: display, displaySm, h1, h2, h3, title, body, bodyMedium, label, caption, captionMedium, button. props `secondary`, `muted`, `center`, `color`. Display variants use the Syne font (Figma's bold display headings). |
| `Button` | `variant`: primary (orange), white, outline, outlinePrimary, ghost, surface, danger, success. `size` lg/md/sm, `loading`, `left`/`right` icons, `fullWidth` (default true). |
| `Input` | `label`, `labelHint`, `error`, `left`/`right`, `password` (eye toggle), `multiline` + `maxLength` (counter), `onPressField` (picker style), `outlined` (thin-border variant used by Marketing Hub forms). |
| `PhoneInput` | flag + dial code selector. |
| `Select` | dropdown → bottom sheet of options. |
| `DateTimeField` | `mode: 'date' \| 'time'`, platform-native pickers (iOS sheet spinner, Android dialog). |
| `Chip` | pill chip; `selected`, `removable`, `danger`. |
| `SegmentTabs` | `variant`: pill (dark pill), orange, underline, segment. `scrollable`. |
| `Toggle` | orange Switch. |
| `Avatar`, `AvatarStack` | |
| `Card` | dark rounded surface; `selected` → orange border; `onPress`. |
| `OptionCard` | selectable card with check (Select Role, Attendance Model); `compact` + `filled` for sheet rows. |
| `BottomSheet` | Modal-based sheet: `visible`, `onClose`, `title`, `scroll`. |
| `ConfirmDialog` | center card or `placement="bottom"` confirm (Delete Account / Logout). |
| `IconButton` | circular icon button (back, bell, share). |
| `Icon`, `FeatherIcon`, `MCIcon`, `MIcon`, `BrandIcon` | @expo/vector-icons wrappers. `Icon` = Ionicons. |
| `ListRow` | settings row with icon/subtitle/right/chevron/danger. |
| `SearchBar` | search field + optional filter button. |
| `StatCard` | value + label tile; `variant` solid/glass/outlined. |
| `Stepper` | − n + counter. |
| `SectionHeader` | title + "View all". |
| `Divider`, `EmptyState`, `NestLogo`, `useToast()` | |

Composite components (`@/components/...`):
- `EventCard` / `EventRow` — the big flyer card from Figma (`@/components/EventCard`).
- `EventMap` — react-native-maps preview with orange pin + directions button (`@/components/EventMap`).
- `GradientHeader` — orange→black header block for Home screens.
- `LocationPicker` — "Enter Location" with GPS crosshair (expo-location).
- `ProfilePhotoPicker`, `UploadDropzone`, `pickImages()` — expo-image-picker helpers (`@/components/PhotoPicker`).
- `SocialLinksEditor` — Instagram/X/YouTube/Snapchat URL rows with toggles.
- `SuccessScreen` — full-screen success state with logo.
- `SideDrawer` — hamburger drawer (`@/components/navigation/SideDrawer`).
- Charts: `BarChart`, `LineChart`, `DonutChart` from `@/components/charts`.

## Stores (`@/store`)

- `useAuthStore` — role, auth flags, user profile, permissions, browseMode, location. Actions: setRole, signIn, signUp, socialSignIn, completeInterests, completeProfile, setPermissions, updateUser, setOrganizationDone, becomeOrganizer, signOut, deleteAccount, setBrowseMode, setLocation.
- `useEventsStore` — events, organizations, favorites, followedOrgs, recentSearches, filters (+ organizer mutations upsertEvent/deleteEvent/setEventStatus/upsertTicketType/removeTicketType/upsertOrganization).
- `useCartStore` + `cartTotals()` + `PAYMENT_METHODS` — ticket cart, promo (NEST10 / EARLY25), delivery addresses, payment method.
- `useTicketsStore` — myTickets, orders, soldTickets; purchase(), scanTicket(qr), markScanned, sendComplimentary, requestRefund, resolveRefund.
- `useSocialStore` — posts, comments, following/followers/followRequests, likes/saves/report.
- `useChatStore` — conversations, messages (simulated replies), notifications.
- `useOrganizerStore` — team, promoCodes, trackingLinks, smsBlasts, boosts, bankAccounts, transactions, walletBalance, event `draft` (multi-step Create Event wizard: setDraft/resetDraft/loadDraftFromEvent).

Domain types: `@/data/types`. Seed data + helpers (`findUser`, `findOrganization`, `INTERESTS`, `CATEGORIES`, `FAQS`, `LEGAL_SECTIONS`): `@/data/mock`. Images: `IMG`, `avatar(n)` from `@/data/images`.

## Platform-specific rules

- Use `Platform.select` / `Platform.OS` for: keyboard avoiding behavior (`padding` iOS / `height` Android), haptics (see `@/lib/haptics`), blur (`expo-blur` iOS only, solid on Android), maps provider (Apple on iOS, Google on Android — already handled in `EventMap`), date pickers (already handled), share sheet (`@/lib/share`), tab bar offsets (`layout.tabBarBottomOffset`), status bar, `ToastAndroid` vs in-app toast (handled by `useToast`).
- Respect safe areas via `Screen` (top) and `useSafeAreaInsets()` for bottom CTAs. Screens inside tabs must pass `withTabBar` so content clears the floating bar.
- Never hard-code white backgrounds; the app is dark-only. Use `colors.*` tokens.
- Headings that are bold display type in Figma ("Choose Interests", "Browse Mode For You", "Add Ticket Type") use `variant="display"` / `"displaySm"`.

## Navigation

- Root Stack (`src/app/_layout.tsx`) already declares modal presentation for: `filter`, `create-post/index` (transparent), `create-post/camera` (fullScreen), `event/[id]/cart|checkout|ticket-order`, `delivery-address`, `organizer/event/[id]/scan`.
- Navigate with `useRouter()`: `router.push('/event/ev_sunset')`, `router.push({ pathname: '/user/[id]', params: { id } })`.
- Typed routes are OFF, so any string path is accepted — keep paths exactly as listed in the route map for your feature.

## Quality bar

- `npx tsc --noEmit` must pass for the files you own. Errors caused by *other* features' missing route/screen files are expected while work is parallel — do not create files owned by another feature.
- No new npm dependencies. Everything needed is installed (see package.json).
- Every button in the Figma must do something real: navigate, mutate a store, open a sheet, call a device API, or show a toast. No dead taps.
- Keep components small; extract feature components into `features/<feature>/components/`.

## Drawer + tab header

```tsx
import { useAppDrawer, TabHeader } from '@/components/navigation/AppDrawer';
const { openDrawer, drawer } = useAppDrawer();
<TabHeader onMenu={openDrawer} right={<IconButton name="search-outline" ... />} />
{drawer}
```
`useAppDrawer` renders the SideDrawer and the bottom "Logout" ConfirmDialog (signs out + replaces to `/`).

## Brand assets & Figma icons

- `NestLogo` renders the real logotype (`assets/images/nest-logo.png`); use `variant="white"` on orange gradient headers (Figma shows the white mark there).
- `FigmaIcon` (`@/components/icons/FigmaIcon`) renders the vuesax icons exported from the Figma file: `tabHome`, `tabSearch`, `tabPlus`, `tabSocial`, `tabTicket`, `tabProfile`, `tabCalendar`, `pin`, `dropdown`, `search`, `bell`, `plusCircle`, `message`. The floating tab bar and home headers use these; other screens may use Ionicons.
- `HomeHeaderBar` + `HeaderGlassButton` (`@/components/HomeHeaderBar`) build the Figma "Tab 2" header (white logo, location column, round glass buttons).
- `Screen` accepts `header={...}` for content that stays fixed above the scroll area (Home / Dashboard gradient headers).

## Sharing, sliding, attachments

- `shareContent({ title, message, url })` from `@/lib/share` opens the in-app `ShareSheetHost` (WhatsApp, Instagram, Facebook, X, Telegram, Snapchat, copy link, OS "More"). The host is mounted once in the root layout; `nativeShare()` is the OS-only fallback.
- `SlideToAction` — slide-to-continue control (Select Role "Get Started").
- `ListRow` has a fixed 56pt height so labels and toggles always sit on one line.
- Chat attachments: `Message.attachment` (`image | video | file`) rendered by `MessageBubble`; pick with `pickMediaAttachment` / `captureAttachment` / `pickDocumentAttachment` from `@/components/AttachmentPicker` (expo-image-picker + expo-document-picker).
