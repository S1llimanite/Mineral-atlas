/**
 * 程序化矿物插图生成器 v0.4
 * ============================================================
 * 复用 ThinSectionSimulator 的物理引擎做轻量级静态渲染，
 * 供 MineralThumb（卡片缩略图）和 HeroCrystalIllustration（首页大图）使用。
 * 明确标注：基于马吕斯定律与 Michel-Lévy 干涉色表的程序化模拟，
 *          非真实显微照片或晶体摄影。
 */

import type { Mineral } from '@/types/mineral';
import { michelLevyRGB, hexToRgb, mulberry32, hashSeed, birefringenceToRetardation } from '@/lib/interferenceColor';
import { SIM_COLORS } from '@/lib/simColors';

interface RenderOpts {
  size: number;          // 输出画布尺寸（正方形，px）
  mode: 'PPL' | 'XPL';
  theta?: number;        // 旋转角（度），默认 0
  showGrains?: boolean;  // 是否画晶粒（默认 true；首页大图可 false）
  padding?: number;      // 视场内边距（默认 0.04）
  dark?: boolean;        // 视场底色是否近黑（false=浅色，浅色模式时用）
}

/** 从 xpl.birefringence 文本中提取 δ 数值 */
function parseDelta(str: string): number {
  const m = str.match(/0?\.\d{3,4}/);
  return m ? parseFloat(m[0]) : 0;
}

function parseRetardation(str: string): number {
  return birefringenceToRetardation(parseDelta(str));
}

/** 在指定 canvas 上渲染矿物插图（通用渲染） */
export function renderMineralIllustration(
  canvas: HTMLCanvasElement,
  mineral: Mineral,
  opts: RenderOpts
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = opts.size, H = opts.size;
  if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
    canvas.width = W * dpr;
    canvas.height = H * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const dark = opts.dark ?? true;
  // 视场底色
  ctx.fillStyle = dark ? '#06070A' : '#F1EEE3';
  ctx.fillRect(0, 0, W, H);

  // 矿物预设色
  const preset = SIM_COLORS[mineral.id] || ['#B8C2CE'];
  const base = hexToRgb(preset[0]);
  const alt = preset[1] ? hexToRgb(preset[1]) : null;
  const opaque = mineral.optical.conoscopic.opticType === '不透明';
  const R = parseRetardation(mineral.optical.xpl.birefringence);

  // 晶粒生成（seed 稳定）
  const rng = mulberry32(hashSeed(mineral.id));
  const count = 26 + Math.floor(rng() * 18);
  const hasTwin = /双晶/.test(mineral.optical.xpl.twinning || '') && !/无/.test(mineral.optical.xpl.twinning || '');
  const hasCleavage = /完全|解理/.test(mineral.optical.ppl.cleavage) && !/无解理/.test(mineral.optical.ppl.cleavage);
  const iso = mineral.crystal.system.includes('等轴');

  const grains: Array<{ cx: number; cy: number; r: number; verts: number; jitter: number[]; phi: number; twinCount: number; twinAngle: number; cleavageAngle: number | null }> = [];
  for (let i = 0; i < count; i++) {
    const verts = 5 + Math.floor(rng() * 4);
    const jitter: number[] = [];
    for (let v = 0; v < verts; v++) jitter.push(0.72 + rng() * 0.5);
    grains.push({
      cx: rng(), cy: rng(),
      r: 0.10 + rng() * 0.16,
      verts, jitter,
      phi: rng() * 360,
      twinCount: hasTwin && !iso && rng() < 0.55 ? 3 + Math.floor(rng() * 5) : 0,
      twinAngle: rng() * 180,
      cleavageAngle: hasCleavage && rng() < 0.65 ? rng() * 180 : null,
    });
  }

  const th = opts.theta ?? 0;
  const rad = (d: number) => (d * Math.PI) / 180;
  const padding = opts.padding ?? 0.04;
  const size = Math.min(W, H) * (1 - padding * 2);

  if (opts.showGrains !== false) {
    for (const g of grains) {
      const cx = W / 2 + (g.cx - 0.5) * size;
      const cy = H / 2 + (g.cy - 0.5) * size;
      const r = g.r * size;

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

      if (opaque) {
        ctx.fillStyle = dark ? '#0C0D10' : '#5A6258';
        ctx.fill(path);
        ctx.strokeStyle = dark ? 'rgba(120,130,150,0.25)' : 'rgba(60,80,70,0.30)';
        ctx.lineWidth = 0.8;
        ctx.stroke(path);
        continue;
      }

      let fill: [number, number, number];
      if (opts.mode === 'XPL') {
        const s = Math.sin(rad(2 * (th - g.phi)));
        const intensity = s * s;
        const [br, bg, bb] = michelLevyRGB(R);
        fill = [br * intensity, bg * intensity, bb * intensity];
      } else {
        if (alt) {
          const t = (1 + Math.cos(rad(2 * (th - g.phi)))) / 2;
          fill = [
            base[0] + (alt[0] - base[0]) * t,
            base[1] + (alt[1] - base[1]) * t,
            base[2] + (alt[2] - base[2]) * t,
          ];
        } else {
          const v = 0.94 + 0.06 * Math.cos(rad(2 * (th - g.phi)));
          fill = [base[0] * v, base[1] * v, base[2] * v];
        }
      }
      ctx.fillStyle = `rgb(${fill[0] | 0},${fill[1] | 0},${fill[2] | 0})`;
      ctx.fill(path);
      ctx.strokeStyle = dark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.18)';
      ctx.lineWidth = 0.8;
      ctx.stroke(path);

      // 双晶
      if (g.twinCount > 0 && opts.mode === 'XPL') {
        ctx.save();
        ctx.clip(path);
        ctx.translate(cx, cy);
        ctx.rotate(rad(g.twinAngle));
        const stripeW = (r * 2) / g.twinCount;
        for (let s2 = 0; s2 < g.twinCount; s2++) {
          if (s2 % 2 === 0) continue;
          const sPhi = rad(2 * (th - g.phi - 45));
          const it = sPhi * sPhi;
          const [br2, bg2, bb2] = michelLevyRGB(R);
          ctx.fillStyle = `rgba(${(br2 * it) | 0},${(bg2 * it) | 0},${(bb2 * it) | 0},0.85)`;
          ctx.fillRect(-r + s2 * stripeW, -r, stripeW, r * 2);
        }
        ctx.restore();
      }
    }
  }

  // 视场暗角（圆形视场效果）
  const grad = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.30, W / 2, H / 2, Math.max(W, H) * 0.72);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, dark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.40)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 圆形视场裁剪
  if (opts.showGrains !== false) {
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.49, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
}