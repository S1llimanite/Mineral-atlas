'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { getAllMinerals } from '@/lib/mineralStore';
import { useWorkspace } from '@/lib/workspaceStore';
import { StatusBadge } from '@/components/StatusBadge';

/** 我的收藏 + 最近查看 + 工作台 */
export default function FavoritesPage() {
  const favorites = useWorkspace((s) => s.favorites);
  const recentViews = useWorkspace((s) => s.recentViews);
  const benchIds = useWorkspace((s) => s.benchIds);
  const removeFromBench = useWorkspace((s) => s.removeFromBench);

  const favMinerals = useMemo(
    () => favorites.map((id) => getAllMinerals().find((m) => m.id === id)).filter(Boolean),
    [favorites]
  );
  const recentMinerals = useMemo(
    () => recentViews.map((id) => getAllMinerals().find((m) => m.id === id)).filter(Boolean),
    [recentViews]
  );
  const benchMinerals = useMemo(
    () => benchIds.map((id) => getAllMinerals().find((m) => m.id === id)).filter(Boolean),
    [benchIds]
  );

  return (
    <div className="space-y-8">
      <header className="border-b border-hair pb-4">
        <h1 className="text-2xl font-serif text-ink-bright">我的工作区</h1>
        <p className="text-[12px] text-ink-faint mt-1">
          收藏、最近查看与鉴定工作台。数据保存在浏览器 localStorage，不上传服务器。
        </p>
      </header>

      <WorkspaceSection title="鉴定工作台" subtitle={`${benchIds.length}/6`} emptyText="工作台为空。可在矿物详情页或鉴定结果中点击「加入鉴定工作台」。">
        <div className="space-y-2">
          {benchMinerals.map((m) => (
            <div key={m!.id} className="flex items-center justify-between gap-3 p-3 panel-raised">
              <Link href={`/minerals/${m!.id}`} className="text-[13px] font-medium text-ink-bright hover:text-moon transition-colors">
                {m!.nameCN}
                <span className="ml-2 text-[10.5px] font-mono text-ink-faint">{m!.nameEN}</span>
              </Link>
              <div className="flex items-center gap-2">
                <StatusBadge status={m!.dataStatus} small />
                <button
                  type="button"
                  onClick={() => removeFromBench(m!.id)}
                  className="text-[11px] text-ink-faint hover:text-accent-rust transition-colors"
                >
                  移除
                </button>
              </div>
            </div>
          ))}
        </div>
        {benchMinerals.length >= 2 && (
          <Link href={`/compare?ids=${benchIds.join(',')}`} className="btn-primary mt-3">
            在比较页中打开 →
          </Link>
        )}
      </WorkspaceSection>

      <WorkspaceSection title="我的收藏" subtitle={`${favorites.length}`} emptyText="还没有收藏矿物。在目录页或详情页点击 ☆ 即可收藏。">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {favMinerals.map((m) => (
            <Link
              key={m!.id}
              href={`/minerals/${m!.id}`}
              className="block p-4 panel-raised hover:border-accent hover:shadow-glowMoon transition-all duration-300 ease-crystal"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-[14px] font-medium text-ink-bright">{m!.nameCN}</span>
                <StatusBadge status={m!.dataStatus} small />
              </div>
              <div className="text-[10.5px] font-mono text-ink-faint mt-0.5">{m!.nameEN}</div>
              <div className="mt-2 text-[12px] font-serif italic text-emerald-crystal/90">{m!.formula}</div>
            </Link>
          ))}
        </div>
      </WorkspaceSection>

      <WorkspaceSection title="最近查看" subtitle={`${recentViews.length}`} emptyText="暂无浏览记录。">
        <div className="flex flex-wrap gap-1.5">
          {recentMinerals.map((m) => (
            <Link key={m!.id} href={`/minerals/${m!.id}`} className="chip chip-hover">
              {m!.nameCN}
            </Link>
          ))}
        </div>
      </WorkspaceSection>
    </div>
  );
}

function WorkspaceSection({
  title, subtitle, emptyText, children,
}: {
  title: string;
  subtitle: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  const hasChildren = subtitle !== '0' && subtitle !== '0/6';
  return (
    <section>
      <div className="section-title">
        <span className="txt">{title}</span>
        <span className="sub font-mono">{subtitle}</span>
      </div>
      {hasChildren ? children : (
        <div className="panel border-dashed p-8 text-center text-[12px] text-ink-faint">{emptyText}</div>
      )}
    </section>
  );
}