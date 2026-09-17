import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { ME } from '@/data/mock';
import type { Role, User } from '@/data/types';
import { zustandStorage } from '@/lib/storage';

type Permissions = { contacts: boolean; bluetooth: boolean; notifications: boolean; location: boolean };

type AuthState = {
  hasSeenWalkthrough: boolean;
  role: Role | null;
  isAuthenticated: boolean;
  /** Onboarding steps completed after sign-up */
  interestsDone: boolean;
  profileDone: boolean;
  user: User;
  permissions: Permissions;
  pendingEmail: string | null;
  /** organizer role has an organization set up */
  organizationDone: boolean;
  pushEnabled: boolean;
  locationLabel: string;
  coords: { latitude: number; longitude: number } | null;
  /** "Browse Event" from onboarding — guest tabs without an account. */
  browseMode: boolean;

  setWalkthroughSeen: () => void;
  setBrowseMode: (v: boolean) => void;
  setRole: (role: Role) => void;
  signIn: (email: string) => void;
  signUp: (data: Partial<User> & { email: string }) => void;
  socialSignIn: (provider: 'google' | 'apple') => void;
  completeInterests: (interests: string[]) => void;
  completeProfile: (data: Partial<User>) => void;
  setPermissions: (p: Partial<Permissions>) => void;
  updateUser: (data: Partial<User>) => void;
  setOrganizationDone: (v: boolean) => void;
  setPushEnabled: (v: boolean) => void;
  setLocation: (label: string, coords: { latitude: number; longitude: number } | null) => void;
  becomeOrganizer: () => void;
  signOut: () => void;
  deleteAccount: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hasSeenWalkthrough: false,
      role: null,
      isAuthenticated: false,
      interestsDone: false,
      profileDone: false,
      user: ME,
      permissions: { contacts: false, bluetooth: false, notifications: false, location: false },
      pendingEmail: null,
      organizationDone: false,
      pushEnabled: true,
      locationLabel: 'Indio, California, USA',
      coords: null,
      browseMode: false,

      setWalkthroughSeen: () => set({ hasSeenWalkthrough: true }),
      setBrowseMode: (v) => set({ browseMode: v, role: v ? 'guest' : null }),
      setRole: (role) => set((s) => ({ role, user: { ...s.user, role } })),
      signIn: (email) =>
        set((s) => ({ isAuthenticated: true, browseMode: false, interestsDone: true, profileDone: true, user: { ...s.user, email } })),
      signUp: (data) => set((s) => ({ pendingEmail: data.email, user: { ...s.user, ...data } })),
      socialSignIn: () => set({ isAuthenticated: true, browseMode: false, interestsDone: true, profileDone: true }),
      completeInterests: (interests) => set((s) => ({ interestsDone: true, user: { ...s.user, interests } })),
      completeProfile: (data) => set((s) => ({ profileDone: true, isAuthenticated: true, user: { ...s.user, ...data } })),
      setPermissions: (p) => set((s) => ({ permissions: { ...s.permissions, ...p } })),
      updateUser: (data) => set((s) => ({ user: { ...s.user, ...data } })),
      setOrganizationDone: (v) => set({ organizationDone: v }),
      setPushEnabled: (v) => set({ pushEnabled: v }),
      setLocation: (label, coords) => set({ locationLabel: label, coords }),
      becomeOrganizer: () => set((s) => ({ role: 'organizer', user: { ...s.user, role: 'organizer' } })),
      signOut: () =>
        set({ isAuthenticated: false, browseMode: false, role: null, interestsDone: false, profileDone: false, pendingEmail: null }),
      deleteAccount: () =>
        set({
          isAuthenticated: false,
          role: null,
          interestsDone: false,
          profileDone: false,
          organizationDone: false,
          user: ME,
          pendingEmail: null,
        }),
    }),
    { name: 'nest.auth', storage: zustandStorage },
  ),
);
