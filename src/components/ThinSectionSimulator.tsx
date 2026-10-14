'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { michelLevyRGB, hexToRgb, mulberry32, hashSeed, birefringenceToRetardation } from '@/lib/interferenceColor';
import { SIM_COLORS } from '@/lib/simColors';
import type { Mineral } from '@/types/mineral';

/**
 * 薄片鉴定图像交互区（程序化光学模拟）
 * ============================================================
 * 交互设计：
 * - 默认显示 PPL（单偏光），鼠标悬浮平滑切换 XPL（正交偏光）
 * - 拖动 = 旋转载物台（0–360°），XPL 下晶粒按马吕斯定律消光/变亮
 * - 滚轮缩放、双击重置、按钮手动锁定 PPL/XPL
 *
 * 物理依据：
 * - XPL 强度 I ∝ sin²(2θ) · sin²(πR/λ)，R = δ × 30μm（标准薄片厚度）
 * - 干涉色由 Michel-Lévy 色表映射（见 interferenceColor.ts）
 * - 消光位：θ = 晶粒取向 φ 或 φ±90° 时该晶粒全黑
 * - PPL 下多色性矿物颜色随 θ 在两个极端色间摆动
 *
 * 诚实声明：这是基于真实光学物理的程序化模拟，不是真实显微照片。
 */

interface Grain {
  cx: number; cy: number;          // 归一化中心 0–1
  r: number;                        // 基础半径（归一化）
  verts: number;                    // 多边形顶点数
  jitter: number[];                 // 每顶点半径系数
  phi: number;                      // 晶粒光学取向（度）
  twinCount: number;                // 双晶条纹数（0 = 无）
  twinAngle: number;                // 双晶纹方向
  cleavageAngle: number | null;     // 解理纹方向（null = 无）
  inclusions: Array<{ x: number; y: number; r: number }>;
}

interface Props {
  mineral: Mineral;
  height?: number;
}

