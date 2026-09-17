import { useRouter } from 'expo-router';

import { useAuthStore } from '@/store';

/**
 * In Browse Mode (no account) certain actions should bounce to login.
 * Returns a guard: `guard(() => doThing())` runs the callback only when authenticated.
 */
export function useRequireAuth() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return (fn: () => void) => {
    if (isAuthenticated) fn();
    else router.push('/(auth)/login');
  };
}
