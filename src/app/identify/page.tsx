'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { identifyMinerals } from '@/lib/mineralStore';
import { useWorkspace } from '@/lib/workspaceStore';
import { StatusBadge } from '@/components/StatusBadge';
import type { IdentificationFilters, IdentificationResult } from '@/lib/mineralStore';

/**
 * 薄片鉴定工作台
 * 基于 PPL/XPL 观察特征的透明规则评分（非 AI）
 */
export default function IdentifyPage() {
  const [filters, setFilters] = useState<IdentificationFilters>({});
  const [showResults, setShowResults] = useState(false);
  const benchIds = useWorkspace((s) => s.benchIds);
  const addToBench = useWorkspace((s) => s.addToBench);

  const results = useMemo<IdentificationResult[]>(
    () => (showResults ? identifyMinerals(filters).slice(0, 8) : []),
    [filters, showResults]
  );

  const totalCriteria = Object.values(filters).filter(
    (v) => v != null && (!Array.isArray(v) || v.length > 0)
  ).length;

  function toggle(k: keyof IdentificationFilters, v: any) {
    setFilters((f) => ({ ...f, [k]: f[k] === v ? null : v }));
    setShowResults(true);
  }
  function toggleArr(k: keyof IdentificationFilters, v: string) {
    setFilters((f) => {
      const arr = (f[k] as string[]) || [];
      const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
      return { ...f, [k]: next.length ? next : null };
    });
    setShowResults(true);
  }

  return (
    <div className="space-y-5">
      <header className="border-b border-hair pb-4">
        <h1 className="text-2xl font-serif text-ink-bright">薄片鉴定工作台</h1>
        <p className="text-[12px] text-ink-faint mt-1 max-w-3xl leading-relaxed">
          根据偏光显微镜下的观察特征逐步缩小候选范围。系统采用透明规则评分
          （非机器学习），每条候选均给出匹配 / 不匹配 / 数据不足的逐项解释。
          数据不足时明确告知无法区分，而不是强行给出唯一答案。
        </p>
      </header>

      <div className="grid lg:grid-cols-[380px_1fr] gap-5">
        {/* 左：筛选条件 */}
        <div className="space-y-3">
          <FilterGroup title="单偏光 PPL" code="01">
            <MultiChoice
              label="突起等级"
              value={(filters.reliefKeywords as string[]) || []}
              options={['低突起', '中-高突起', '高突起', '闪突起']}
              onToggle={(v) => toggleArr('reliefKeywords', v)}
            />
            <SingleChoice
              label="颜色色调"
              value={filters.colorHue || null}
              options={['无色', '褐', '绿', '红褐', '暗红', '蓝']}
              onToggle={(v) => toggle('colorHue', v)}
            />
            <SingleChoice
              label="多色性"
              value={filters.pleochroic || null}
              options={[{ v: 'yes', l: '有明显多色性' }, { v: 'no', l: '无多色性' }]}
              onToggle={(v) => toggle('pleochroic', v)}
            />
            <MultiChoice
              label="解理特征"
              value={(filters.cleavageKeywords as string[]) || []}
              options={['极完全', '两组', '56°', '87°', '90°', '无解理']}
              onToggle={(v) => toggleArr('cleavageKeywords', v)}
            />
          </FilterGroup>

          <FilterGroup title="正交偏光 XPL" code="02">
            <SingleChoice
              label="双折射率级别"
              value={filters.birefringenceLevel || null}
              options={[
                { v: 'low', l: '低（一级灰）' },
                { v: 'medium', l: '中（二级）' },
                { v: 'high', l: '高（鲜艳色）' },
                { v: 'extreme', l: '极高（高级白）' },
              ]}
              onToggle={(v) => toggle('birefringenceLevel', v)}
            />
            <SingleChoice
              label="消光方式"
              value={filters.extinctionMode || null}
              options={[
                { v: 'parallel', l: '平行消光' },
                { v: 'oblique', l: '斜消光' },
                { v: 'symmetric', l: '对称消光' },
              ]}
              onToggle={(v) => toggle('extinctionMode', v)}
            />
            <MultiChoice
              label="双晶特征"
              value={(filters.twinningKeywords as string[]) || []}
              options={['聚片双晶', '卡斯巴双晶', '格子双晶', '简单双晶', '无']}
              onToggle={(v) => toggleArr('twinningKeywords', v)}
            />
          </FilterGroup>

          <FilterGroup title="其他约束" code="03">
            <SingleChoice
              label="晶系"
              value={filters.system || null}
              options={['等轴晶系', '四方晶系', '三方晶系', '六方晶系', '斜方晶系', '单斜晶系', '三斜晶系']}
              onToggle={(v) => toggle('system', v)}
            />
            <SingleChoice
              label="矿物大类"
              value={filters.mineralClass || null}
              options={['硅酸盐', '氧化物与氢氧化物', '碳酸盐', '硫化物', '卤化物', '硫酸盐', '磷酸盐', '自然元素', '其他']}
              onToggle={(v) => toggle('mineralClass', v)}
            />
          </FilterGroup>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setShowResults(true)} className="btn-primary">
              生成候选矿物 →
            </button>
            <button
              type="button"
              onClick={() => { setFilters({}); setShowResults(false); }}
              className="text-[12px] text-accent-rust hover:underline"
            >
              重置
            </button>
            <span className="text-[11px] text-ink-faint font-mono">{totalCriteria} 条件</span>
          </div>
        </div>

        {/* 右：结果 */}
        <div className="min-w-0">
          {!showResults ? (
            <div className="panel border-dashed p-12 text-center">
              <div className="text-ink-mid text-[13px]">等待筛选条件</div>
              <div className="text-[11px] text-ink-faint mt-2 max-w-md mx-auto leading-relaxed">
                在左侧勾选观察到的光学特征，结果将按匹配度实时排序，并逐项解释匹配与不匹配依据。
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="panel border-dashed p-12 text-center">
              <div className="text-ink-mid text-[13px]">无候选矿物</div>
              <div className="text-[11px] text-ink-faint mt-2 max-w-md mx-auto leading-relaxed">
                无矿物能同时满足已设条件。请放宽某一条件，或复核观察是否准确。
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-[11px] font-mono text-ink-faint">
                {results.length} 个候选 · 按匹配度排序 · 规则评分（匹配+1 / 不匹配−1 / 缺数据0）
              </div>
              {results.map((r, i) => (
                <motion.div
                  key={r.mineral.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ResultCard result={r} inBench={benchIds.includes(r.mineral.id)} onBench={() => addToBench(r.mineral.id)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, code, children }: { title: string; code: string; children: React.ReactNode }) {
  return (
    <div className="panel p-4">
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-[10px] font-mono text-ink-faint">{code}</span>
        <h3 className="text-[13px] font-medium text-ink-bright">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SingleChoice({
  label, value, options, onToggle,
}: {
  label: string;
  value: any;
  options: Array<string | { v: string; l: string }>;
  onToggle: (v: any) => void;
}) {
  const norm = options.map((o) => (typeof o === 'string' ? { v: o, l: o } : o));
  return (
    <div>
      <div className="text-[11px] text-ink-faint mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {norm.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onToggle(o.v)}
            className={`px-2 py-0.5 text-[11px] rounded-md border transition-all duration-300 ease-crystal
              ${value === o.v
                ? 'bg-moon/20 text-moon border-moon/40'
                : 'bg-slate8 text-ink-mid border-hair hover:border-hair2'}`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiChoice({
  label, value, options, onToggle,
}: {
  label: string;
  value: string[];
  options: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-[11px] text-ink-faint mb-1.5">{label}（可多选）</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={`px-2 py-0.5 text-[11px] rounded-md border transition-all duration-300 ease-crystal
              ${value.includes(o)
                ? 'bg-moon/20 text-moon border-moon/40'
                : 'bg-slate8 text-ink-mid border-hair hover:border-hair2'}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultCard({
  result, inBench, onBench,
}: {
  result: IdentificationResult;
  inBench: boolean;
  onBench: () => void;
}) {
  const { mineral: m, matchScore } = result;
  const barColor = matchScore >= 60 ? 'bg-status-verified' : matchScore >= 30 ? 'bg-status-provisional' : 'bg-status-schematic';
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-2.5">
          <Link href={`/minerals/${m.id}`} className="text-[15px] font-medium text-ink-bright hover:text-moon transition-colors">
            {m.nameCN}
          </Link>
          <span className="text-[11px] font-mono text-ink-faint">{m.nameEN}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBench}
            disabled={inBench}
            className="text-[11px] px-2 py-1 rounded-md border border-hair text-ink-mid hover:text-moon hover:border-accent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {inBench ? '已加入' : '+ 工作台'}
          </button>
          <StatusBadge status={m.dataStatus} small />
          <span className="font-mono text-[13px] text-ink-bright w-11 text-right">{matchScore}%</span>
          <div className="w-28 h-1.5 bg-slate6 rounded-full overflow-hidden">
            <div className={`h-full ${barColor} transition-all duration-500 ease-crystal`} style={{ width: `${Math.max(matchScore, 2)}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-3 text-[11.5px] leading-relaxed">
        <div>
          <div className="text-status-verified font-medium mb-1">✓ 匹配条件</div>
          <ul className="space-y-0.5 text-ink-mid">
            {result.matchedCriteria.length ? result.matchedCriteria.map((c, i) => <li key={i}>· {c}</li>) : <li className="text-ink-faint">无</li>}
          </ul>
        </div>
        <div>
          <div className="text-accent-rust font-medium mb-1">✕ 不匹配项</div>
          <ul className="space-y-0.5 text-ink-mid">
            {result.unmatchedCriteria.length ? result.unmatchedCriteria.map((c, i) => <li key={i}>· {c}</li>) : <li className="text-ink-faint">无</li>}
          </ul>
        </div>
        {result.missingCriteria.length > 0 && (
          <div className="sm:col-span-2">
            <div className="text-ink-faint font-medium mb-1">？ 数据不足</div>
            <ul className="space-y-0.5 text-ink-faint">
              {result.missingCriteria.map((c, i) => <li key={i}>· {c}</li>)}
            </ul>
          </div>
        )}
      </div>

      {m.distinguishing && (
        <div className="mt-3 p-2.5 bg-slate8 border border-hair rounded-md text-[11.5px] text-ink-mid leading-relaxed">
          <span className="text-ink-bright font-medium">鉴别要点：</span>
          {m.distinguishing}
        </div>
      )}
    </div>
  );
}