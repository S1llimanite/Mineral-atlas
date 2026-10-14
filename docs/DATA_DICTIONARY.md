# 数据字典

本字典详述矿物数据库主要字段的含义、类型、单位、校验规则与数据来源要求。

## 1. 实体 Mineral（矿物主信息）

| 字段 | 类型 | 必填 | 单位 | 说明 | 来源要求 |
|---|---|---|---|---|---|
| id | string | ✅ | — | 稳定唯一 ID（小写英文连字符） | 系统 |
| nameCN | string | ✅ | — | 中文名称 | Mindat 中文标准 |
| nameEN | string | ✅ | — | 英文名称 | IMA-RRUFF |
| aliases | string[] | — | — | 别名（旧称、变种名等） | Mindat |
| formula | string | ✅ | — | 化学式，保留非化学计量写法 | RRUFF / Mindat |
| mineralClass | enum | ✅ | — | 9 大矿物类别之一 | 标准 |
| silicateSubclass | enum | — | — | 硅酸盐结构亚类 | Deer/Howie/Zussman |
| crystal | CrystalProperties | ✅ | — | 晶体学属性（见 §2） | 文献 |
| optical | OpticalProperties | ✅ | — | 光学属性（见 §3） | Nesse 2013 |
| occurrence | string | ✅ | — | 常见产状描述 | DHZ 2013 |
| associations | string | — | — | 共生矿物 | DHZ 2013 |
| alteration | string | — | — | 蚀变产物 | DHZ 2013 |
| distinguishing | string | — | — | 易混淆矿物及鉴别依据 | 综合文献 |
| dataStatus | enum | ✅ | — | verified/reviewed/provisional/schematic/draft/missing | 审核流程 |
| lastReviewed | ISO date | ✅ | YYYY-MM-DD | 最后审核日期 | 审核流程 |
| assets | MineralAssets | ✅ | — | 模型与图片资产（见 §4） | 工具链 |

## 2. 实体 CrystalProperties（晶体学属性）

| 字段 | 类型 | 必填 | 单位 | 说明 |
|---|---|---|---|---|
| system | enum | ✅ | — | 7 大晶系 |
| pointGroup | string | — | — | Hermann-Mauguin 记号 |
| spaceGroup | string | — | — | 国际记号 |
| cellParams | object | — | — | 含 a,b,c (Å) 与 α,β,γ (°)，每项为字符串可表范围 |
| cellParams.conditions | string | — | — | 适用条件（成分、温度、压力） |
| habit | string | ✅ | — | 晶体习性 |
| cleavage | string | ✅ | — | 解理方向、组数、夹角 |
| fracture | string | — | — | 断口 |
| hardness | string | — | 摩斯硬度 | 须注明尺度 |
| density | string | — | g/cm³ | 须注明数据性质 |

### 单位约定
- 长度：埃 (Å)
- 角度：度 (°)
- 密度：g/cm³

## 3. 实体 OpticalProperties（光学属性）

### 3.1 PPL 单偏光

| 字段 | 必填 | 说明 |
|---|---|---|
| color | ✅ | 颜色及常见变化范围 |
| pleochroism | ✅ | 多色性描述 |
| relief | ✅ | 突起等级 |
| cleavage | ✅ | 解理纹特征 |
| form | ✅ | 晶体形态 |
| transparency | ✅ | 透明度 |
| inclusions | — | 包裹体 |
| alteration | — | 典型蚀变 |

### 3.2 XPL 正交偏光

| 字段 | 必填 | 说明 |
|---|---|---|
| interferenceColor | ✅ | 干涉色及级序 |
| birefringence | ✅ | 双折射率数值含依据 |
| extinction | ✅ | 消光类型 |
| extinctionAngle | — | 消光角及适用条件 |
| twinning | ✅ | 双晶类型 |
| zoning | — | 环带构造 |
| undulatory | — | 波状消光 |
| anomalousColor | — | 异常干涉色 |

### 3.3 Conoscopic 锥光

| 字段 | 必填 | 说明 |
|---|---|---|
| opticType | ✅ | 一轴晶/二轴晶/均质体/待补充 |
| opticSign | — | 正(+)或负(-) |
| 2V | — | 光轴角，含测量条件 |

### 字段值规范
- 数值范围允许使用连字符：`0.018–0.034`
- 缺数据使用 placeholder：`"待补充"` 并将 `dataStatus` 标为 missing
- 不可用空字符串、`null`、`0` 蒙混为存在值

## 4. 实体 MineralAssets

### 4.1 CrystalAsset（三维模型资产）

| 字段 | 必填 | 说明 |
|---|---|---|
| id | ✅ | 资产 ID（mineral-proc-001 格式） |
| mineralId | ✅ | 关联矿物 ID |
| modelType | ✅ | procedural_schematic / blender_ideal / verified_reconstruction / missing |
| filePath | — | 当模型为 GLB 时的相对路径 |
| generator | — | 生成器名或作者 |
| reviewStatus | ✅ | verified/reviewed/provisional/schematic/draft/missing |
| notes | — | 模型限制说明 |

## 5. 实体 Reference（来源引用）

| 字段 | 必填 | 说明 |
|---|---|---|
| id | ✅ | 来源 ID |
| type | ✅ | handbook/textbook/paper/database/website |
| authors | ✅ | 作者 |
| title | ✅ | 标题 |
| year | — | 出版年份 |
| publisher | — | 出版方 |
| pages | — | 页码 |
| url | — | 链接 |
| accessed | — | 访问日期 |
| license | — | 许可信息 |

## 6. 数据状态机

```
draft → reviewed → verified → published
                  ↓            ↓
              (退回)         (撤回)
```

数据正确性审核与模型制作审核独立：
- 三维模型外观精美 ≠ 科学属性正确
- 反程序化模型 → 标 `procedural_schematic`，不可自动升级为 verified

## 7. 校验规则（实现于测试）

- `id` 必须全小写，仅含字母/连字符
- `formula` 不得为空字符串
- `dataStatus ∈` enum
- `crystal.system` 必须标准化为中文枚举之一
- 若 `optical.conoscopic.opticType = '均质体'`，则 `birefringence` 应为 `δ = 0`
- 若晶系含"等轴"，则 `conoscopic.opticType` 应为 `均质体`