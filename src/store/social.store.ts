import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { COMMENTS, POSTS, USERS } from '@/data/mock';
import type { Comment, Post } from '@/data/types';
import { uid } from '@/lib/format';
import { zustandStorage } from '@/lib/storage';

export type ReportReason = 'Nudity' | 'Offensive Language' | 'Someone Else' | 'Other';

type SocialState = {
  posts: Post[];
  comments: Comment[];
  following: string[]; // user ids I follow
  followers: string[];
  followRequests: string[];
  reports: { id: string; postId: string; reason: ReportReason; comment: string; at: string }[];

  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  share: (postId: string) => void;
  addPost: (p: Omit<Post, 'id' | 'likes' | 'comments' | 'shares' | 'saves' | 'createdAt'>) => Post;
  addComment: (postId: string, text: string, parentId?: string) => void;
  toggleCommentLike: (commentId: string) => void;
  toggleFollow: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  removeFollower: (userId: string) => void;
  acceptRequest: (userId: string) => void;
  declineRequest: (userId: string) => void;
  report: (postId: string, reason: ReportReason, comment: string) => void;
};

const initialFollowers = USERS.filter((u) => u.id.startsWith('u_f')).map((u) => u.id);

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      posts: POSTS,
      comments: COMMENTS,
      following: ['u_kesha', 'u_f0', 'u_f1', 'u_f2'],
      followers: initialFollowers,
      followRequests: ['u_f3', 'u_f4', 'u_f5', 'u_f6', 'u_talan', 'u_robert'],
      reports: [],

      toggleLike: (postId) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === postId ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) } : p,
          ),
        })),
      toggleSave: (postId) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === postId ? { ...p, savedByMe: !p.savedByMe, saves: p.saves + (p.savedByMe ? -1 : 1) } : p,
          ),
        })),
      share: (postId) => set((s) => ({ posts: s.posts.map((p) => (p.id === postId ? { ...p, shares: p.shares + 1 } : p)) })),
      addPost: (p) => {
        const post: Post = { ...p, id: uid('p'), likes: 0, comments: 0, shares: 0, saves: 0, createdAt: new Date().toISOString() };
        set((s) => ({ posts: [post, ...s.posts] }));
        return post;
      },
      addComment: (postId, text, parentId) => {
        const c: Comment = { id: uid('c'), postId, authorId: 'me', text, likes: 0, createdAt: new Date().toISOString() };
        set((s) => ({
          comments: parentId
            ? s.comments.map((x) => (x.id === parentId ? { ...x, replies: [...(x.replies ?? []), c] } : x))
            : [c, ...s.comments],
          posts: s.posts.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)),
        }));
      },
      toggleCommentLike: (commentId) =>
        set((s) => ({
          comments: s.comments.map((c) =>
            c.id === commentId ? { ...c, likedByMe: !c.likedByMe, likes: c.likes + (c.likedByMe ? -1 : 1) } : c,
          ),
        })),
      toggleFollow: (userId) =>
        set((s) => ({
          following: s.following.includes(userId) ? s.following.filter((f) => f !== userId) : [...s.following, userId],
        })),
      isFollowing: (userId) => get().following.includes(userId),
      removeFollower: (userId) => set((s) => ({ followers: s.followers.filter((f) => f !== userId) })),
      acceptRequest: (userId) =>
        set((s) => ({ followRequests: s.followRequests.filter((f) => f !== userId), followers: [userId, ...s.followers] })),
      declineRequest: (userId) => set((s) => ({ followRequests: s.followRequests.filter((f) => f !== userId) })),
      report: (postId, reason, comment) =>
        set((s) => ({ reports: [...s.reports, { id: uid('r'), postId, reason, comment, at: new Date().toISOString() }] })),
    }),
    { name: 'nest.social', storage: zustandStorage },
  ),
);
