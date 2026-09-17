import { create } from 'zustand';

export type CreatePostMode = 'post' | 'verified';

export type CreatePostDraft = {
  media: string[];
  caption: string;
  location: string;
  isPublic: boolean;
  eventId: string | null;
  mode: CreatePostMode;
};

type CreatePostState = CreatePostDraft & {
  set: (patch: Partial<CreatePostDraft>) => void;
  addMedia: (uris: string[]) => void;
  removeMedia: (uri: string) => void;
  reset: (patch?: Partial<CreatePostDraft>) => void;
};

const EMPTY: CreatePostDraft = {
  media: [],
  caption: '',
  location: '',
  isPublic: true,
  eventId: null,
  mode: 'post',
};

/** In-memory (not persisted) draft shared by the Create Post flow screens. */
export const useCreatePostStore = create<CreatePostState>()((set) => ({
  ...EMPTY,
  set: (patch) => set(patch),
  addMedia: (uris) => set((s) => ({ media: [...s.media, ...uris.filter((u) => !s.media.includes(u))] })),
  removeMedia: (uri) => set((s) => ({ media: s.media.filter((m) => m !== uri) })),
  reset: (patch) => set({ ...EMPTY, ...patch }),
}));
