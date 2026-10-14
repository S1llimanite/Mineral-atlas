'use client';

import { useEffect } from 'react';
import { useWorkspace } from '@/lib/workspaceStore';

/**
 * 工作区状态水合器
 *
 * workspaceStore 使用 persist + skipHydration，避免服务端渲染与客户端
 * 首次渲染不一致导致的 hydration 崩溃。此组件在客户端挂载后手动
 * 从 localStorage 恢复状态。放在根布局中，全局仅渲染一次。
 */
export function StoreHydrator() {
  useEffect(() => {
    void useWorkspace.persist.rehydrate();
  }, []);
  return null;
}