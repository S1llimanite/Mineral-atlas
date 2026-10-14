import type { Mineral } from '@/types/mineral';

/**
 * 矿物数据构造辅助函数
 * 统一填充 lastReviewed 与默认示意模型资产，族文件只需提供核心数据
 */
export function M(
  m: Omit<Mineral, 'lastReviewed' | 'assets'> & {
    lastReviewed?: string;
    assets?: Mineral['assets'];
  }
): Mineral {
  return {
    ...m,
    lastReviewed: m.lastReviewed || '2026-10-13',
    assets:
      m.assets ||
      ({
        crystalModel: {
          id: `${m.id}-proc-001`,
          mineralId: m.id,
          modelType: 'procedural_schematic',
          generator: 'CrystalViewer procedural generator',
          generatedAt: '2026-10-13',
          reviewStatus: 'schematic',
          notes: '依晶系与习性的程序化示意模型，非精确晶面重建',
        },
      } as Mineral['assets']),
  };
}