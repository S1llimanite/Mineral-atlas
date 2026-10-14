'use client';

import { useEffect, useRef } from 'react';
import type { Mineral } from '@/types/mineral';
import { renderMineralIllustration } from '@/lib/renderMineralIllustration';

interface Props {
  mineral: Mineral;
  size?: number;
  mode?: 'PPL' | 'XPL';
  /** true 浅色视场（与浅色主题卡片背景融合） */
  light?: boolean;
}

/**
 * 矿物缩略图：程序化 PPL/XPL 渲染（基于马吕斯定律 + Michel-Lévy 干涉色）
 * 卡片中代替真实矿物图片，明确标注为程序化渲染。
 */
export function MineralThumb({ mineral, size = 220, mode = 'PPL', light = true }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    renderMineralIllustration(canvas, mineral, {
      size,
      mode,
      dark: !light,
      showGrains: true,
    });
  }, [mineral, size, mode, light]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden lift-on-hover"
      style={{
        aspectRatio: '1 / 1',
        background: light ? '#F1EEE3' : '#06070A',
        borderRadius: 14,
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-1)',
      }}
    >
      <canvas
        ref={ref}
        className="absolute inset-0 w-full h-full"
        aria-label={`${mineral.nameCN} 程序化渲染（基于物理光学）`}
      />
      {/* 角落水印：诚实声明 */}
      <div
        className="absolute bottom-1.5 right-2 px-1.5 py-0.5 text-[8.5px] font-mono rounded tracking-wider uppercase"
        style={{
          background: 'rgba(0,0,0,0.45)',
          color: '#FFFFFF',
          opacity: 0.7,
        }}
      >
        {mode}
      </div>
    </div>
  );
}