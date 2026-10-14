import { MINERALS, CLASSIFICATION_TREE, PROPERTY_SOURCES } from '@/data/minerals';
import { REFERENCES } from '@/data/references';
import type { Mineral, MineralClass, CrystalSystem } from '@/types/mineral';

// 透出数据来源映射，供详情页使用
export { PROPERTY_SOURCES };

// === 数据访问辅助函数 ===

export function getAllMinerals(): Mineral[] {
  return MINERALS;
}

export function getMineralById(id: string): Mineral | undefined {
  return MINERALS.find((m) => m.id === id);
}

export function getMineralByEName(name: string): Mineral | undefined {
  const lower = name.toLowerCase().trim();
  return MINERALS.find(
    (m) =>
      m.nameEN.toLowerCase() === lower ||
      m.aliases?.some((a) => a.toLowerCase() === lower)
  );
}

export function searchMinerals(query: string): Mineral[] {
  const q = query.toLowerCase().trim();
  if (!q) return MINERALS;
  return MINERALS.filter(
    (m) =>
      m.nameCN.toLowerCase().includes(q) ||
      m.nameEN.toLowerCase().includes(q) ||
      m.formula.toLowerCase().includes(q) ||
      m.aliases?.some((a) => a.toLowerCase().includes(q))
  );
}

export function getMineralsByClass(cls: MineralClass): Mineral[] {
  return MINERALS.filter((m) => m.mineralClass === cls);
}

export function getMineralsBySystem(system: CrystalSystem): Mineral[] {
  // 兼容"三方晶系" + "六方晶系" 复合字符串
  return MINERALS.filter((m) => m.crystal.system.includes(system));
}

export function getReferenceById(id: string) {
  return REFERENCES[id];
}

export function getClassificationTree() {
  return CLASSIFICATION_TREE;
}

// === 覆盖率统计 ===
export interface CoverageStats {
  totalMinerals: number;        // 已收录
  withVerifiedStatus: number;
  withCrystallography: number; // 有晶胞参数
  withOpticalPPL: number;
  withOpticalXPL: number;
  withConoscopic: number;
  with3DModel: number;          // 有（示意或验证）模型
  withVerifiedModel: number;
  classificationTree: Array<{ class: string; count: number }>;
}

export function getCoverageStats(): CoverageStats {
  const stats = {
    totalMinerals: MINERALS.length,
    withVerifiedStatus: 0,
    withCrystallography: 0,
    withOpticalPPL: 0,
    withOpticalXPL: 0,
    withConoscopic: 0,
    with3DModel: 0,
    withVerifiedModel: 0,
    classificationTree: CLASSIFICATION_TREE.map((c) => ({
      class: c.class,
      count: 0,
    })),
  };

  for (const m of MINERALS) {
    if (m.dataStatus === 'verified') stats.withVerifiedStatus++;
    if (m.crystal.cellParams) stats.withCrystallography++;
    if (m.optical.ppl.color) stats.withOpticalPPL++;
    if (m.optical.xpl.interferenceColor) stats.withOpticalXPL++;
    if (m.optical.conoscopic.opticType !== '待补充') stats.withConoscopic++;
    if (m.assets.crystalModel && m.assets.crystalModel.modelType !== 'missing') stats.with3DModel++;
    if (m.assets.crystalModel?.reviewStatus === 'verified') stats.withVerifiedModel++;

    const classIdx = stats.classificationTree.findIndex((c) => c.class === m.mineralClass);
    if (classIdx >= 0) stats.classificationTree[classIdx].count++;
  }

  return stats;
}

// === 鉴定工作台：基于规则的筛选 ===
export interface IdentificationFilters {
  // PPL
  reliefKeywords?: string[];     // 例如 ['高突起', '中-高突起']
  colorHue?: string;             // 颜色关键词，如 '褐', '绿', '无色'
  pleochroic?: 'yes' | 'no' | null;
  cleavageKeywords?: string[];   // 例如 ['极完全', '两组', '56°']
  // XPL
  birefringenceLevel?: 'low' | 'medium' | 'high' | 'extreme' | null;
  extinctionMode?: 'parallel' | 'oblique' | 'symmetric' | null;
  twinningKeywords?: string[];
  // 晶系
  system?: CrystalSystem | null;
  // 大类
  mineralClass?: MineralClass | null;
}

export interface IdentificationResult {
  mineral: Mineral;
  matchScore: number;      // 0-100
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  missingCriteria: string[];
}

function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k));
}

function birefringenceLevelOf(dStr: string): 'low' | 'medium' | 'high' | 'extreme' {
  // 从字符串中提取双折射率数值
  const m = dStr.match(/(\d+\.?\d*)/);
  if (!m) return 'low';
  const v = parseFloat(m[1]);
  if (v >= 0.1) return 'extreme';
  if (v >= 0.03) return 'high';
  if (v >= 0.012) return 'medium';
  return 'low';
}

