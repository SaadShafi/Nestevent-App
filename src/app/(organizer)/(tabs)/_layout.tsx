import { Tabs } from 'expo-router';

import { FloatingTabBar, type TabConfig } from '@/components/navigation/FloatingTabBar';
import { useAuthStore } from '@/store';

const TABS: TabConfig[] = [
  { name: 'home', label: 'Home', icon: 'tabHome' },
  { name: 'search', label: 'Search', icon: 'tabSearch' },
  { name: 'events', label: 'Events', icon: 'tabCalendar' },
  { name: 'social', label: 'Social', icon: 'tabSocial' },
  { name: 'tickets', label: 'Tickets', icon: 'tabTicket' },
  { name: 'profile', label: 'Profile', icon: 'tabProfile' },
];

export default function OrganizerTabs() {
  const firstName = useAuthStore((s) => s.user.firstName);
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#0B0B0B' } }}
      tabBar={(props) => <FloatingTabBar {...props} tabs={TABS} profileLabel={firstName} />}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="events" />
      <Tabs.Screen name="social" />
      <Tabs.Screen name="tickets" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
