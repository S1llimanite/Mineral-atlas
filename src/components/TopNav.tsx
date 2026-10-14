'use client';

import Link from 'next/link';
import { CommandPalette } from '@/components/CommandPalette';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useWorkspace } from '@/lib/workspaceStore';

/**
 * 顶部导航 v0.4
 * 浅色 Mineral Gallery Light 风格：白底半透明毛玻璃，深色版本下保持原貌
 */
export function TopNav() {
  const favorites = useWorkspace((s) => s.favorites);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 border-b border-hair backdrop-blur-md"
      style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)', height: 64 }}
    >
      <div className="h-full px-5 sm:px-7 flex items-center gap-5">
        {/* Logo（深色版本，浅色背景下显示清晰） */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <span
            className="w-8 h-8 grid place-items-center rounded-lg font-mono font-bold text-[10px] tracking-wider transition-all duration-300 ease-crystal"
            style={{
              background: 'var(--primary)',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px color-mix(in srgb, var(--primary) 28%, transparent)',
            }}
          >
            PMA
          </span>
          <div className="leading-none hidden sm:block">
            <div className="text-[14px] font-serif font-semibold text-ink-bright tracking-wide">薄片矿物数字图鉴</div>
            <div className="text-[9px] font-mono text-ink-faint tracking-[0.16em] mt-0.5">PETROGRAPHIC MINERAL ATLAS</div>
          </div>
        </Link>

        {/* 命令面板触发器 */}
        <div className="flex-1 flex justify-center px-2">
          <CommandPalette />
        </div>

        {/* 右侧导航 */}
        <nav className="flex items-center gap-1 text-[13px] shrink-0">
          <Link href="/identify" className="px-3 py-1.5 rounded-md text-ink-mid hover:text-primary hover:bg-slate8 transition-all duration-300 ease-crystal">
            鉴定工作台
          </Link>
          <Link href="/compare" className="px-3 py-1.5 rounded-md text-ink-mid hover:text-primary hover:bg-slate8 transition-all duration-300 ease-crystal">
            比较
          </Link>
          <Link
            href="/favorites"
            className="px-3 py-1.5 rounded-md text-ink-mid hover:text-primary hover:bg-slate8 transition-all duration-300 ease-crystal relative"
            aria-label="收藏"
          >
            <span className="text-[15px]">★</span>
            {favorites.length > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 grid place-items-center text-[9px] font-mono rounded-full"
                style={{ background: 'var(--accent)', color: '#FFFFFF' }}
              >
                {favorites.length}
              </span>
            )}
          </Link>
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
}