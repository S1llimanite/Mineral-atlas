'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { getAllMinerals } from '@/lib/mineralStore';

/**
 * 全局命令面板（Ctrl+K / ⌘K）
 * 模糊搜索中英文名、化学式、别名、晶系
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const minerals = useMemo(() => getAllMinerals(), []);

  // 结果（最多 8 条）
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return minerals.slice(0, 8);
    return minerals
      .filter(
        (m) =>
          m.nameCN.includes(query) ||
          m.nameEN.toLowerCase().includes(q) ||
          m.formula.toLowerCase().includes(q) ||
          m.crystal.system.includes(query) ||
          m.aliases?.some((a) => a.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query, minerals]);

  const go = useCallback(
    (id: string) => {
      setOpen(false);
      setQuery('');
      router.push(`/minerals/${id}`);
    },
    [router]
  );

  // 全局快捷键
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // 打开时聚焦
  useEffect(() => {
    if (open) {
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // 输入框键盘导航
  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && results[activeIdx]) {
      go(results[activeIdx].id);
    }
  }

  return (
    <>
      {/* 触发按钮（顶栏内嵌使用） */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-[12px] rounded-lg bg-slate8 border border-hair text-ink-faint
                   transition-all duration-300 ease-crystal hover:border-accent hover:text-ink-mid w-56"
      >
        <span className="font-mono">⌕</span>
        <span className="flex-1 text-left">搜索矿物 / 化学式 / 晶系…</span>
        <kbd className="px-1 py-0.5 text-[9px] font-mono bg-slate6 rounded border border-hair">Ctrl K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-[560px] max-w-[92vw] panel-float overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 输入区 */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-hair">
                <span className="text-moon font-mono text-sm">⌕</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIdx(0);
                  }}
                  onKeyDown={onInputKey}
                  placeholder="输入中文名、英文名、化学式或晶系…"
                  className="flex-1 bg-transparent text-[14px] text-ink-bright placeholder:text-ink-faint focus:outline-none"
                />
                <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-ink-faint bg-slate6 rounded border border-hair">ESC</kbd>
              </div>

              {/* 结果区 */}
              <div className="max-h-[380px] overflow-y-auto py-1.5">
                {results.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[12px] text-ink-faint">
                    没有匹配的矿物
                  </div>
                ) : (
                  results.map((m, i) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => go(m.id)}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150
                        ${i === activeIdx ? 'bg-moon/10 border-l-2 border-moon' : 'border-l-2 border-transparent'}`}
                    >
                      <span className="text-[13px] text-ink-bright w-20 shrink-0">{m.nameCN}</span>
                      <span className="text-[11px] font-mono text-ink-faint flex-1 truncate">{m.nameEN}</span>
                      <span className="text-[11px] font-serif italic text-emerald-crystal/80 truncate max-w-[140px]">
                        {m.formula}
                      </span>
                      <span className="text-[10px] text-ink-faint">{m.crystal.system.replace('晶系', '')}</span>
                    </button>
                  ))
                )}
              </div>

              {/* 底部提示 */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-hair text-[10px] text-ink-faint">
                <span>↑↓ 导航</span>
                <span>↵ 打开</span>
                <span className="ml-auto font-mono">{minerals.length} 种矿物已收录</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}