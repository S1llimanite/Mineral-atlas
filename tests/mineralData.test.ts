// 矿物数据完整性测试
import { MINERALS, PROPERTY_SOURCES } from '@/data/minerals';
import { REFERENCES } from '@/data/references';
import { identifyMinerals, searchMinerals, getMineralById } from '@/lib/mineralStore';

describe('Mineral data integrity', () => {
  test('all minerals have required non-empty fields', () => {
    for (const m of MINERALS) {
      expect(m.id).toMatch(/^[a-z-]+$/);
      expect(m.nameCN.length).toBeGreaterThan(0);
      expect(m.nameEN.length).toBeGreaterThan(0);
      expect(m.formula.length).toBeGreaterThan(0);
      expect(m.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  test('all ids are unique', () => {
    const ids = MINERALS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('dataStatus is valid enum', () => {
    const valid = ['verified', 'reviewed', 'provisional', 'schematic', 'draft', 'missing'];
    for (const m of MINERALS) {
      expect(valid).toContain(m.dataStatus);
    }
  });

  test('isometric transparent minerals are isotropic; opaque ones note the caveat', () => {
    for (const m of MINERALS) {
      if (!m.crystal.system.includes('等轴')) continue;
      // 等轴晶系透明矿物必须为均质体
      if (m.optical.conoscopic.opticType !== '不透明') {
        expect(m.optical.conoscopic.opticType).toBe('均质体');
      } else {
        // 若标不透明，必须在 notes 或 birefringence 中说明
        const blob = (m.optical.conoscopic.notes || '') + m.optical.xpl.birefringence;
        expect(blob).toMatch(/不透明|均质/);
      }
    }
  });

  test('each property source referenceId exists in REFERENCES', () => {
    for (const ps of PROPERTY_SOURCES) {
      expect(REFERENCES[ps.referenceId]).toBeDefined();
    }
  });

  test('birefringence contains numeric value or opaque marker', () => {
    for (const m of MINERALS) {
      expect(m.optical.xpl.birefringence).toMatch(/\d|不透明/);
    }
  });
});

describe('Search and access functions', () => {
  test('searchMinerals returns all when empty query', () => {
    expect(searchMinerals('').length).toBe(MINERALS.length);
  });

  test('searchMinerals matches Chinese name', () => {
    expect(searchMinerals('石英').length).toBe(1);
  });

  test('searchMinerals matches English name case-insensitive', () => {
    expect(searchMinerals('QUARTZ').length).toBe(1);
  });

  test('searchMinerals matches alias', () => {
    const r = searchMinerals('augite');
    expect(r.length).toBeGreaterThanOrEqual(1);
  });

  test('getMineralById returns mineral or undefined', () => {
    expect(getMineralById('quartz')?.nameCN).toBe('石英');
    expect(getMineralById('nonexistent')).toBeUndefined();
  });
});

describe('Identification scoring rules', () => {
  test('isometric + isotropic → garnet', () => {
    const r = identifyMinerals({ system: '等轴晶系' });
    const ids = r.map((x) => x.mineral.id);
    expect(ids).toContain('garnet');
    const g = r.find((x) => x.mineral.id === 'garnet');
    expect(g!.matchScore).toBe(100);
  });

  test('flash relief (闪突起) matches carbonate group', () => {
    const r = identifyMinerals({ reliefKeywords: ['闪突起'] });
    // 闪突起是碳酸盐族（方解石-白云石-菱铁矿-菱镁矿-文石）的特征
    expect(r.length).toBeGreaterThan(0);
    for (const x of r) {
      expect(x.mineral.mineralClass).toBe('碳酸盐');
    }
    // 方解石应排在前列（典型代表）
    expect(r.map((x) => x.mineral.id)).toContain('calcite');
  });

  test('数据库规模达到目标（80+ 种）', () => {
    expect(MINERALS.length).toBeGreaterThanOrEqual(80);
  });

  test('所有矿物都有唯一 ID 与示意模型资产', () => {
    for (const m of MINERALS) {
      expect(m.assets.crystalModel?.modelType).toBe('procedural_schematic');
      expect(m.assets.crystalModel?.reviewStatus).toBe('schematic');
    }
  });

  test('low birefringence includes quartz', () => {
    const r = identifyMinerals({ birefringenceLevel: 'low' });
    const ids = r.map((x) => x.mineral.id);
    expect(ids).toContain('quartz');
  });

  test('no filters returns all', () => {
    const r = identifyMinerals({});
    // 未设条件，所有矿物"unmatched.length === 0"，全部入选
    expect(r.length).toBe(MINERALS.length);
  });

  test('conflicting filters produce low-score candidates', () => {
    // 闪突起 + 等轴晶系：方解石匹配闪突起但不匹配等轴；石榴子石反之
    // 两者都应入选，但 matchScore 都不应为 100
    const r = identifyMinerals({
      reliefKeywords: ['闪突起'],
      system: '等轴晶系',
    });
    expect(r.length).toBeGreaterThan(0);
    for (const x of r) {
      expect(x.matchScore).toBeLessThan(100);
      expect(x.unmatchedCriteria.length).toBeGreaterThan(0);
    }
  });
});