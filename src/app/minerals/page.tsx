'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { getAllMinerals } from '@/lib/mineralStore';
import { StatusBadge } from '@/components/StatusBadge';
import { useWorkspace } from '@/lib/workspaceStore';

interface SearchParams {
  q?: string;
  class?: string;
  system?: string;
  view?: string;
}

const ALL_CLASSES = [
  '硅酸盐', '氧化物与氢氧化物', '碳酸盐', '硫化物',
  '卤化物', '硫酸盐', '磷酸盐', '自然元素', '其他',
];

const ALL_SYSTEMS = [
  '等轴晶系', '四方晶系', '三方晶系', '六方晶系',
  '斜方晶系', '单斜晶系', '三斜晶系',
];

type SortKey = 'name' | 'birefringence' | 'density' | 'hardness';

export default function MineralsPage({ searchParams }: { searchParams: SearchParams }) {
  const q0 = searchParams.q?.trim() || '';
  const cls0 = searchParams.class || '';
  const sys0 = searchParams.system || '';
  const view = searchParams.view === 'grid' ? 'grid' : 'list';

  const [query, setQuery] = useState(q0);
  const [sort, setSort] = useState<SortKey>('name');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const favorites = useWorkspace((s) => s.favorites);
  const toggleFavorite = useWorkspace((s) => s.toggleFavorite);

  const minerals = useMemo(() => {
    const ql = query.toLowerCase().trim();
    let list = getAllMinerals();
    if (ql) {
      list = list.filter(
        (m) =>
          m.nameCN.includes(query) ||
          m.nameEN.toLowerCase().includes(ql) ||
          m.formula.toLowerCase().includes(ql) ||
          m.crystal.system.includes(query) ||
          m.aliases?.some((a) => a.toLowerCase().includes(ql))
      );
    }
    if (cls0) list = list.filter((m) => m.mineralClass === cls0);
    if (sys0) list = list.filter((m) => m.crystal.system.includes(sys0));
    if (onlyVerified) list = list.filter((m) => m.dataStatus === 'verified');

    const sorted = [...list];
    if (sort === 'name') sorted.sort((a, b) => a.nameCN.localeCompare(b.nameCN, 'zh'));
    if (sort === 'birefringence') {
      const val = (s: string) => parseFloat(s.match(/0\.\d+/)?.[0] || '0');
      sorted.sort((a, b) => val(b.optical.xpl.birefringence) - val(a.optical.xpl.birefringence));
    }
    if (sort === 'density') {
      const val = (s: string) => parseFloat(s.match(/\d+\.?\d*/)?.[0] || '0');
      sorted.sort((a, b) => val(b.crystal.density || '0') - val(a.crystal.density || '0'));
    }
    if (sort === 'hardness') {
      const val = (s: string) => parseFloat(s.match(/\d+\.?\d*/)?.[0] || '0');
      sorted.sort((a, b) => val(b.crystal.hardness || '0') - val(a.crystal.hardness || '0'));
    }
    return sorted;
  }, [query, cls0, sys0, onlyVerified, sort]);

  const hasFilters = Boolean(query || cls0 || sys0 || onlyVerified);

  return (
    <div className="space-y-5">
      {/* 标题 */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-ink-bright">矿物目录</h1>
          <p className="text-[12px] text-ink-faint mt-1">
            共 {minerals.length} 条 · 支持名称 / 化学式 / 别名 / 晶系搜索
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="input !w-auto text-[12px]"
          >
            <option value="name">按名称排序</option>
            <option value="birefringence">按双折射率 ↓</option>
            <option value="density">按密度 ↓</option>
            <option value="hardness">按硬度 ↓</option>
          </select>
          <div className="inline-flex border border-hair rounded-lg overflow-hidden text-[11px]">
            <Link
              href={`/minerals?${qs({ q: query, class: cls0, system: sys0, view: 'list' })}`}
              className={`px-2.5 py-1.5 transition-colors ${view === 'list' ? 'bg-moon/15 text-moon' : 'text-ink-faint hover:text-ink-mid'}`}
            >
              列表
            </Link>
            <Link
              href={`/minerals?${qs({ q: query, class: cls0, system: sys0, view: 'grid' })}`}
              className={`px-2.5 py-1.5 transition-colors ${view === 'grid' ? 'bg-moon/15 text-moon' : 'text-ink-faint hover:text-ink-mid'}`}
            >
              图鉴
            </Link>
          </div>
        </div>
      </div>

      {/* 筛选行 */}
      <div className="panel p-3 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入中文名、英文名、化学式、别名或晶系…"
            className="input flex-1 min-w-[240px]"
          />
          <label className="flex items-center gap-1.5 text-[11px] text-ink-mid cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
              className="accent-moon"
            />
            仅看 verified
          </label>
          {hasFilters && (
            <Link href="/minerals" className="text-[11px] text-accent-rust hover:underline">
              清除筛选
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-mono text-ink-faint w-10 pt-1">大类</span>
          <Link href={`/minerals?${qs({ q: query, system: sys0, view })}`} className={`chip ${!cls0 ? '!border-accent !text-moon' : ''} chip-hover`}>
            全部
          </Link>
          {ALL_CLASSES.map((c) => (
            <Link
              key={c}
              href={`/minerals?${qs({ q: query, class: c, system: sys0, view })}`}
              className={`chip ${cls0 === c ? '!border-accent !text-moon' : ''} chip-hover`}
            >
              {c}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-mono text-ink-faint w-10 pt-1">晶系</span>
          <Link href={`/minerals?${qs({ q: query, class: cls0, view })}`} className={`chip ${!sys0 ? '!border-accent !text-moon' : ''} chip-hover`}>
            全部
          </Link>
          {ALL_SYSTEMS.map((s) => (
            <Link
              key={s}
              href={`/minerals?${qs({ q: query, class: cls0, system: s, view })}`}
              className={`chip ${sys0 === s ? '!border-accent !text-moon' : ''} chip-hover`}
            >
              {s.replace('晶系', '')}
            </Link>
          ))}
        </div>
      </div>

      {/* 空状态 */}
      {minerals.length === 0 && (
        <div className="text-center py-16 panel border-dashed">
          <div className="text-ink-mid">没有匹配的矿物</div>
          <div className="text-[11px] text-ink-faint mt-2">尝试更短的关键词，或清除筛选条件</div>
        </div>
      )}

      {/* 列表视图 */}
      {view === 'list' && minerals.length > 0 && (
        <div className="panel overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead className="bg-slate8 border-b border-hair">
              <tr className="text-left text-[10.5px] font-mono text-ink-faint">
                <th className="px-3 py-2.5 font-normal">名称</th>
                <th className="px-3 py-2.5 font-normal">化学式</th>
                <th className="px-3 py-2.5 font-normal">大类</th>
                <th className="px-3 py-2.5 font-normal">晶系</th>
                <th className="px-3 py-2.5 font-normal">双折射率</th>
                <th className="px-3 py-2.5 font-normal">干涉色</th>
                <th className="px-3 py-2.5 font-normal">状态</th>
                <th className="px-3 py-2.5 font-normal w-8" />
              </tr>
            </thead>
            <tbody>
              {minerals.map((m) => (
                <tr key={m.id} className="border-b border-hair last:border-b-0 hover:bg-slate8/60 transition-colors">
                  <td className="px-3 py-2">
                    <Link href={`/minerals/${m.id}`} className="font-medium text-ink-bright hover:text-moon transition-colors">
                      {m.nameCN}
                    </Link>
                    <div className="text-[10px] font-mono text-ink-faint">{m.nameEN}</div>
                  </td>
                  <td className="px-3 py-2 font-serif italic text-emerald-crystal/90">{m.formula}</td>
                  <td className="px-3 py-2 text-ink-mid text-[11.5px]">{m.mineralClass}</td>
                  <td className="px-3 py-2 text-ink-mid text-[11.5px]">{m.crystal.system}</td>
                  <td className="px-3 py-2 font-mono text-ink-mid text-[11.5px]">{m.optical.xpl.birefringence}</td>
                  <td className="px-3 py-2 text-ink-mid text-[11.5px] max-w-[180px] truncate">{m.optical.xpl.interferenceColor}</td>
                  <td className="px-3 py-2"><StatusBadge status={m.dataStatus} small /></td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(m.id)}
                      className={`text-[12px] transition-colors ${favorites.includes(m.id) ? 'text-amber-gold' : 'text-ink-faint hover:text-amber-gold'}`}
                      aria-label="收藏"
                    >
                      {favorites.includes(m.id) ? '★' : '☆'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 图鉴视图 */}
      {view === 'grid' && minerals.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {minerals.map((m) => (
            <Link
              key={m.id}
              href={`/minerals/${m.id}`}
              className="block p-4 panel-raised hover:border-accent hover:shadow-glowMoon transition-all duration-300 ease-crystal group"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[14px] font-medium text-ink-bright group-hover:text-moon transition-colors">{m.nameCN}</span>
                <StatusBadge status={m.dataStatus} small />
              </div>
              <div className="text-[10.5px] font-mono text-ink-faint mt-0.5 truncate">{m.nameEN}</div>
              <div className="mt-2.5 text-[12px] font-serif italic text-emerald-crystal/90 leading-snug line-clamp-2">{m.formula}</div>
              <div className="mt-2.5 flex flex-wrap gap-1">
                <span className="chip">{m.crystal.system.replace('晶系', '')}</span>
                <span className="chip">{m.mineralClass}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function qs(p: Record<string, string | undefined>): string {
  const r = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) {
    if (v) r.set(k, v);
  }
  return r.toString();
}