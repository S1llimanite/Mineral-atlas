'use client';

import { useEffect, useRef } from 'react';

/**
 * 首页 Hero 抽象晶体插图 v0.4
 * 浅色 Mineral Gallery Light 风格的几何晶体群 SVG
 * —— 明确为程序化插图，不假装是真实矿物摄影
 */
export function HeroCrystalIllustration() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 米白底
    ctx.fillStyle = '#F7F6F2';
    ctx.fillRect(0, 0, W, H);

    // 极淡薄荷绿径向渐变
    const grad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.7);
    grad.addColorStop(0, 'rgba(91, 154, 139, 0.10)');
    grad.addColorStop(1, 'rgba(91, 154, 139, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 主晶体：六方柱+双锥（中心偏左）
    drawHexBipyramid(ctx, W * 0.42, H * 0.52, 70, 170, '#2F6B5A', 0.18, '#5B9A8B', 0.5, 1.5);

    // 右侧小晶体：菱面体
    drawRhombohedron(ctx, W * 0.72, H * 0.45, 38, 95, '#3D2F6B', 0.10, '#7B5B9A', 0.45, 0.9);

    // 左下薄片状（云母）
    drawHexSheet(ctx, W * 0.20, H * 0.72, 56, 16, '#8B5A2F', 0.12, '#C4A35A', 0.5, -0.6);

    // 右上四棱柱
    drawPrism(ctx, W * 0.85, H * 0.20, 22, 22, 90, 4, '#5B7A9A', 0.10, '#2F4B6B', 0.4, 0.4);

    // 右下八面体（石榴石）
    drawOctahedron(ctx, W * 0.62, H * 0.78, 30, '#6B2F5A', 0.10, '#9A5B7B', 0.5, -0.2);

    // 装饰：粒子漂浮
    ctx.fillStyle = 'rgba(47, 107, 90, 0.18)';
    for (let i = 0; i < 40; i++) {
      const px = (i * 47 + 13) % W;
      const py = (i * 89 + 23) % H;
      const r = 1.2 + ((i * 7) % 5);
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 极细线框层
    ctx.strokeStyle = 'rgba(47, 107, 90, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, H * 0.15 + i * 60);
      ctx.lineTo(W, H * 0.15 + i * 60);
      ctx.stroke();
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas ref={ref} className="absolute inset-0 w-full h-full" />
      <div className="absolute bottom-3 right-4 text-[9.5px] font-mono uppercase tracking-[0.15em] text-ink-faint">
        procedural · 几何示意 · 非真实摄影
      </div>
    </div>
  );
}

// ===== 几何工具（2D 投影） =====
function drawHexBipyramid(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, h: number, fill: string, fillAlpha: number, stroke: string, strokeAlpha: number, rot: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  const points: Array<[number, number]> = [];
  const top: [number, number] = [0, -h / 2];
  const bot: [number, number] = [0, h / 2];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    points.push([Math.cos(a) * r, Math.sin(a) * r * 0.3]);  // 透视压扁
  }
  // 上下锥
  ctx.fillStyle = hexAlpha(fill, fillAlpha);
  ctx.strokeStyle = hexAlpha(stroke, strokeAlpha);
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(top[0], top[1]);
    ctx.lineTo(points[i][0], points[i][1]);
    ctx.lineTo(points[(i + 1) % 6][0], points[(i + 1) % 6][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(bot[0], bot[1]);
    ctx.lineTo(points[i][0], points[i][1]);
    ctx.lineTo(points[(i + 1) % 6][0], points[(i + 1) % 6][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // 中心六边形高光
  ctx.fillStyle = hexAlpha('#FFFFFF', 0.12);
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < 6; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRhombohedron(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, h: number, fill: string, fillAlpha: number, stroke: string, strokeAlpha: number, rot: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  // 6 个顶点
  const pts: Array<[number, number]> = [
    [-r, 0],
    [-r * 0.5, -h * 0.4],
    [r * 0.5, -h * 0.4],
    [r, 0],
    [r * 0.5, h * 0.4],
    [-r * 0.5, h * 0.4],
  ];
  ctx.fillStyle = hexAlpha(fill, fillAlpha);
  ctx.strokeStyle = hexAlpha(stroke, strokeAlpha);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < 6; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // 内部斜线
  ctx.strokeStyle = hexAlpha(stroke, strokeAlpha * 0.5);
  ctx.beginPath();
  ctx.moveTo(pts[1][0], pts[1][1]);
  ctx.lineTo(pts[4][0], pts[4][1]);
  ctx.moveTo(pts[2][0], pts[2][1]);
  ctx.lineTo(pts[5][0], pts[5][1]);
  ctx.stroke();
  ctx.restore();
}

function drawHexSheet(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, h: number, fill: string, fillAlpha: number, stroke: string, strokeAlpha: number, rot: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.fillStyle = hexAlpha(fill, fillAlpha);
  ctx.strokeStyle = hexAlpha(stroke, strokeAlpha);
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const yOff = (i - 1) * (h + 2);
    ctx.beginPath();
    for (let k = 0; k <= 6; k++) {
      const a = (k * Math.PI) / 3;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r * 0.4 + yOff;
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawPrism(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, rz: number, h: number, sides: number, fill: string, fillAlpha: number, stroke: string, strokeAlpha: number, rot: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.fillStyle = hexAlpha(fill, fillAlpha);
  ctx.strokeStyle = hexAlpha(stroke, strokeAlpha);
  ctx.lineWidth = 1.5;
  // 顶
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const a = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * rz - h / 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // 底
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const a = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * rz + h / 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // 侧棱
  for (let i = 0; i < sides; i++) {
    const a = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const x1 = Math.cos(a) * rx;
    const y1 = Math.sin(a) * rz - h / 2;
    const x2 = Math.cos(a) * rx;
    const y2 = Math.sin(a) * rz + h / 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawOctahedron(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, fill: string, fillAlpha: number, stroke: string, strokeAlpha: number, rot: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  const pts: Array<[number, number]> = [
    [0, -r],
    [r, 0],
    [0, r],
    [-r, 0],
  ];
  ctx.fillStyle = hexAlpha(fill, fillAlpha);
  ctx.strokeStyle = hexAlpha(stroke, strokeAlpha);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < 4; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // 内部分割
  ctx.strokeStyle = hexAlpha(stroke, strokeAlpha * 0.4);
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  ctx.lineTo(pts[2][0], pts[2][1]);
  ctx.stroke();
  ctx.restore();
}

function hexAlpha(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}