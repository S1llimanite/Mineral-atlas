'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/** 左侧可折叠侧边栏 v0.4 浅色版 */
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const groups: Array<{ title: string; items: Array<{ label: string; href: string }> }> = [
    {
      title: '按矿物大类',
      items: [
        { label: '硅酸盐', href: '/minerals?class=' + encodeURIComponent('硅酸盐') },
        { label: '氧化物与氢氧化物', href: '/minerals?class=' + encodeURIComponent('氧化物与氢氧化物') },
        { label: '碳酸盐', href: '/minerals?class=' + encodeURIComponent('碳酸盐') },
        { label: '硫化物', href: '/minerals?class=' + encodeURIComponent('硫化物') },
        { label: '卤化物', href: '/minerals?class=' + encodeURIComponent('卤化物') },
        { label: '硫酸盐', href: '/minerals?class=' + encodeURIComponent('硫酸盐') },
        { label: '磷酸盐', href: '/minerals?class=' + encodeURIComponent('磷酸盐') },
        { label: '自然元素', href: '/minerals?class=' + encodeURIComponent('自然元素') },
      ],
    },
    {
      title: '按晶系',
      items: [
        { label: '等轴', href: '/minerals?system=' + encodeURIComponent('等轴晶系') },
        { label: '四方', href: '/minerals?system=' + encodeURIComponent('四方晶系') },
        { label: '三方', href: '/minerals?system=' + encodeURIComponent('三方晶系') },
        { label: '六方', href: '/minerals?system=' + encodeURIComponent('六方晶系') },
        { label: '斜方', href: '/minerals?system=' + encodeURIComponent('斜方晶系') },
        { label: '单斜', href: '/minerals?system=' + encodeURIComponent('单斜晶系') },
        { label: '三斜', href: '/minerals?system=' + encodeURIComponent('三斜晶系') },
      ],
    },
    {
      title: '工作区',
      items: [
        { label: '鉴定工作台', href: '/identify' },
        { label: '矿物比较', href: '/compare' },
        { label: '我的工作区', href: '/favorites' },
      ],
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 px-1.5 py-4 rounded-r-md text-ink-faint hover:text-primary border border-l-0 border-hair2 bg-bg-card transition-colors duration-300"
        aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
      >
        {collapsed ? '›' : '‹'}
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-0 top-16 bottom-0 z-30 overflow-y-auto border-r border-hair"
            style={{ background: 'color-mix(in srgb, var(--bg) 92%, transparent)' }}
          >
            <nav className="px-3 py-5 space-y-5 min-w-[220px]">
              {groups.map((g) => (
                <div key={g.title}>
                  <div className="px-2 mb-1.5 text-[10px] font-mono tracking-[0.18em] uppercase text-ink-faint">
                    {g.title}
                  </div>
                  <ul className="space-y-0.5">
                    {g.items.map((item) => {
                      const active = pathname === item.href || (item.href.includes('?') && pathname + '?' + item.href.split('?')[1] === item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`block pl-3 pr-2 py-1.5 text-[13px] rounded-md transition-all duration-200 border-l-2 ${
                              active
                                ? 'bg-slate8 text-primary border-primary font-medium'
                                : 'text-ink-mid border-transparent hover:bg-slate8 hover:text-ink-bright'
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              <div className="pt-2 border-t border-hair text-[10px] text-ink-faint leading-relaxed px-2">
                Petrographic Mineral Atlas
                <br />
                v0.4 · Mineral Gallery Light
              </div>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <div style={{ width: collapsed ? 0 : 220 }} className="hidden lg:block shrink-0 transition-all duration-300 ease-crystal" />
    </>
  );
}