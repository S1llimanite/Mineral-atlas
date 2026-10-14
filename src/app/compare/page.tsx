'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getAllMinerals, getMineralById } from '@/lib/mineralStore';
import { CrystalViewer } from '@/components/CrystalViewer';
import { StatusBadge } from '@/components/StatusBadge';
import { useWorkspace } from '@/lib/workspaceStore';
import type { Mineral } from '@/types/mineral';

/** 矿物比较页：支持 1–6 种矿物并排对比，含差异高亮 */
export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-ink-faint">加载中…</div>}>
      <CompareInner />
    </Suspense>
  );
}

function CompareInner() {
  const sp = useSearchParams();
  const all = getAllMinerals();
  const paramIds = (sp.get('ids') || '').split(',').filter(Boolean);

  const benchIds = useWorkspace((s) => s.benchIds);
  const setBench = useWorkspace((s) => s.setBench);
  const selectedIds = paramIds.length ? paramIds : benchIds.length ? benchIds : ['quartz', 'albite'];

  const minerals = useMemo(
    () => selectedIds.map((id) => getMineralById(id)).filter(Boolean) as Mineral[],
    [selectedIds]
  );

  // 差异高亮：找出在比较矿物中取值不同的行
  const diffRows = useMemo(() => buildDiffRows(minerals), [minerals]);

  function toggle(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id].slice(0, 6);
    setBench(next);
    // 同步到 URL（避免依赖 router）
    window.history.replaceState(null, '', next.length ? `/compare?ids=${next.join(',')}` : '/compare');
  }

  return (
    <div className="space-y-5">
      <header className="border-b border-hair pb-4">
        <h1 className="text-2xl font-serif text-ink-bright">矿物比较</h1>
        <p className="text-[12px] text-ink-faint mt-1">
          最多并排比较 6 种矿物的晶体学、光学性质与三维模型。
          <span className="text-ink-mid">高亮行</span>表示该属性在所选矿物中存在差异。
          3D 模型按各自典型尺寸独立缩放，不构成真实尺寸对比。
        </p>
      </header>

      {/* 选择器 */}
      <div className="panel p-3">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[11px] font-mono text-ink-faint">SELECT MINERALS</span>
          <span className="text-[11px] text-ink-faint">{selectedIds.length}/6</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {all.map((m) => {
            const on = selectedIds.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m.id)}
                className={`px-2.5 py-1 text-[11.5px] rounded-md border transition-all duration-300 ease-crystal
                  ${on
                    ? 'bg-moon/20 text-moon border-moon/40'
                    : 'bg-slate8 text-ink-mid border-hair hover:border-hair2 hover:text-ink-bright'}`}
              >
                {m.nameCN}
              </button>
            );
          })}
        </div>
      </div>

      {minerals.length === 0 ? (
        <div className="panel border-dashed p-12 text-center">
          <div className="text-ink-mid">请至少选择 1 个矿物进行对比</div>
        </div>
      ) : (
        <>
          {/* 属性差异表 */}
          <div className="panel overflow-hidden">
            <table className="w-full text-[12px]">
              <thead className="bg-slate8 border-b border-hair">
                <tr>
                  <th className="px-3 py-2.5 text-left text-[10.5px] font-mono text-ink-faint w-[110px]">属性</th>
                  {minerals.map((m) => (
                    <th key={m.id} className="px-3 py-2.5 text-left">
                      <Link href={`/minerals/${m.id}`} className="text-[13px] font-medium text-ink-bright hover:text-moon transition-colors">
                        {m.nameCN}
                      </Link>
                      <div className="text-[9.5px] font-mono text-ink-faint font-normal">{m.nameEN}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {diffRows.map((row) => (
                  <tr
                    key={row.label}
                    className={`border-b border-hair last:border-b-0 ${row.differs ? 'bg-moon/[0.04]' : ''}`}
                  >
                    <td className="px-3 py-2 text-[10.5px] text-ink-faint align-top">
                      {row.label}
                      {row.differs && <span className="ml-1 text-moon">●</span>}
                    </td>
                    {row.values.map((v, i) => (
                      <td key={i} className="px-3 py-2 text-ink-mid align-top leading-relaxed">
                        {v || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3D 并排 */}
          <div className={`grid gap-3 ${gridCols(minerals.length)}`}>
            {minerals.map((m) => (
              <div key={m.id} className="panel p-3">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[13px] font-medium text-ink-bright">{m.nameCN}</span>
                  <StatusBadge status={m.dataStatus} small />
                </div>
                <div className="rounded-lg overflow-hidden border border-hair">
                  <CrystalViewer mineral={m} height={240} />
                </div>
                <Link
                  href={`/minerals/${m.id}`}
                  className="mt-2 block text-center text-[11px] text-moon hover:underline"
                >
                  查看完整详情 →
                </Link>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="text-[10px] text-ink-faint leading-relaxed border-t border-hair pt-3">
        提示：晶体几何为示意模型；颜色渲染仅用于视觉区分，不表示 PPL/XPL 实际颜色。
        带 ● 的属性行表示所选矿物间存在差异，是快速筛选鉴别依据的入口。
      </div>
    </div>
  );
}

interface DiffRow {
  label: string;
  values: string[];
  differs: boolean;
}

function buildDiffRows(minerals: Mineral[]): DiffRow[] {
  const specs: Array<{ label: string; get: (m: Mineral) => string }> = [
    { label: '化学式', get: (m) => m.formula },
    { label: '大类', get: (m) => m.mineralClass },
    { label: '晶系', get: (m) => m.crystal.system },
    { label: '点群', get: (m) => m.crystal.pointGroup || '' },
    { label: '解理', get: (m) => m.crystal.cleavage },
    { label: '硬度', get: (m) => m.crystal.hardness || '' },
    { label: '密度', get: (m) => m.crystal.density || '' },
    { label: '颜色', get: (m) => m.optical.ppl.color },
    { label: '多色性', get: (m) => m.optical.ppl.pleochroism },
    { label: '突起', get: (m) => m.optical.ppl.relief },
    { label: '干涉色', get: (m) => m.optical.xpl.interferenceColor },
    { label: '双折射率', get: (m) => m.optical.xpl.birefringence },
    { label: '消光', get: (m) => m.optical.xpl.extinction },
    { label: '消光角', get: (m) => m.optical.xpl.extinctionAngle || '' },
    { label: '双晶', get: (m) => m.optical.xpl.twinning || '' },
    { label: '光性', get: (m) => m.optical.conoscopic.opticType },
    { label: '光性符号', get: (m) => m.optical.conoscopic.opticSign || '' },
    { label: '2V', get: (m) => m.optical.conoscopic['2V'] || '' },
    { label: '产状', get: (m) => m.occurrence },
    { label: '鉴别要点', get: (m) => m.distinguishing || '' },
  ];
  return specs.map((s) => {
    const values = minerals.map((m) => s.get(m));
    const differs = minerals.length > 1 && new Set(values).size > 1;
    return { label: s.label, values, differs };
  });
}

function gridCols(n: number): string {
  if (n <= 1) return 'grid-cols-1';
  if (n === 2) return 'sm:grid-cols-2';
  if (n === 3) return 'sm:grid-cols-2 lg:grid-cols-3';
  return 'sm:grid-cols-2 lg:grid-cols-4';
}