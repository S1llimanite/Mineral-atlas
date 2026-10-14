// 矿物数据模型类型定义
// 所有字段设计遵循 SCIENTIFIC_DATA_POLICY.md 的科学准确性约束

/** 数据完整性状态 */
export type DataStatus =
  | 'verified'    // 有可靠来源并经过审核
  | 'reviewed'    // 已专业检查，仍需补充验证
  | 'provisional' // 来源明确，但存在范围/条件不确定性
  | 'schematic'   // 示意模型或示意内容
  | 'draft'        // 待审核
  | 'missing';     // 尚未收集到可靠数据

/**
 * 晶系
 * 允许带限定语的写法，如 '单斜晶系（假斜方）'、'等轴晶系（非晶质）'，
 * 因为部分矿物（同质多象、假等轴）需要注明。
 */
export type CrystalSystem = string;

/** 矿物大类 */
export type MineralClass = string;

/** 硅酸盐结构亚类（允许带结构说明，如 '岛状硅酸盐（双岛状过渡）'） */
export type SilicateSubclass = string;

/** 模型类型 */
export type ModelType =
  | 'procedural_schematic' // 程序化示意模型
  | 'blender_ideal'        // Blender 制作的理想晶形
  | 'verified_reconstruction' // 经文献验证的重建模型
  | 'missing';

/** 单偏光（PPL）特征 */
export interface PPLProperties {
  color: string;          // 颜色及变化范围
  pleochroism: string;   // 多色性
  relief: string;          // 突起等级
  cleavage: string;       // 解理
  form: string;           // 晶体轮廓与形态
  transparency: string;    // 透明度
  inclusions?: string;     // 常见包裹体
  alteration?: string;     // 典型蚀变
  notes?: string;          // 其他特征
}

/** 正交偏光（XPL）特征 */
export interface XPLProperties {
  interferenceColor: string; // 干涉色及级序
  birefringence: string;     // 双折射率（含数值与依据）
  extinction: string;         // 消光类型
  extinctionAngle?: string;    // 消光角及条件
  twinning?: string;           // 双晶类型（不透明矿物可缺省）
  zoning?: string;              // 环带构造
  undulatory?: string;          // 波状消光
  anomalousColor?: string;     // 异常干涉色
  notes?: string;
}

/** 锥光特征 */
export interface ConoscopicProperties {
  opticType: '一轴晶' | '二轴晶' | '均质体' | '不透明' | '待补充';
  opticSign?: string;  // "正(+)", "负(-)", "正(+) 或负(-)，依成分" 等描述
  '2V'?: string;              // 光轴角，含测量条件
  opticAxialAngle?: string;
  notes?: string;
}

/** 晶体学属性 */
export interface CrystalProperties {
  system: CrystalSystem;
  pointGroup?: string;       // 点群（对称性）
  spaceGroup?: string;        // 空间群
  cellParams?: {              // 晶胞参数
    a?: string; b?: string; c?: string;
    alpha?: string; beta?: string; gamma?: string;
    conditions?: string;      // 适用条件（成分/温度/压力）
  };
  habit: string;              // 晶体习性
  cleavage: string;            // 解理
  fracture?: string;          // 断口
  hardness?: string;          // 摩斯硬度
  density?: string;            // 密度（g/cm³）
  notes?: string;
}

/** 来源引用 */
export interface Reference {
  id: string;
  type: 'handbook' | 'textbook' | 'paper' | 'database' | 'website';
  authors: string;
  title: string;
  year?: string;
  publisher?: string;
  pages?: string;
  url?: string;
  accessed?: string;
  license?: string;
}

/** 属性-来源关联 */
export interface PropertySource {
  property: string;     // 属性路径，如 'optical.birefringence'
  referenceId: string;  // 关联 Reference.id
  notes?: string;       // 适用条件、原文摘录或解释
}

/** 三维模型资产 */
export interface CrystalAsset {
  id: string;
  mineralId: string;
  modelType: ModelType;
  filePath?: string;          // /models/xxx.glb
  generator?: string;          // 生成器或作者
  generatedAt?: string;        // ISO 日期
  reviewStatus: DataStatus;
  notes?: string;              // 模型限制说明
}

/** 矿物实体 */
export interface Mineral {
  id: string;                  // 稳定唯一 ID，如 'quartz'
  nameCN: string;
  nameEN: string;
  aliases?: string[];
  formula: string;             // 化学式，保留非化学计量
  mineralClass: MineralClass;
  silicateSubclass?: SilicateSubclass;
  crystal: CrystalProperties;
  optical: {
    ppl: PPLProperties;
    xpl: XPLProperties;
    conoscopic: ConoscopicProperties;
  };
  occurrence: string;          // 常见产状
  associations?: string;        // 共生矿物
  alteration?: string;          // 蚀变产物
  distinguishing?: string;      // 易混淆矿物及鉴别依据
  dataStatus: DataStatus;
  lastReviewed: string;        // ISO 日期
  assets: {
    crystalModel?: CrystalAsset;
    micrographs?: Array<{
      id: string;
      type: 'PPL' | 'XPL' | 'conoscopic' | 'schematic';
      path?: string;
      source?: string;
      license?: string;
      isReal: boolean;        // 是否真实显微照片
    }>;
  };
}