export function ThinSectionSimulator({ mineral, height = 420 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'PPL' | 'XPL'>('PPL');
  const [theta, setTheta] = useState(0);       // 载物台角度（度）
  const [zoom, setZoom] = useState(1);
  const [hovering, setHovering] = useState(false);
  const [autoHover, setAutoHover] = useState(true);  // 悬浮自动切 XPL（可关闭以在 PPL 下拖动）
  const dragRef = useRef<{ x: number; theta: number } | null>(null);

  // 显示模式：手动锁定 XPL 则始终 XPL；
  // 手动 PPL + 自动悬浮开启 + 鼠标悬浮 → 临时切 XPL；
  // 关闭自动悬浮后可在 PPL 下自由拖动观察多色性
  const displayMode: 'PPL' | 'XPL' = mode === 'XPL' ? 'XPL' : autoHover && hovering ? 'XPL' : 'PPL';

  // ===== 晶粒生成（seed 稳定：同一矿物分布一致） =====
  const grains = useMemo<Grain[]>(() => {
    const rng = mulberry32(hashSeed(mineral.id));
    const count = 34 + Math.floor(rng() * 22);
    const hasTwin = /双晶/.test(mineral.optical.xpl.twinning || '') &&
                    !/无/.test(mineral.optical.xpl.twinning || '');
    const hasCleavage = /完全|解理/.test(mineral.optical.ppl.cleavage) &&
                        !/无解理/.test(mineral.optical.ppl.cleavage);
    const isOpaque = mineral.optical.conoscopic.opticType === '不透明';
    const iso = mineral.crystal.system.includes('等轴');

    const out: Grain[] = [];
    for (let i = 0; i < count; i++) {
      const verts = 5 + Math.floor(rng() * 4);
      const jitter: number[] = [];
      for (let v = 0; v < verts; v++) jitter.push(0.72 + rng() * 0.5);
      const inclusions: Array<{ x: number; y: number; r: number }> = [];
      if (!isOpaque && rng() < 0.5) {
        const n = 1 + Math.floor(rng() * 3);
        for (let k = 0; k < n; k++) {
          inclusions.push({ x: (rng() - 0.5) * 1.1, y: (rng() - 0.5) * 1.1, r: 0.03 + rng() * 0.05 });
        }
      }
      out.push({
        cx: rng(), cy: rng(),
        r: 0.09 + rng() * 0.16,
        verts, jitter,
        phi: rng() * 360,
        // 等轴晶系无双晶；双晶条纹 3–7 条
        twinCount: hasTwin && !iso && rng() < 0.65 ? 3 + Math.floor(rng() * 5) : 0,
        twinAngle: rng() * 180,
        cleavageAngle: hasCleavage && rng() < 0.7 ? rng() * 180 : null,
        inclusions,
      });
    }
    return out;
  }, [mineral]);

  // ===== 矿物颜色预设 =====
  const colors = useMemo(() => {
    const preset = SIM_COLORS[mineral.id] || ['#B8C2CE'];
    const opaque = mineral.optical.conoscopic.opticType === '不透明';
    return {
      base: hexToRgb(preset[0]),
      alt: preset[1] ? hexToRgb(preset[1]) : null,
      opaque,
      // XPL 光程差：从 xpl.birefringence 提取 δ 数值
      R: parseRetardation(mineral.optical.xpl.birefringence),
    };
  }, [mineral]);

  // ===== 绘制 =====
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const size = Math.min(W, H) * zoom;

    // 视场背景（近黑微蓝）
    ctx.fillStyle = '#06070A';
    ctx.fillRect(0, 0, W, H);

    const th = theta;
    const rad = (d: number) => (d * Math.PI) / 180;

    // 逐晶粒绘制
    for (const g of grains) {
      const cx = W / 2 + (g.cx - 0.5) * size;
      const cy = H / 2 + (g.cy - 0.5) * size;
      const r = g.r * size;

      // 多边形路径
      const path = new Path2D();
      for (let v = 0; v <= g.verts; v++) {
        const a = (v % g.verts) * ((Math.PI * 2) / g.verts);
        const rr = r * g.jitter[v % g.verts];
        const px = cx + Math.cos(a) * rr;
        const py = cy + Math.sin(a) * rr;
        if (v === 0) path.moveTo(px, py);
        else path.lineTo(px, py);
      }
      path.closePath();

      if (colors.opaque) {
        // 不透明矿物：透射光下全黑，仅微弱轮廓可见
        ctx.fillStyle = '#0C0D10';
        ctx.fill(path);
        ctx.strokeStyle = 'rgba(120,130,150,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke(path);
        continue;
      }

      let fill: [number, number, number];
      let intensity = 1;

      if (displayMode === 'XPL') {
        // ===== 正交偏光：I ∝ sin²(2(θ-φ))，色 = Michel-Lévy(R) =====
        const s = Math.sin(rad(2 * (th - g.phi)));
        intensity = s * s;                       // 0–1，消光位为 0
        const [br, bg, bb] = michelLevyRGB(colors.R);
        fill = [br * intensity, bg * intensity, bb * intensity];
      } else {
        // ===== 单偏光：基础色，多色性随 θ 摆动 =====
        if (colors.alt) {
          const t = (1 + Math.cos(rad(2 * (th - g.phi)))) / 2;
          fill = [
            colors.base[0] + (colors.alt[0] - colors.base[0]) * t,
            colors.base[1] + (colors.alt[1] - colors.base[1]) * t,
            colors.base[2] + (colors.alt[2] - colors.base[2]) * t,
          ];
        } else {
          // 无多色性：轻微明暗（晶粒取向差异）
          const v = 0.94 + 0.06 * Math.cos(rad(2 * (th - g.phi)));
          fill = [colors.base[0] * v, colors.base[1] * v, colors.base[2] * v];
        }
      }

      ctx.fillStyle = `rgb(${fill[0] | 0},${fill[1] | 0},${fill[2] | 0})`;
      ctx.fill(path);
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1;
      ctx.stroke(path);

      // 双晶条纹：两半相位差 45°（光轴取向不同）
      if (g.twinCount > 0 && displayMode === 'XPL') {
        ctx.save();
        ctx.clip(path);
        ctx.translate(cx, cy);
        ctx.rotate(rad(g.twinAngle));
        const stripeW = (r * 2) / g.twinCount;
        for (let s2 = 0; s2 < g.twinCount; s2++) {
          if (s2 % 2 === 0) continue;
          const sPhi = rad(2 * (th - g.phi - 45));
          const it = sPhi * sPhi;
          const [br2, bg2, bb2] = michelLevyRGB(colors.R);
          ctx.fillStyle = `rgba(${(br2 * it) | 0},${(bg2 * it) | 0},${(bb2 * it) | 0},0.85)`;
          ctx.fillRect(-r + s2 * stripeW, -r, stripeW, r * 2);
        }
        ctx.restore();
      }
      // PPL 下双晶纹显示为淡色条纹（解理缝/双晶缝可见）
      if (g.twinCount > 0 && displayMode === 'PPL') {
        ctx.save();
        ctx.clip(path);
        ctx.translate(cx, cy);
        ctx.rotate(rad(g.twinAngle));
        ctx.strokeStyle = 'rgba(255,255,255,0.14)';
        ctx.lineWidth = 0.8;
        const stripeW = (r * 2) / g.twinCount;
        for (let s2 = 0; s2 < g.twinCount; s2++) {
          ctx.beginPath();
          ctx.moveTo(-r + s2 * stripeW, -r);
          ctx.lineTo(-r + s2 * stripeW, r);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 解理纹：一组平行暗线
      if (g.cleavageAngle !== null) {
        ctx.save();
        ctx.clip(path);
        ctx.translate(cx, cy);
        ctx.rotate(rad(g.cleavageAngle));
        ctx.strokeStyle = displayMode === 'XPL'
          ? 'rgba(0,0,0,0.30)'
          : 'rgba(0,0,0,0.22)';
        ctx.lineWidth = 0.8;
        for (let l = -3; l <= 3; l++) {
          ctx.beginPath();
          ctx.moveTo(-r, l * r * 0.3);
          ctx.lineTo(r, l * r * 0.3);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 包裹体
      for (const inc of g.inclusions) {
        ctx.beginPath();
        ctx.arc(cx + inc.x * r, cy + inc.y * r, Math.max(inc.r * size * 0.08, 1), 0, Math.PI * 2);
        ctx.fillStyle = displayMode === 'XPL'
          ? `rgba(20,20,26,${0.5 * intensity + 0.2})`
          : 'rgba(30,30,36,0.45)';
        ctx.fill();
      }
    }

    // 视场暗角（径向渐变边缘压暗 → 显微镜视场感）
    const grad = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.32, W / 2, H / 2, Math.max(W, H) * 0.72);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 十字丝（XPL 时显示正交偏光十字）
    if (displayMode === 'XPL') {
      ctx.strokeStyle = 'rgba(200,210,225,0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
      ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
      ctx.stroke();
    }
  }, [grains, colors, theta, zoom, displayMode]);

  useEffect(() => { draw(); }, [draw]);

  // 窗口 resize 重绘
  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  // ===== 交互 =====
  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, theta };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    setTheta(((dragRef.current.theta + dx * 0.6) % 360 + 360) % 360);
  };
  const onPointerUp = () => { dragRef.current = null; };
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(3, Math.max(0.6, z * (e.deltaY < 0 ? 1.09 : 0.92))));
  };
  const onDoubleClick = () => {
    setTheta(0); setZoom(1); setMode('PPL');
  };

  // 键盘旋转（可访问性）
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setTheta((t) => (t - 5 + 360) % 360);
    if (e.key === 'ArrowRight') setTheta((t) => (t + 5) % 360);
    if (e.key === 'p' || e.key === 'P') setMode((m) => (m === 'PPL' ? 'XPL' : 'PPL'));
  };

  const thetaDeg = Math.round(theta);

  return (
    <div className="select-none">
      {/* 显微镜视场 */}
      <div
        className="microscope-field relative cursor-grab active:cursor-grabbing"
        style={{ height }}
        tabIndex={0}
        role="img"
        aria-label={`${mineral.nameCN} 薄片 ${displayMode} 模拟视场，当前载物台角度 ${thetaDeg} 度`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => { setHovering(false); onPointerUp(); }}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* 模式徽章（右上） */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
          <span
            className="px-2 py-0.5 text-[10.5px] font-mono rounded-md border backdrop-blur-sm transition-all duration-200"
            style={{
              color: displayMode === 'XPL' ? 'var(--accent2)' : 'var(--accent)',
              borderColor: displayMode === 'XPL'
                ? 'color-mix(in srgb, var(--accent2) 45%, transparent)'
                : 'color-mix(in srgb, var(--accent) 45%, transparent)',
              background: 'rgba(6,7,10,0.72)',
            }}
          >
            {displayMode === 'XPL' ? 'XPL · 正交偏光' : 'PPL · 单偏光'}
          </span>
        </div>

        {/* 模拟声明（左上） */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[9.5px] font-mono rounded-md border border-hair text-ink-faint"
             style={{ background: 'rgba(6,7,10,0.72)' }}>
          程序化光学模拟 · 非真实显微照片
        </div>

        {/* 角度指示（左下） */}
        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 text-[11px] font-mono rounded-md border border-hair text-ink-mid"
             style={{ background: 'rgba(6,7,10,0.72)' }}>
          θ = {thetaDeg}°{thetaDeg === 0 || thetaDeg === 90 || thetaDeg === 180 || thetaDeg === 270 ? ' · 正交位' : ''}
        </div>

        {/* 缩放指示（右下） */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 text-[10px] font-mono rounded-md border border-hair text-ink-faint"
             style={{ background: 'rgba(6,7,10,0.72)' }}>
          ×{zoom.toFixed(1)}
        </div>

        {/* 操作提示（中央底部，悬浮时淡出） */}
        <div
          className={`absolute bottom-10 left-0 right-0 text-center text-[10.5px] text-ink-faint transition-opacity duration-300 pointer-events-none ${hovering ? 'opacity-0' : 'opacity-100'}`}
        >
          {autoHover
            ? '拖动旋转物台 · 滚轮缩放 · 悬浮切换 XPL · 双击重置'
            : '拖动旋转物台 · 滚轮缩放 · 双击重置（悬浮切换已关闭）'}
        </div>
      </div>

      {/* 模式切换按钮 + 物理说明 */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg overflow-hidden border border-hair text-[11.5px]">
          {(['PPL', 'XPL'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 transition-all duration-200 ${
                mode === m ? 'bg-moon/20 text-moon' : 'bg-slate8 text-ink-faint hover:text-ink-mid'
              }`}
            >
              {m}
              <span className="ml-1 text-[9.5px] opacity-70">{m === 'PPL' ? '单偏光' : '正交偏光'}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setTheta((t) => (t + 45) % 360)}
          className="chip chip-hover"
        >
          旋转 45°
        </button>
        <button
          type="button"
          onClick={() => setTheta(0)}
          className="chip chip-hover"
        >
          回正交位
        </button>
        <button
          type="button"
          onClick={() => setAutoHover((a) => !a)}
          className={`chip transition-colors ${autoHover ? 'text-moon border-accent' : 'text-ink-faint'}`}
          title="开启后鼠标悬浮视场自动切换到 XPL；关闭后可锁定 PPL 拖动观察多色性"
        >
          悬浮切换 XPL：{autoHover ? '开' : '关'}
        </button>
        <span className="ml-auto text-[10px] text-ink-faint leading-relaxed">
          物理依据：I ∝ sin²(2θ)·sin²(πR/λ)，R = δ·d（δ = {extractDelta(mineral.optical.xpl.birefringence)}，d = 30 μm 标准薄片）
        </span>
      </div>
    </div>
  );
}

/** 从双折射率描述字符串提取 δ 数值 → 光程差 (nm)。提取失败返回 0（一级黑，但极罕见） */
function parseRetardation(str: string): number {
  const m = str.match(/0?\.\d{3,4}/);
  if (!m) return 0;
  return birefringenceToRetardation(parseFloat(m[0]));
}

function extractDelta(str: string): string {
  const m = str.match(/0?\.\d{3,4}/);
  return m ? m[0] : '—';
}