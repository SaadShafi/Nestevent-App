import { Tabs, useRouter } from 'expo-router';

import { FloatingTabBar, type TabConfig } from '@/components/navigation/FloatingTabBar';
import { useAuthStore } from '@/store';

const TABS: TabConfig[] = [
  { name: 'home', label: 'Home', icon: 'tabHome' },
  { name: 'search', label: 'Search', icon: 'tabSearch' },
  { name: 'create', label: 'Create', icon: 'tabPlus', action: true },
  { name: 'social', label: 'Social', icon: 'tabSocial' },
  { name: 'tickets', label: 'Tickets', icon: 'tabTicket' },
  { name: 'profile', label: 'Profile', icon: 'tabProfile' },
];

export default function GuestTabs() {
  const router = useRouter();
  const firstName = useAuthStore((s) => s.user.firstName);
  const browseMode = useAuthStore((s) => s.browseMode);
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#0B0B0B' } }}
      tabBar={(props) => (
        <FloatingTabBar
          {...props}
          tabs={TABS}
          profileLabel={browseMode ? 'Profile' : firstName}
          onAction={() => router.push(browseMode ? '/(auth)/login' : '/create-post')}
        />
      )}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="create" options={{ href: null }} />
      <Tabs.Screen name="social" />
      <Tabs.Screen name="tickets" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
