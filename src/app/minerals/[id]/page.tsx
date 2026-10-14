import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMineralById, getAllMinerals, getReferenceById, PROPERTY_SOURCES } from '@/lib/mineralStore';
import { StatusBadge } from '@/components/StatusBadge';
import { CrystalViewer } from '@/components/CrystalViewer';
import { FeatureChecklist, BenchActions } from '@/components/BenchActions';
import { ThinSectionSimulator } from '@/components/ThinSectionSimulator';

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return getAllMinerals().map((m) => ({ id: m.id }));
}

export default function MineralDetailPage({ params }: PageProps) {
  const m = getMineralById(params.id);
  if (!m) return notFound();

  const usedRefs = Array.from(new Set(PROPERTY_SOURCES.map((p) => p.referenceId)))
    .map((rid) => getReferenceById(rid))
    .filter(Boolean);

  // 用于比较：同族优先，否则前两个
  const others = getAllMinerals()
    .filter((x) => x.id !== m.id)
    .sort((a, b) => {
      const sa = a.silicateSubclass === m.silicateSubclass && a.mineralClass === m.mineralClass ? 0 : 1;
      const sb = b.silicateSubclass === m.silicateSubclass && b.mineralClass === m.mineralClass ? 0 : 1;
      return sa - sb;
    })
    .slice(0, 3)
    .map((x) => x.id);

  return (
    <div className="space-y-8">
      {/* 顶部信息区 */}
      <header className="border-b border-hair pb-5">
        <div className="flex items-center gap-2 text-[11px] text-ink-faint">
          <Link href="/minerals" className="hover:text-moon transition-colors">矿物目录</Link>
          <span>/</span>
          <span className="text-ink-mid">{m.nameCN}</span>
        </div>
        <div className="mt-2 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[32px] font-serif text-ink-bright leading-tight">{m.nameCN}</h1>
            <div className="text-[13px] text-ink-faint font-mono mt-1">{m.nameEN}</div>
          </div>
          <StatusBadge status={m.dataStatus} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="chip">{m.mineralClass}</span>
          {m.silicateSubclass && <span className="chip">{m.silicateSubclass}</span>}
          <span className="chip">{m.crystal.system}</span>
          {m.crystal.pointGroup && <span className="chip">{m.crystal.pointGroup}</span>}
          {m.crystal.spaceGroup && <span className="chip font-mono">{m.crystal.spaceGroup}</span>}
        </div>
        <div className="mt-4 text-[15px] font-serif italic text-emerald-crystal">{m.formula}</div>
        {m.aliases && m.aliases.length > 0 && (
          <div className="mt-1.5 text-[11px] text-ink-faint">别名：{m.aliases.join(' · ')}</div>
        )}
        <div className="mt-1.5 text-[10px] font-mono text-ink-faint">
          最后审核 {m.lastReviewed} · 名录版本 IMA-RRUFF 2024-01
        </div>
      </header>

      {/* 双栏主体（v0.5：左右两栏高度重新配平，消除右栏底部大片空白） */}
      <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
        {/* 左栏 */}
        <div className="space-y-6 min-w-0">
          {/* 薄片图像交互区（核心） */}
          <section>
            <SectionTitle index="01" title="薄片鉴定图像交互" subtitle="THIN SECTION SIMULATOR" />
            <ThinSectionSimulator mineral={m} height={440} />
            <div className="mt-2 text-[10.5px] text-ink-faint leading-relaxed">
              基于真实光学物理的程序化模拟：晶粒取向、消光行为与干涉色均按
              马吕斯定律与 Michel-Lévy 色表计算，可练习旋转载物台的观察方法。
              <span className="text-ink-mid">非真实显微照片</span>——真实薄片图像待有授权素材后接入。
            </div>
          </section>

          {/* 3D */}
          <section>
            <SectionTitle index="02" title="三维晶体模型" subtitle="CRYSTAL VIEWER" />
            <CrystalViewer mineral={m} height={420} />
            <div className="mt-2 text-[10px] text-ink-faint leading-relaxed">
              鼠标左键拖动旋转 · 滚轮缩放 · 右键平移。当前为程序化
              <span className="font-mono text-status-schematic"> schematic </span>
              示意模型，仅展示典型晶系与习性轮廓，不构成精确晶面重建。
            </div>
          </section>

          {/* 薄片观察 PPL/XPL */}
          <section>
            <SectionTitle index="03" title="薄片观察特征" subtitle="THIN SECTION" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="panel p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-moon" />
                  <span className="text-[12px] font-medium text-ink-bright">单偏光 PPL</span>
                </div>
                <table className="sci-table">
                  <tbody>
                    <Row k="颜色" v={m.optical.ppl.color} />
                    <Row k="多色性" v={m.optical.ppl.pleochroism} />
                    <Row k="突起" v={m.optical.ppl.relief} />
                    <Row k="解理裂隙" v={m.optical.ppl.cleavage} />
                    <Row k="形态" v={m.optical.ppl.form} />
                    <Row k="透明度" v={m.optical.ppl.transparency} />
                    {m.optical.ppl.inclusions && <Row k="包裹体" v={m.optical.ppl.inclusions} />}
                    {m.optical.ppl.alteration && <Row k="典型蚀变" v={m.optical.ppl.alteration} />}
                  </tbody>
                </table>
              </div>
              <div className="panel p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-crystal" />
                  <span className="text-[12px] font-medium text-ink-bright">正交偏光 XPL</span>
                </div>
                <table className="sci-table">
                  <tbody>
                    <Row k="干涉色" v={m.optical.xpl.interferenceColor} />
                    <Row k="双折射率" v={m.optical.xpl.birefringence} />
                    <Row k="消光类型" v={m.optical.xpl.extinction} />
                    {m.optical.xpl.extinctionAngle && <Row k="消光角" v={m.optical.xpl.extinctionAngle} />}
                    <Row k="双晶" v={m.optical.xpl.twinning} />
                    {m.optical.xpl.zoning && <Row k="环带" v={m.optical.xpl.zoning} />}
                    {m.optical.xpl.undulatory && <Row k="波状消光" v={m.optical.xpl.undulatory} />}
                    {m.optical.xpl.anomalousColor && <Row k="异常干涉色" v={m.optical.xpl.anomalousColor} />}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 panel p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-gold" />
                <span className="text-[12px] font-medium text-ink-bright">锥光特征 CONOSCOPIC</span>
              </div>
              <table className="sci-table">
                <tbody>
                  <Row k="光性" v={m.optical.conoscopic.opticType} />
                  {m.optical.conoscopic.opticSign && (
                    <Row k="光性符号" v={m.optical.conoscopic.opticSign} />
                  )}
                  {m.optical.conoscopic['2V'] && <Row k="光轴角 2V" v={m.optical.conoscopic['2V']} />}
                  {m.optical.conoscopic.notes && <Row k="备注" v={m.optical.conoscopic.notes} />}
                </tbody>
              </table>
            </div>
          </section>

          {/* 晶体学性质 */}
          <section>
            <SectionTitle index="05" title="晶体学性质" subtitle="CRYSTALLOGRAPHY" />
            <div className="panel p-4">
              <table className="sci-table">
                <tbody>
                  <Row k="晶系" v={m.crystal.system} />
                  <Row k="点群" v={m.crystal.pointGroup || '待补充'} />
                  <Row k="空间群" v={m.crystal.spaceGroup || '待补充'} />
                  {m.crystal.cellParams && (
                    <>
                      <Row
                        k="晶胞 a, b, c"
                        v={[m.crystal.cellParams.a, m.crystal.cellParams.b, m.crystal.cellParams.c].filter(Boolean).join(' ; ') || '待补充'}
                      />
                      <Row
                        k="晶胞 α, β, γ"
                        v={[m.crystal.cellParams.alpha, m.crystal.cellParams.beta, m.crystal.cellParams.gamma].filter(Boolean).join(' ; ') || '待补充'}
                      />
                      {m.crystal.cellParams.conditions && (
                        <Row k="适用条件" v={m.crystal.cellParams.conditions} />
                      )}
                    </>
                  )}
                  <Row k="晶体习性" v={m.crystal.habit} />
                  <Row k="解理" v={m.crystal.cleavage} />
                  {m.crystal.fracture && <Row k="断口" v={m.crystal.fracture} />}
                  {m.crystal.hardness && <Row k="硬度（摩斯）" v={m.crystal.hardness} />}
                  {m.crystal.density && <Row k="密度" v={m.crystal.density} />}
                  {m.crystal.notes && <Row k="备注" v={m.crystal.notes} />}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* 右栏 */}
        <div className="space-y-6">
          {/* 光学性质速查卡（v0.5 移至右栏顶部，配平双栏高度） */}
          <section>
            <SectionTitle index="04" title="光学性质速查卡" subtitle="QUICK REFERENCE" />
            <QuickCard m={m} />
          </section>

          {/* 鉴定特征清单（可勾选） */}
          <FeatureChecklist mineral={m} />

          {/* 产状与共生 */}
          <section>
            <SectionTitle index="05" title="产状与共生" subtitle="OCCURRENCE" />
            <div className="panel p-4">
              <table className="sci-table">
                <tbody>
                  <Row k="常见产状" v={m.occurrence} />
                  {m.associations && <Row k="共生矿物" v={m.associations} />}
                  {m.alteration && <Row k="蚀变产物" v={m.alteration} />}
                </tbody>
              </table>
            </div>
          </section>

          {/* 鉴别要点 */}
          {m.distinguishing && (
            <section>
              <SectionTitle index="06" title="易混淆矿物及鉴别" subtitle="DIAGNOSIS" />
              <div className="p-4 panel border-l-2 border-l-amber-gold/60">
                <div className="text-[13px] text-ink-mid leading-relaxed">{m.distinguishing}</div>
              </div>
            </section>
          )}

          {/* 加入工作台 / 比较 */}
          <BenchActions mineralId={m.id} mineralName={m.nameCN} compareIds={others} />

          {/* 模型元数据 */}
          <section>
            <SectionTitle index="07" title="模型与数据元数据" subtitle="METADATA" />
            <div className="panel p-4 space-y-1.5 text-[12px]">
              <KV k="资产 ID" v={m.assets.crystalModel?.id || '—'} />
              <KV k="模型类型" v={m.assets.crystalModel?.modelType || '—'} />
              <KV k="生成器" v={m.assets.crystalModel?.generator || '—'} />
              <KV k="生成时间" v={m.assets.crystalModel?.generatedAt || '—'} />
              <KV
                k="模型审核状态"
                v={<StatusBadge status={m.assets.crystalModel?.reviewStatus || 'missing'} small />}
              />
              {m.assets.crystalModel?.notes && <KV k="模型备注" v={m.assets.crystalModel.notes} />}
            </div>
          </section>

          {/* 资料来源 */}
          <section>
            <SectionTitle index="08" title="资料来源" subtitle="REFERENCES" />
            <div className="space-y-2">
              {usedRefs.map((r) => (
                <div key={r!.id} className="p-3 panel-raised text-[12px]">
                  <div className="font-medium text-ink-bright text-[12.5px]">{r!.authors}</div>
                  <div className="font-serif italic text-ink-mid leading-snug">{r!.title}</div>
                  <div className="mt-1 text-[10px] font-mono text-ink-faint">
                    {r!.year} · {r!.publisher || r!.url}
                  </div>
                  {r!.license && <span className="chip mt-1.5">{r!.license}</span>}
                </div>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-ink-faint leading-relaxed">
              光学属性主要依据 Nesse (2013)；晶体学参数依据 RRUFF；化学式与产状依据 Mindat 与
              Deer/Howie/Zussman。标注"近似"的参数表示随成分或观察条件变化。
            </div>
          </section>
        </div>
      </div>

      {/* 三种形态区分提示 */}
      <section className="panel p-4">
        <div className="text-[12px] font-medium text-ink-bright mb-2">三种形态严格区分</div>
        <div className="grid sm:grid-cols-3 gap-3 text-[11px] text-ink-mid leading-relaxed">
          <div>
            <span className="text-moon">理想晶形</span>
            ：上方 3D 模型的展示对象。体现晶系与习性，非实测晶面重建。
          </div>
          <div>
            <span className="text-emerald-crystal">岩石中实际产状</span>
            ：{m.crystal.habit}；常见于 {m.occurrence}
          </div>
          <div>
            <span className="text-amber-gold">薄片观察</span>
            ：见 PPL/XPL 表格。受切片方向、厚度与观察条件影响，不可由 3D 模型直接推断。
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ index, title, subtitle }: { index: string; title: string; subtitle: string }) {
  return (
    <div className="section-title">
      <span className="idx">{index}</span>
      <span className="txt">{title}</span>
      <span className="sub">{subtitle}</span>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <tr>
      <th>{k}</th>
      <td>{v}</td>
    </tr>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-ink-faint shrink-0">{k}</span>
      <span className="text-ink-mid text-right break-all">{v}</span>
    </div>
  );
}

/** 光学速查卡：可一键复制的核心参数 */
function QuickCard({ m }: { m: ReturnType<typeof getMineralById> & {} }) {
  const items = [
    { label: '折射率/双折射', value: m!.optical.xpl.birefringence },
    { label: '光性', value: `${m!.optical.conoscopic.opticType}${m!.optical.conoscopic.opticSign ? ' ' + m!.optical.conoscopic.opticSign : ''}` },
    { label: '干涉色', value: m!.optical.xpl.interferenceColor },
    { label: '消光', value: m!.optical.xpl.extinction + (m!.optical.xpl.extinctionAngle ? ` · ${m!.optical.xpl.extinctionAngle}` : '') },
    { label: '解理', value: m!.optical.ppl.cleavage },
    { label: '突起', value: m!.optical.ppl.relief },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
      {items.map((it) => (
        <div key={it.label} className="p-3 panel-raised">
          <div className="text-[9.5px] font-mono text-ink-faint tracking-wider uppercase">{it.label}</div>
          <div className="mt-1 text-[12px] text-ink-bright leading-snug line-clamp-3">{it.value}</div>
        </div>
      ))}
    </div>
  );
}