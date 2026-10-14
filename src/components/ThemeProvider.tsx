'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 主题系统 v0.4
 * - 页面级主题：根据路由自动设置（详情/工作台/比较/首页/目录）
 * - 全局主题：用户手动选择（light 浅色默认 / dark 深地晶体 / contrast 高对比）
 * 两者叠加，全局主题覆盖同名变量，页面主题提供局部氛围
 *
 * 注意：v0.4 浅色 Mineral Gallery Light 为默认；深色作为 alternate 主题保留。
 */

export type GlobalTheme = 'light' | 'dark' | 'contrast';

interface ThemeContextValue {
  globalTheme: GlobalTheme;
  setGlobalTheme: (t: GlobalTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  globalTheme: 'light',
  setGlobalTheme: () => {},
});

const THEME_KEY = 'pma-global-theme';

function pageThemeOf(pathname: string): string {
  if (pathname.startsWith('/minerals/')) return 'focus';
  if (pathname.startsWith('/identify')) return 'lab';
  if (pathname.startsWith('/compare') || pathname.startsWith('/favorites')) return 'neutral';
  return 'neutral';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [globalTheme, setTheme] = useState<GlobalTheme>('light');

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as GlobalTheme | null;
    if (saved === 'light' || saved === 'dark' || saved === 'contrast') {
      setTheme(saved);
      document.documentElement.dataset.theme = saved;
    } else {
      document.documentElement.dataset.theme = 'light';
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.page = pageThemeOf(pathname);
  }, [pathname]);

  const setGlobalTheme = useCallback((t: GlobalTheme) => {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    localStorage.setItem(THEME_KEY, t);
  }, []);

  return (
    <ThemeContext.Provider value={{ globalTheme, setGlobalTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}