export function identifyMinerals(filters: IdentificationFilters): IdentificationResult[] {
  const results: IdentificationResult[] = [];
  const totalCriteria = [
    filters.reliefKeywords,
    filters.colorHue,
    filters.pleochroic != null,
    filters.cleavageKeywords,
    filters.birefringenceLevel != null,
    filters.extinctionMode != null,
    filters.twinningKeywords,
    filters.system,
    filters.mineralClass,
  ].filter(Boolean).length;

  for (const m of MINERALS) {
    const matched: string[] = [];
    const unmatched: string[] = [];
    const missing: string[] = [];
    let hits = 0;

    // PPL 突起
    if (filters.reliefKeywords && filters.reliefKeywords.length) {
      const reliefTxt = m.optical.ppl.relief;
      if (containsAny(reliefTxt, filters.reliefKeywords)) {
        matched.push(`突起匹配：${reliefTxt}`);
        hits++;
      } else {
        unmatched.push(`突起不符：${reliefTxt}（要求：${filters.reliefKeywords.join('/')}）`);
      }
    }

    // PPL 颜色
    if (filters.colorHue) {
      const colorTxt = m.optical.ppl.color;
      if (colorTxt.includes(filters.colorHue)) {
        matched.push(`颜色匹配：含"${filters.colorHue}"`);
        hits++;
      } else {
        unmatched.push(`颜色不符：${colorTxt}（要求含：${filters.colorHue}）`);
      }
    }

    // 多色性
    if (filters.pleochroic === 'yes') {
      const txt = m.optical.ppl.pleochroism;
      if (txt.includes('强') || txt.includes('明显')) {
        matched.push('具多色性');
        hits++;
      } else if (txt.includes('无')) {
        unmatched.push(`无多色性（${txt}）`);
      } else {
        missing.push('多色性描述不明确');
      }
    }
    if (filters.pleochroic === 'no') {
      if (m.optical.ppl.pleochroism.includes('无')) {
        matched.push('无多色性');
        hits++;
      }
    }

    // PPL 解理
    if (filters.cleavageKeywords && filters.cleavageKeywords.length) {
      const clrTxt = m.optical.ppl.cleavage + ' ' + m.crystal.cleavage;
      if (containsAny(clrTxt, filters.cleavageKeywords)) {
        matched.push(`解理匹配：${clrTxt}`);
        hits++;
      } else {
        unmatched.push(`解理不符：${clrTxt}（要求：${filters.cleavageKeywords.join('/')}）`);
      }
    }

    // XPL 双折射率级别
    if (filters.birefringenceLevel) {
      const lvl = birefringenceLevelOf(m.optical.xpl.birefringence);
      if (lvl === filters.birefringenceLevel) {
        matched.push(`双折射率级别匹配：${lvl}（${m.optical.xpl.birefringence}）`);
        hits++;
      } else {
        unmatched.push(`双折射率级别不符：${lvl}（要求：${filters.birefringenceLevel}）`);
      }
    }

    // XPL 消光方式
    if (filters.extinctionMode) {
      const extTxt = m.optical.xpl.extinction;
      const hasParallel = extTxt.includes('平行');
      const hasOblique = extTxt.includes('斜');
      const hasSymmetric = extTxt.includes('对称');
      const hasFull = extTxt.includes('全消光') || extTxt.includes('均质');
      const m2 =
        (filters.extinctionMode === 'parallel' && (hasParallel || hasFull)) ||
        (filters.extinctionMode === 'oblique' && hasOblique) ||
        (filters.extinctionMode === 'symmetric' && hasSymmetric);
      if (m2) {
        matched.push(`消光方式匹配：${extTxt}`);
        hits++;
      } else {
        unmatched.push(`消光方式不符：${extTxt}（要求：${filters.extinctionMode}）`);
      }
    }

    // XPL 双晶
    if (filters.twinningKeywords && filters.twinningKeywords.length) {
      const twTxt = m.optical.xpl.twinning || '待补充';
      if (containsAny(twTxt, filters.twinningKeywords)) {
        matched.push(`双晶匹配：${twTxt}`);
        hits++;
      } else {
        unmatched.push(`双晶不符：${twTxt}（要求：${filters.twinningKeywords.join('/')}）`);
      }
    }

    // 晶系
    if (filters.system) {
      if (m.crystal.system.includes(filters.system)) {
        matched.push(`晶系匹配：${m.crystal.system}`);
        hits++;
      } else {
        unmatched.push(`晶系不符：${m.crystal.system}（要求：${filters.system}）`);
      }
    }

    // 大类
    if (filters.mineralClass) {
      if (m.mineralClass === filters.mineralClass) {
        matched.push(`大类匹配：${m.mineralClass}`);
        hits++;
      } else {
        unmatched.push(`大类不符：${m.mineralClass}（要求：${filters.mineralClass}）`);
      }
    }

    const score = totalCriteria > 0 ? Math.round((hits / totalCriteria) * 100) : 0;
    // 至少有一个匹配才入选候选
    if (hits > 0 || unmatched.length === 0) {
      results.push({
        mineral: m,
        matchScore: score,
        matchedCriteria: matched,
        unmatchedCriteria: unmatched,
        missingCriteria: missing,
      });
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}