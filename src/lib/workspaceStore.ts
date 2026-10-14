'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 全局工作区状态：收藏 / 最近查看 / 鉴定工作台选矿 / 观察清单
 * persist 到 localStorage
 *
 * 关键：skipHydration = true
 * zustand persist 默认在模块加载时同步读取 localStorage，会导致服务端渲染的 HTML
 * 与客户端首次渲染不一致（hydration mismatch）→ React 抛弃服务端 HTML 整页重渲，
 * 在 Next.js 中表现为 "Application error: a client-side exception has occurred"。
 * 因此改为客户端挂载后由 <StoreHydrator /> 手动 rehydrate。
 */

interface WorkspaceState {
  favorites: string[];              // 收藏的矿物 ID
  recentViews: string[];            // 最近查看（最新在前，最多 20）
  benchIds: string[];               // 鉴定工作台矿物（最多 6）
  checkedFeatures: Record<string, string[]>;  // mineralId → 已勾选的鉴定特征文案

  toggleFavorite: (id: string) => void;
  pushRecent: (id: string) => void;
  setBench: (ids: string[]) => void;
  addToBench: (id: string) => void;
  removeFromBench: (id: string) => void;
  toggleFeature: (mineralId: string, feature: string) => void;
}

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      favorites: [],
      recentViews: [],
      benchIds: [],
      checkedFeatures: {},

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((x) => x !== id)
            : [...s.favorites, id],
        })),

      pushRecent: (id) =>
        set((s) => ({
          recentViews: [id, ...s.recentViews.filter((x) => x !== id)].slice(0, 20),
        })),

      setBench: (ids) => set({ benchIds: ids.slice(0, 6) }),

      addToBench: (id) =>
        set((s) => ({
          benchIds:
            s.benchIds.includes(id) || s.benchIds.length >= 6
              ? s.benchIds
              : [...s.benchIds, id],
        })),

      removeFromBench: (id) =>
        set((s) => ({ benchIds: s.benchIds.filter((x) => x !== id) })),

      toggleFeature: (mineralId, feature) =>
        set((s) => {
          const cur = s.checkedFeatures[mineralId] || [];
          const next = cur.includes(feature)
            ? cur.filter((x) => x !== feature)
            : [...cur, feature];
          return {
            checkedFeatures: { ...s.checkedFeatures, [mineralId]: next },
          };
        }),
    }),
    { name: 'pma-workspace', skipHydration: true }
  )
);