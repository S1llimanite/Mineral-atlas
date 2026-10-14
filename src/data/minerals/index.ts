import type { Mineral } from '@/types/mineral';
import { FRAMEWORK_MINERALS } from './framework';
import { SHEET_MINERALS } from './sheet';
import { SINGLE_CHAIN_MINERALS } from './singleChain';
import { DOUBLE_CHAIN_MINERALS } from './doubleChain';
import { ISLAND_MINERALS } from './island';
import { RING_MINERALS } from './ring';
import { NONSILICATE_MINERALS } from './nonsilicates';
import { OPAQUE_MINERALS } from './opaques';
import { EXTRA_MINERALS } from './extras';

/**
 * 全部矿物数据汇总
 * 按结构分族（8 个文件）：
 * - framework     架状硅酸盐（石英族、长石族、似长石）
 * - sheet         层状硅酸盐（云母族、绿泥石、蛇纹石、滑石、高岭石）
 * - singleChain   单链硅酸盐（辉石族）
 * - doubleChain   双链硅酸盐（角闪石族）
 * - island        岛状硅酸盐（橄榄石、锆石、榍石、绿帘石、Al₂SiO₅ 三形等）
 * - ring          环状硅酸盐（电气石、绿柱石、堇青石）
 * - nonsilicates  碳酸盐、硫酸盐、磷酸盐、卤化物
 * - opaques       氧化物、硫化物、自然元素（含不透明矿物）
 * - extras        方沸石、菱镁矿、铁闪石、水镁石、硬柱石
 */
export const MINERALS: Mineral[] = [
  ...FRAMEWORK_MINERALS,
  ...SHEET_MINERALS,
  ...SINGLE_CHAIN_MINERALS,
  ...DOUBLE_CHAIN_MINERALS,
  ...ISLAND_MINERALS,
  ...RING_MINERALS,
  ...NONSILICATE_MINERALS,
  ...OPAQUE_MINERALS,
  ...EXTRA_MINERALS,
];

export const MINERAL_CLASS_COUNTS = {
  framework: FRAMEWORK_MINERALS.length,
  sheet: SHEET_MINERALS.length,
  singleChain: SINGLE_CHAIN_MINERALS.length,
  doubleChain: DOUBLE_CHAIN_MINERALS.length,
  island: ISLAND_MINERALS.length,
  ring: RING_MINERALS.length,
  nonsilicate: NONSILICATE_MINERALS.length,
  opaque: OPAQUE_MINERALS.length,
};

// 矿物分类树（可配置）
export const CLASSIFICATION_TREE = [
  { class: '硅酸盐', subclasses: ['岛状硅酸盐', '双岛状硅酸盐', '环状硅酸盐', '单链硅酸盐', '双链硅酸盐', '层状硅酸盐', '架状硅酸盐'] },
  { class: '氧化物与氢氧化物' },
  { class: '碳酸盐' },
  { class: '硫化物' },
  { class: '卤化物' },
  { class: '硫酸盐' },
  { class: '磷酸盐' },
  { class: '自然元素' },
  { class: '其他' },
];

// 属性-来源映射
export const PROPERTY_SOURCES = [
  { property: 'crystal.cellParams', referenceId: 'rruff', notes: 'RRUFF 晶体学数据库' },
  { property: 'crystal.system', referenceId: 'klein2007' },
  { property: 'optical.birefringence', referenceId: 'nesse2013', notes: 'Nesse 教科书典型值' },
  { property: 'optical.ppl', referenceId: 'nesse2013' },
  { property: 'optical.xpl', referenceId: 'nesse2013' },
  { property: 'optical.conoscopic', referenceId: 'nesse2013' },
  { property: 'occurrence', referenceId: 'dhz2013' },
  { property: 'chemicalFormula', referenceId: 'mindat' },
];
