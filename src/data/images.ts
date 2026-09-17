/**
 * Remote placeholder imagery used by mock data. Replace with CDN assets when the backend lands.
 */
const u = (id: string, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMG = {
  // Hero / onboarding
  onboardingHero: u('photo-1470229722913-7c0e2dbbafd3'),
  walkthrough1: u('photo-1459749411175-04bf5292ceea'),
  walkthrough2: u('photo-1514525253161-7a46d19cd819'),
  walkthrough3: u('photo-1529156069898-49953e39b3ac'),

  // Event covers / flyers
  flyerSunset: u('photo-1533174072545-7a4b6ad7a6c3'),
  flyerNight: u('photo-1492684223066-81342ee5ff30'),
  flyerUrban: u('photo-1470225620780-dba8ba36b745'),
  flyerFestival: u('photo-1506157786151-b8491531f063'),
  flyerHula: u('photo-1519681393784-d120267933ba'),
  flyerJazz: u('photo-1415201364774-f6f0bb35f28f'),
  flyerRooftop: u('photo-1519671482749-fd06be2e6e4e'),
  flyerFood: u('photo-1555939594-58d7cb561ad1'),

  // Organizer covers
  orgTulips: u('photo-1490750967868-88aa4486c946'),
  orgCrowdRed: u('photo-1501386761578-eac5c94b800a'),
  orgConcert: u('photo-1540039155733-5bb30b53aa14'),
  orgClub: u('photo-1516450360452-9312f5e86fc7'),

  // Profile covers
  coverVan: u('photo-1527786356703-4b100091cd2c'),
  coverMilkyWay: u('photo-1444927714506-8492d94b4e3d'),
  coverStage: u('photo-1501281668745-f7f57925c3b4'),

  // Post grid
  grid: [
    u('photo-1500530855697-b586d89ba3ee', 500),
    u('photo-1469474968028-56623f02e42e', 500),
    u('photo-1518837695005-2083093ee35b', 500),
    u('photo-1504674900247-0877df9cc836', 500),
    u('photo-1477959858617-67f85cf4f1df', 500),
    u('photo-1501594907352-04cda38ebc29', 500),
    u('photo-1441974231531-c6227db76b6e', 500),
    u('photo-1490730141103-6cac27aaab94', 500),
    u('photo-1503803548695-c2a7b4a5b875', 500),
  ],
  gallery: [
    u('photo-1509042239860-f550ce710b93', 500),
    u('photo-1519741497674-611481863552', 500),
    u('photo-1611162617213-7d7a39e9b1d7', 500),
    u('photo-1524368535928-5b5e00ddc76b', 500),
    u('photo-1534438327276-14e5300c3a48', 500),
    u('photo-1483985988355-763728e1935b', 500),
    u('photo-1529139574466-a303027c1d8b', 500),
    u('photo-1546778316-dfda79f1c84e', 500),
    u('photo-1517836357463-d25dfeac3438', 500),
  ],

  // Social feed
  feedDj: u('photo-1470225620780-dba8ba36b745', 1000),
  feedWoman: u('photo-1516450360452-9312f5e86fc7', 1000),
  feedDinner: u('photo-1414235077428-338989a2e8c0', 1000),
  feedFriends: u('photo-1529156069898-49953e39b3ac', 1000),

  supportIllustration: u('photo-1553877522-43269d4ea984', 600),
} as const;

export const avatar = (n: number) => `https://i.pravatar.cc/150?img=${((n - 1) % 70) + 1}`;

export const LOGO = {
  cuslerSole: u('photo-1611162616305-c69b3fa7fbe0', 200),
  studio330: u('photo-1614680376593-902f74cf0d41', 200),
  pickleFactory: u('photo-1618005182384-a83a8bd57fbe', 200),
  eonMalone: u('photo-1620641788421-7a1c342ea42e', 200),
  xoyo: u('photo-1557683316-973673baf926', 200),
  nightBloom: u('photo-1550745165-9bc0b252726f', 200),
  timeless: u('photo-1579546929518-9e396f3cc809', 200),
};
