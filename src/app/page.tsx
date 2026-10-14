'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getAllMinerals, getCoverageStats, getClassificationTree } from '@/lib/mineralStore';
import { REFERENCES } from '@/data/references';
import { StatusBadge } from '@/components/StatusBadge';
import { HeroPolyhedron3D } from '@/components/HeroPolyhedron3D';

/**
 * 首页 v0.5 · Mineral Gallery Light
 * AVTL 风格大图 + 大标题，3D 旋转多面体 Hero，数据卡组 4 列，矿物卡片图片主导
 */
export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* ===== 英雄区（占首屏主视觉） ===== */}
      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center min-h-[520px]">
        <div
          className="relative panel overflow-hidden"
          style={{
            height: 480,
            borderRadius: 20,
            background: 'radial-gradient(circle at 50% 42%, rgba(91,154,139,0.10) 0%, rgba(247,246,242,0) 62%), #F7F6F2',
          }}
        >
          <HeroPolyhedron3D />
          <div className="absolute top-5 left-5 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] rounded-full"
               style={{ background: 'rgba(255,255,255,0.85)', color: 'var(--ink)', border: '1px solid var(--border)' }}>
            Petrographic Mineral Atlas · v0.5
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <div>
            <div className="text-[11px] tracking-[0.25em] font-mono text-primary uppercase mb-3">
              Thin Section · Crystal · Identification
            </div>
            <h1 className="display-title text-[44px] lg:text-[56px] text-ink-bright">
              薄片矿物
              <br />
              <span className="text-primary">数字图鉴</span>
            </h1>
          </div>
          <p className="text-[15.5px] text-ink-mid leading-[1.75] max-w-xl">
            把纸质《透明矿物薄片鉴定手册》变成可交互、可对比、可搜索、可三维探索的数字工具。
            在几分钟内完成 <span className="text-ink font-medium">观察 → 对比 → 初步鉴定 → 记录</span> 的完整闭环。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/identify" className="btn-primary">
              开始鉴定 →
            </Link>
            <Link href="/minerals" className="btn-ghost">
              浏览矿物目录
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-2">
            <span className="chip">Nesse 2013</span>
            <span className="chip">Deer · Howie · Zussman</span>
            <span className="chip">RRUFF</span>
            <span className="chip">Mindat</span>
          </div>
        </motion.div>
      </section>

      {/* ===== 数据覆盖状态（AVTL 风格小卡组） ===== */}
      <CoveragePanel />

      {/* ===== 精选矿物 ===== */}
      <FeaturedMinerals />

      {/* ===== 按大类浏览 ===== */}
      <ClassificationGrid />

      {/* ===== 资料来源 ===== */}
      <section>
        <SectionHeader title="资料来源" subtitle="REFERENCES" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 text-[13px]">
          {Object.values(REFERENCES).map((r) => (
            <div key={r.id} className="panel p-4 lift-on-hover">
              <div className="font-medium text-ink text-[13.5px]">{r.authors}</div>
              <div className="font-serif italic text-ink-mid mt-0.5 leading-snug">{r.title}</div>
              <div className="mt-1.5 text-[10.5px] font-mono text-ink-faint">
                {r.year} · {r.publisher || r.url}
              </div>
              {r.license && <span className="chip mt-2">{r.license}</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// =================================================================
// 数据覆盖状态（AVTL 风格 4 列小卡组）
// =================================================================
function CoveragePanel() {
  const stats = getCoverageStats();
  const rows = [
    { label: '已收录矿物种', value: stats.totalMinerals, hint: '目标 IMA-RRUFF' },
    { label: 'verified', value: stats.withVerifiedStatus, hint: '已对照标准文献' },
    { label: '具完整光学数据', value: stats.withOpticalPPL, hint: 'PPL + XPL + 锥光' },
    { label: '3D 示意模型', value: stats.with3DModel, hint: '84 种程序化渲染' },
  ];
  return (
    <section>
      <SectionHeader title="数据库覆盖与审核状态" subtitle="DATA COVERAGE" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        {rows.map((r) => (
          <div key={r.label} className="panel p-5 lift-on-hover">
            <div className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-faint">{r.label}</div>
            <div className="mt-2 text-[36px] font-mono text-primary leading-none font-medium">{r.value}</div>
            <div className="mt-1.5 text-[11px] text-ink-mid">{r.hint}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// =================================================================
// 精选矿物：图片主导卡（hover 放大）
// =================================================================
const FEATURED = [
  'quartz', 'albite', 'biotite', 'hornblende',
  'augite', 'olivine', 'calcite', 'garnet',
];

function FeaturedMinerals() {
  const all = getAllMinerals();
  const minerals = useMemo(() => {
    return FEATURED.map((id) => all.find((x) => x.id === id)).filter(Boolean);
  }, [all]);

  return (
    <section>
      <SectionHeader
        title="代表矿物"
        subtitle="REPRESENTATIVE MINERALS"
        action={
          <Link href="/minerals" className="text-[13px] text-primary hover:underline">
            查看全部 {all.length} 种 →
          </Link>
        }
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {minerals.map((m, i) => (
          <motion.div
            key={m!.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          >
            <FeaturedCard id={m!.id} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FeaturedCard({ id }: { id: string }) {
  const m = getAllMinerals().find((x) => x.id === id)!;
  return (
    <Link href={`/minerals/${m.id}`} className="block panel p-4 lift-on-hover group">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[15px] font-semibold text-ink-bright group-hover:text-primary transition-colors">
          {m.nameCN}
        </span>
        <StatusBadge status={m.dataStatus} small />
      </div>
      <div className="text-[10.5px] font-mono text-ink-faint mt-0.5 truncate">{m.nameEN}</div>
      <div className="mt-2 text-[12.5px] font-serif italic text-primary/80 leading-snug line-clamp-2 min-h-[2.4em]">
        {m.formula}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1">
        <span className="chip">{m.crystal.system}</span>
        <span className="chip">{m.mineralClass}</span>
      </div>
      <div className="mt-2.5 text-[10.5px] text-ink-faint leading-relaxed line-clamp-2 min-h-[2.4em]">
        {m.optical.xpl.interferenceColor}
      </div>
    </Link>
  );
}

// =================================================================
// 按大类浏览（统一高度 + 过滤空类）
// =================================================================
function ClassificationGrid() {
  const nodes = useMemo(
    () =>
      getClassificationTree()
        .map((n) => ({
          ...n,
          count: getCoverageStats().classificationTree.find((c) => c.class === n.class)?.count || 0,
        }))
        .filter((n) => n.count > 0),
    []
  );
  return (
    <section>
      <SectionHeader title="按矿物大类浏览" subtitle="CLASSIFICATION" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-5">
        {nodes.map((node, i) => (
          <motion.div
            key={node.class}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            <Link
              href={`/minerals?class=${encodeURIComponent(node.class)}`}
              className="flex flex-col h-full p-4 panel lift-on-hover group"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[14px] font-medium text-ink-bright group-hover:text-primary transition-colors">
                  {node.class}
                </span>
                <span className="text-[10.5px] font-mono text-ink-faint shrink-0">{node.count} 种</span>
              </div>
              <div className="mt-2 text-[10px] text-ink-mid leading-[1.6] line-clamp-2 min-h-[2.6em]">
                {node.subclasses ? node.subclasses.join(' · ') : ''}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  title, subtitle, action,
}: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 pb-3 mb-1 border-b border-hair">
      <div>
        <h2 className="display-title text-[24px] text-ink-bright">{title}</h2>
        <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-ink-faint mt-1">{subtitle}</div>
      </div>
      {action}
    </div>
  );
}