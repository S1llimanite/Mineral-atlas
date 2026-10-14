'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme, type GlobalTheme } from '@/components/ThemeProvider';

const THEME_OPTIONS: Array<{ id: GlobalTheme; name: string; desc: string; swatches: string[] }> = [
  { id: 'light',    name: '浅色',   desc: '默认 · Mineral Gallery Light', swatches: ['#F7F6F2', '#2F6B5A', '#5B9A8B'] },
  { id: 'dark',     name: '深地',   desc: '深色 · Deep Crystal（v0.3 风格）', swatches: ['#0F1218', '#7EB8FF', '#3AA89A'] },
  { id: 'contrast', name: '高对比', desc: '弱视环境友好', swatches: ['#080A0E', '#8FBBFF', '#FFFFFF'] },
];

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const { globalTheme, setGlobalTheme } = useTheme();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="px-2.5 py-1.5 rounded-md text-ink-mid hover:text-primary hover:bg-slate8 transition-all duration-300 ease-crystal text-[13px]"
        title="主题设置"
      >
        ⚙
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50" onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-16 right-4 z-50 w-72 panel-float p-3"
            >
              <div className="text-[11px] font-mono tracking-[0.18em] uppercase text-ink-faint mb-2 px-1">主题设置</div>
              <div className="space-y-1">
                {THEME_OPTIONS.map((opt) => {
                  const active = globalTheme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setGlobalTheme(opt.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                        active ? 'bg-slate7 border border-accent' : 'border border-transparent hover:bg-slate8'
                      }`}
                    >
                      <span className="flex gap-1 shrink-0">
                        {opt.swatches.map((c) => (
                          <span key={c} className="w-4 h-4 rounded-full border border-hair2" style={{ background: c }} />
                        ))}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-medium text-ink-bright">{opt.name}</span>
                        <span className="block text-[10.5px] text-ink-faint">{opt.desc}</span>
                      </span>
                      {active && <span className="text-primary text-[13px]">✓</span>}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-hair text-[10px] text-ink-faint leading-relaxed px-1">
                浅色 Mineral Gallery Light 为 v0.4 默认；深色 Deep Crystal 仍可切换使用。
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}