'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWorkspace } from '@/lib/workspaceStore';
import { getMineralById } from '@/lib/mineralStore';
import type { Mineral } from '@/types/mineral';

/** 模块级稳定空数组，避免 selector 每次返回新引用导致无限重渲染 */
const EMPTY_ARR: string[] = [];

/**
 * 鉴定特征清单：用户可勾选已观察到的特征
 * 勾选状态持久化到 localStorage（workspaceStore）
 */
export function FeatureChecklist({ mineral }: { mineral: Mineral }) {
  // 订阅整个 checkedFeatures 对象（引用稳定），再在组件内取对应 mineral 的数组
  const checkedFeatures = useWorkspace((s) => s.checkedFeatures);
  const toggle = useWorkspace((s) => s.toggleFeature);
  const checked = checkedFeatures[mineral.id] ?? EMPTY_ARR;

  // 从矿物数据构造观察项
  const items: Array<{ text: string; source: string }> = [
    { text: `颜色：${mineral.optical.ppl.color}`, source: 'PPL' },
    { text: `突起：${mineral.optical.ppl.relief}`, source: 'PPL' },
    { text: `解理：${mineral.optical.ppl.cleavage}`, source: 'PPL' },
    { text: `干涉色：${mineral.optical.xpl.interferenceColor}`, source: 'XPL' },
    { text: `双折射率：${mineral.optical.xpl.birefringence}`, source: 'XPL' },
    { text: `消光：${mineral.optical.xpl.extinction}${mineral.optical.xpl.extinctionAngle ? `（${mineral.optical.xpl.extinctionAngle}）` : ''}`, source: 'XPL' },
    { text: `双晶：${mineral.optical.xpl.twinning || '（无/待补充）'}`, source: 'XPL' },
    { text: `光性：${mineral.optical.conoscopic.opticType}${mineral.optical.conoscopic.opticSign ? ' ' + mineral.optical.conoscopic.opticSign : ''}`, source: '锥光' },
  ];

  const done = items.filter((i) => checked.includes(i.text)).length;

  return (
    <section>
      <div className="section-title">
        <span className="idx">06</span>
        <span className="txt">鉴定特征清单</span>
        <span className="sub">{done}/{items.length}</span>
      </div>
      <div className="panel p-4 space-y-1">
        {items.map((it) => {
          const on = checked.includes(it.text);
          return (
            <label
              key={it.text}
              className={`flex items-start gap-2.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors duration-200 group
                ${on ? 'bg-moon/10' : 'hover:bg-slate8'}`}
            >
              <span
                className={`mt-0.5 w-3.5 h-3.5 shrink-0 rounded border grid place-items-center text-[9px] transition-all duration-200
                  ${on ? 'bg-moon border-moon text-void' : 'border-hair2 group-hover:border-moon/50'}`}
              >
                {on ? '✓' : ''}
              </span>
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggle(mineral.id, it.text)}
                className="sr-only"
              />
              <span className="flex-1 text-[12px] text-ink-mid leading-relaxed">
                <span className="font-mono text-[9px] text-ink-faint mr-1.5 px-1 py-px border border-hair rounded">
                  {it.source}
                </span>
                {it.text}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

/** 底部操作：加入工作台 / 收藏 / 导出 Markdown（真实下载） */
export function BenchActions({
  mineralId,
  mineralName,
  compareIds,
}: {
  mineralId: string;
  mineralName: string;
  compareIds: string[];
}) {
  const benchIds = useWorkspace((s) => s.benchIds);
  const addToBench = useWorkspace((s) => s.addToBench);
  const favorites = useWorkspace((s) => s.favorites);
  const toggleFavorite = useWorkspace((s) => s.toggleFavorite);
  const checkedFeatures = useWorkspace((s) => s.checkedFeatures);
  const [exported, setExported] = useState(false);

  const inBench = benchIds.includes(mineralId);
  const faved = favorites.includes(mineralId);

  function exportMarkdown() {
    const m = getMineralById(mineralId);
    if (!m) return;
    const checked = checkedFeatures[mineralId] || [];
    const md = [
      `# 薄片鉴定记录 —— ${m.nameCN}（${m.nameEN}）`,
      '',
      `- 日期：${new Date().toISOString().slice(0, 10)}`,
      `- 化学式：${m.formula}`,
      `- 晶系：${m.crystal.system}${m.crystal.pointGroup ? ' · ' + m.crystal.pointGroup : ''}`,
      `- 数据状态：${m.dataStatus}`,
      '',
      '## 已观察并确认的特征',
      ...(checked.length ? checked.map((c) => `- [x] ${c}`) : ['- [ ] （未勾选任何特征）']),
      '',
      '## 参考光学属性',
      '',
      '| 项目 | 值 |',
      '|---|---|',
      `| 突起 | ${m.optical.ppl.relief} |`,
      `| 颜色 | ${m.optical.ppl.color} |`,
      `| 解理 | ${m.optical.ppl.cleavage} |`,
      `| 干涉色 | ${m.optical.xpl.interferenceColor} |`,
      `| 双折射率 | ${m.optical.xpl.birefringence} |`,
      `| 消光 | ${m.optical.xpl.extinction}${m.optical.xpl.extinctionAngle ? ' · ' + m.optical.xpl.extinctionAngle : ''} |`,
      `| 双晶 | ${m.optical.xpl.twinning} |`,
      `| 光性 | ${m.optical.conoscopic.opticType}${m.optical.conoscopic.opticSign ? ' ' + m.optical.conoscopic.opticSign : ''} |`,
      `| 2V | ${m.optical.conoscopic['2V'] || '—'} |`,
      '',
      '## 鉴别要点',
      m.distinguishing || '（暂无）',
      '',
      '## 资料来源',
      'Nesse (2013) Introduction to Optical Mineralogy; Deer/Howie/Zussman (2013); RRUFF; Mindat',
      '',
      '---',
      '由 薄片矿物数字图鉴 (Petrographic Mineral Atlas) 生成',
    ].join('\n');

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `鉴定记录_${m.nameCN}_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  }

  return (
    <section className="panel p-4 space-y-3">
      <div className="text-[12px] font-medium text-ink-bright">鉴定工作台操作</div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => addToBench(mineralId)}
          disabled={inBench || benchIds.length >= 6}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {inBench ? '已在工作台' : benchIds.length >= 6 ? '工作台已满（6）' : '加入鉴定工作台'}
        </button>
        <button
          type="button"
          onClick={() => toggleFavorite(mineralId)}
          className={faved ? 'btn-ghost !text-amber-gold !border-amber-gold/40' : 'btn-ghost'}
        >
          {faved ? '★ 已收藏' : '☆ 收藏'}
        </button>
      </div>
      {compareIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] text-ink-faint">快速比较：</span>
          {compareIds.map((id) => (
            <Link key={id} href={`/compare?ids=${mineralId},${id}`} className="chip chip-hover">
              {getMineralById(id)?.nameCN || id}
            </Link>
          ))}
        </div>
      )}
      <button type="button" onClick={exportMarkdown} className="w-full btn-ghost">
        {exported ? `✓ ${mineralName} 记录已下载` : '导出鉴定记录草稿（Markdown）'}
      </button>
    </section>
  );
}