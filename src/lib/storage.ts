import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** Shared zustand persist storage backed by AsyncStorage. */
export const zustandStorage = createJSONStorage(() => AsyncStorage);
