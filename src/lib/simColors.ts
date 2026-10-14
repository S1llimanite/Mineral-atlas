/**
 * 薄片模拟器的矿物 PPL 颜色预设
 * [基础色, 多色性第二色（可选）]
 *
 * 颜色取自各矿物在单偏光下的典型薄片颜色（Nesse 2013 描述的视觉近似）。
 * XPL 干涉色不由本表提供，而由矿物双折射率经 Michel-Lévy 映射计算（物理推导）。
 *
 * 不透明矿物（magnetite、pyrite 等）在透射光下全黑，由模拟器特殊处理。
 */

export const SIM_COLORS: Record<string, [string, string?]> = {
  // ===== 架状硅酸盐 =====
  quartz: ['#E8E4DA'],
  sanidine: ['#EAE7DE'],
  orthoclase: ['#E8E2D4'],
  microcline: ['#E6E1D2'],
  albite: ['#ECEAE2'],
  oligoclase: ['#EBE8DF'],
  andesine: ['#EAE6DB'],
  labradorite: ['#E7E2D4'],
  anorthite: ['#E4DFCF'],
  nepheline: ['#E2DDD0'],
  leucite: ['#E9E6DC'],
  sodalite: ['#DCE0E8'],
  scapolite: ['#E6E2D6'],
  analcime: ['#E4E1D8'],

  // ===== 层状硅酸盐 =====
  biotite: ['#5A4632', '#C9A96E'],        // 强多色性：深褐 ↔ 黄褐
  muscovite: ['#EDEDEA'],
  phlogopite: ['#C9AE8A', '#E8DCC2'],     // 弱多色性
  lepidolite: ['#D8C4D8', '#EBD8E8'],     // 粉紫多色性
  chlorite: ['#7CA88A', '#B5CBAF'],
  serpentine: ['#A8C09A', '#D0DFC2'],
  talc: ['#E8E8E2'],
  kaolinite: ['#E5E3DA'],
  chloritoid: ['#5E8878', '#9CC0AC'],     // 蓝-绿多色性

  // ===== 单链（辉石） =====
  enstatite: ['#DEDCC8'],
  hypersthene: ['#B8A890', '#C8A098'],    // 绿-粉多色性
  diopside: ['#D8DCCE'],
  hedenbergite: ['#8CA880', '#B5C9A5'],
  clinopyroxene: ['#C2CCBA', '#D5DCC8'],
  augite: ['#C2CCBA', '#D5DCC8'],
  aegirine: ['#4A7A5A', '#7FA884'],       // 绿多色性
  jadeite: ['#DCE2D4'],
  spodumene: ['#E2E2DA'],

  // ===== 双链（角闪石） =====
  tremolite: ['#E4E6DC'],
  actinolite: ['#6E9A72', '#A5C4A0'],
  hornblende: ['#48684E', '#88A878'],     // 强绿多色性
  anthophyllite: ['#C8BC9A', '#E0D6B8'],
  cummingtonite: ['#D0C6A8', '#E2DCC4'],
  grunerite: ['#A89060', '#C8B080'],
  glaucophane: ['#4A6AA8', '#A8B8D8'],    // 蓝多色性
  riebeckite: ['#2E4468', '#5A78A0'],     // 深蓝多色性

  // ===== 岛状 =====
  olivine: ['#DCE0C4'],
  zircon: ['#DCD2C2'],
  titanite: ['#C8B088', '#E0D2B0'],
  epidote: ['#B8C878', '#D8E0A0'],        // 黄绿
  zoisite: ['#E2E2DA'],
  kyanite: ['#D4DCE4', '#B8CCDC'],        // 淡蓝
  andalusite: ['#E0D4CC', '#E8C8C0'],     // 弱粉红
  sillimanite: ['#E6E4DC'],
  staurolite: ['#C8A850', '#E0CC78'],     // 金黄多色性
  topaz: ['#E8E8E2'],
  vesuvianite: ['#D8D8C2', '#C8D0A8'],
  lawsonite: ['#E2E4DA'],
  garnet: ['#D8B8A8'],

  // ===== 环状 =====
  tourmaline: ['#3A5A48', '#789884'],     // 强吸收多色性
  beryl: ['#D8E2DA'],
  cordierite: ['#D0D2CC', '#B8C0CC'],     // 弱蓝紫

  // ===== 碳酸盐等 =====
  calcite: ['#F0F0EA'],
  dolomite: ['#F0EFE8'],
  siderite: ['#E0D4C0'],
  aragonite: ['#F0EEE6'],
  magnesite: ['#F0EEE4'],
  barite: ['#F0F0EC'],
  gypsum: ['#EFEFE8'],
  anhydrite: ['#ECECE4'],
  apatite: ['#EAE8DC'],
  monazite: ['#E4DCC4'],
  fluorite: ['#D8CCE8'],                   // 紫色环带
  halite: ['#ECECE6'],
  opal: ['#EAEAE2'],

  // ===== 氧化物 / 硫化物（不透明为主） =====
  magnetite: ['#1A1C20'],
  ilmenite: ['#20222A'],
  hematite: ['#8A3A2E', '#B85A40'],        // 血红边缘
  rutile: ['#8A4A28', '#B86838'],          // 红褐
  spinel: ['#C8A8B0'],
  chromite: ['#4A3028'],
  corundum: ['#C8D0DC', '#98B4CC'],
  pyrite: ['#141414'],
  pyrrhotite: ['#181614'],
  chalcopyrite: ['#161410'],
  sphalerite: ['#6A5238', '#8A7048'],      // 褐色（含 Fe 变化）
  galena: ['#141418'],
  graphite: ['#101010'],
  goethite: ['#8A6428', '#B08840'],        // 黄褐
  brucite: ['#E0E2D8'],
};
