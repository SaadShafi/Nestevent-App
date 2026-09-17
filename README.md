# Nest Event

Event discovery, ticketing and social app built with Expo SDK 57 + expo-router. Two roles ship in one binary:

- **Guest** — browse/search events, buy tickets (cart → checkout → QR ticket), social feed, messages, profile.
- **Organizer** — organizations & team, multi-step Create Event wizard (flyer/AI flyer, visibility, ticket types, guest list, boost, review), My Events, orders, refunds, QR ticket scanning, complimentary tickets, analytics (charts), Marketing Hub (promo codes, tracking links, SMS blasts, boosts), wallet.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for folder conventions, the UI kit and the stores.

## Run

```bash
npm install
npx expo start          # Expo Go or a dev client
npm run ios             # iOS simulator
npm run android         # Android emulator
```

Maps: iOS uses Apple Maps out of the box. Android needs a Google Maps key — replace `YOUR_ANDROID_GOOGLE_MAPS_API_KEY` in `app.json` (both `android.config.googleMaps.apiKey` and the `react-native-maps` plugin) before building a dev client / release.

Native modules used (all Expo-managed): camera (QR scan, capture), image picker, location, calendar, contacts, notifications, media library, sharing, haptics, blur, clipboard, maps, SVG (charts + QR codes).

## Type-check

```bash
npx tsc --noEmit
```

## Demo data

All data is local mock state persisted with AsyncStorage (zustand). Promo codes `NEST10` and `EARLY25` work at checkout. Sign in with any email/password.
