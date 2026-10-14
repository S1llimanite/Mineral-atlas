// 程序化晶体几何生成器
// 根据矿物的晶系与习性生成示意几何体
// 重要：所有生成模型均为 schematic（示意），不可宣称精确重建

import * as THREE from 'three';

export interface CrystalGeometrySpec {
  mineralId: string;
  system: string;
  habit: string;
  mineralClass: string;
}

/**
 * 矿物 ID → 几何构造映射
 * 特殊矿物显式指定晶形；其余按晶系兜底
 */
const GEOMETRY_MAP: Record<string, () => THREE.BufferGeometry> = {
  // 架状
  quartz: () => buildHexagonalPrismWithBipyramid(1.0, 2.4, 1.0),
  sanidine: () => buildSlab(1.4, 0.5, 1.0),
  orthoclase: () => buildSlab(1.4, 0.5, 1.0),
  microcline: () => buildSlab(1.4, 0.5, 1.0),
  albite: () => buildSlab(1.4, 0.5, 1.0),
  oligoclase: () => buildSlab(1.4, 0.5, 1.0),
  andesine: () => buildSlab(1.4, 0.5, 1.0),
  labradorite: () => buildSlab(1.4, 0.5, 1.0),
  anorthite: () => buildSlab(1.4, 0.5, 1.0),
  nepheline: () => buildPrism(0.9, 0.9, 1.8, 6),
  leucite: () => buildTrapezohedron(1.0),
  sodalite: () => new THREE.DodecahedronGeometry(0.9, 0),
  scapolite: () => buildPrism(0.55, 0.55, 2.0, 4),
  analcime: () => buildTrapezohedron(0.9),

  // 层状
  biotite: () => buildHexagonalSheet(1.4, 0.15),
  muscovite: () => buildHexagonalSheet(1.3, 0.12),
  phlogopite: () => buildHexagonalSheet(1.3, 0.14),
  lepidolite: () => buildHexagonalSheet(1.1, 0.1),
  chlorite: () => buildHexagonalSheet(1.2, 0.14),
  serpentine: () => buildHexagonalSheet(1.1, 0.12),
  talc: () => buildHexagonalSheet(1.2, 0.12),
  kaolinite: () => buildHexagonalSheet(0.8, 0.1),
  chloritoid: () => buildSlab(1.3, 0.7, 0.5),

  // 单链（辉石）
  enstatite: () => buildPrism(0.4, 0.4, 1.5, 4),
  hypersthene: () => buildPrism(0.4, 0.4, 1.5, 4),
  diopside: () => buildPrism(0.45, 0.45, 1.4, 4),
  hedenbergite: () => buildPrism(0.45, 0.45, 1.4, 4),
  clinopyroxene: () => buildPrism(0.45, 0.45, 1.4, 4),
  augite: () => buildPrism(0.45, 0.45, 1.4, 4),
  aegirine: () => buildPrism(0.3, 0.3, 2.0, 4),
  jadeite: () => buildPrism(0.4, 0.4, 1.5, 4),
  spodumene: () => buildPrism(0.35, 0.35, 1.9, 4),

  // 双链（角闪石）
  tremolite: () => buildPrism(0.3, 0.3, 2.2, 4),
  actinolite: () => buildPrism(0.3, 0.3, 2.1, 4),
  hornblende: () => buildPrism(0.32, 0.32, 2.2, 4),
  anthophyllite: () => buildPrism(0.3, 0.3, 2.0, 4),
  cummingtonite: () => buildPrism(0.28, 0.28, 2.1, 4),
  grunerite: () => buildPrism(0.28, 0.28, 2.1, 4),
  glaucophane: () => buildPrism(0.28, 0.28, 2.0, 4),
  riebeckite: () => buildPrism(0.26, 0.26, 2.0, 4),

  // 岛状
  olivine: () => buildGranular(0.9),
  zircon: () => buildPrism(0.45, 0.45, 1.8, 4),
  titanite: () => buildWedge(1.0),
  epidote: () => buildPrism(0.45, 0.45, 1.5, 4),
  zoisite: () => buildPrism(0.4, 0.4, 1.4, 4),
  kyanite: () => buildBlade(0.35, 0.35, 2.2),
  andalusite: () => buildPrism(0.5, 0.5, 1.5, 4),
  sillimanite: () => buildPrism(0.16, 0.16, 2.2, 4),
  staurolite: () => buildPrism(0.55, 0.55, 1.3, 4),
  topaz: () => buildPrism(0.5, 0.5, 1.6, 4),
  vesuvianite: () => buildPrism(0.45, 0.45, 1.6, 4),
  lawsonite: () => buildPrism(0.35, 0.35, 1.8, 4),

  // 环状
  tourmaline: () => buildTourmalinePrism(0.7, 2.0),
  beryl: () => buildPrism(0.65, 0.65, 2.0, 6),
  cordierite: () => buildGranular(0.9),

  // 非硅酸盐
  calcite: () => buildRhombohedron(1.1),
  dolomite: () => buildRhombohedron(1.0),
  siderite: () => buildRhombohedron(1.0),
  aragonite: () => buildPrism(0.35, 0.35, 2.0, 6),
  magnesite: () => buildRhombohedron(1.0),
  barite: () => buildSlab(1.2, 0.9, 0.35),
  gypsum: () => buildSlab(1.1, 0.5, 0.8),
  anhydrite: () => buildSlab(1.2, 0.4, 0.8),
  apatite: () => buildPrism(0.45, 0.45, 1.8, 6),
  monazite: () => buildSlab(1.0, 0.5, 0.9),
  fluorite: () => new THREE.BoxGeometry(1.1, 1.1, 1.1),
  halite: () => new THREE.BoxGeometry(1.0, 1.0, 1.0),
  opal: () => buildGranular(0.85),

  // 氧化物与硫化物
  magnetite: () => new THREE.OctahedronGeometry(0.9, 0),
  ilmenite: () => buildSlab(1.2, 0.5, 1.0),
  hematite: () => buildHexagonalSheet(0.9, 0.3),
  rutile: () => buildPrism(0.25, 0.25, 2.2, 4),
  spinel: () => new THREE.OctahedronGeometry(0.8, 0),
  chromite: () => new THREE.OctahedronGeometry(0.8, 0),
  corundum: () => buildBarrel(0.7, 1.8, 6),
  pyrite: () => new THREE.BoxGeometry(0.95, 0.95, 0.95),
  pyrrhotite: () => buildSlab(1.1, 0.5, 1.0),
  chalcopyrite: () => new THREE.TetrahedronGeometry(0.95, 0),
  arsenopyrite: () => buildPrism(0.4, 0.6, 1.6, 4),
  sphalerite: () => new THREE.TetrahedronGeometry(0.95, 0),
  galena: () => new THREE.BoxGeometry(0.95, 0.95, 0.95),
  graphite: () => buildHexagonalSheet(1.0, 0.1),
  goethite: () => buildPrism(0.18, 0.18, 2.0, 4),
  brucite: () => buildHexagonalSheet(1.0, 0.12),
};

// 根据矿物 ID 或晶系返回示意几何体
export function buildProceduralGeometry(spec: CrystalGeometrySpec): THREE.BufferGeometry {
  const { mineralId, system } = spec;
  const fn = GEOMETRY_MAP[mineralId];
  if (fn) return fn();
  return buildDefaultBySystem(system);
}

// ====== 几何构造函数 ======

/** 六方柱 + 双锥（石英、方柱石等三方/六方柱状） */
function buildHexagonalPrismWithBipyramid(r: number, h: number, rh: number): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];

  const topApex: [number, number, number] = [0, h / 2 + rh, 0];
  const botApex: [number, number, number] = [0, -h / 2 - rh, 0];
  const topRing: [number, number, number][] = [];
  const botRing: [number, number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    topRing.push([x, h / 2, z]);
    botRing.push([x, -h / 2, z]);
  }

  for (const v of [topApex, botApex, ...topRing, ...botRing]) positions.push(...v);

  const topApexIdx = 0, botApexIdx = 1, topStart = 2, botStart = 8;
  for (let i = 0; i < 6; i++) {
    indices.push(topApexIdx, topStart + ((i + 1) % 6), topStart + i);
    indices.push(botApexIdx, botStart + i, botStart + ((i + 1) % 6));
  }
  for (let i = 0; i < 6; i++) {
    const ti = topStart + i, ti2 = topStart + ((i + 1) % 6);
    const bi = botStart + i, bi2 = botStart + ((i + 1) % 6);
    indices.push(ti, bi, bi2);
    indices.push(ti, bi2, ti2);
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** 长石板状（扁长方体） */
function buildSlab(w: number, t: number, d: number): THREE.BufferGeometry {
  return new THREE.BoxGeometry(w, t, d);
}

/** 云母假六方片状 */
function buildHexagonalSheet(r: number, t: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i <= 6; i++) {
    const a = (i * Math.PI) / 3;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false });
  geo.translate(0, 0, -t / 2);
  geo.rotateX(Math.PI / 2);
  return geo;
}

/** 多边形棱柱（辉石/角闪石柱状） */
function buildPrism(rx: number, rz: number, h: number, sides: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i <= sides; i++) {
    const a = (i * 2 * Math.PI) / sides;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * rz;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
  geo.translate(0, 0, -h / 2);
  geo.rotateX(Math.PI / 2);
  return geo;
}

/** 电气石棱柱：横切面为球面三角形（Three 无原生实现，用圆柱+截顶模拟） */
function buildTourmalinePrism(r: number, h: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  // 三角截面（略微内凹模拟球面三角）
  for (let i = 0; i <= 3; i++) {
    const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
    const rr = r * (0.85 + 0.15 * ((i + 1) % 2));
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
  geo.translate(0, 0, -h / 2);
  geo.rotateX(Math.PI / 2);
  return geo;
}

/** 粒状（橄榄石）：八面体 */
function buildGranular(r: number): THREE.BufferGeometry {
  return new THREE.OctahedronGeometry(r, 0);
}

/** 菱面体（方解石族）：剪切变换立方体近似 */
function buildRhombohedron(r: number): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(r * 1.6, r * 1.6, r * 1.6);
  geo.applyMatrix4(new THREE.Matrix4().makeShear(0.3, 0, 0, 0, 0, 0));
  return geo;
}

/** 菱形十二面体（石榴子石/方钠石） */
function buildDodecahedron(r: number): THREE.BufferGeometry {
  return new THREE.DodecahedronGeometry(r, 0);
}

/** 四角三八面体（白榴石） */
function buildTrapezohedron(r: number): THREE.BufferGeometry {
  // Three 无原生 trapezohedron，用 Icosahedron 近似各向对称
  const geo = new THREE.IcosahedronGeometry(r, 0);
  return geo;
}

/** 楔形（榍石信封状） */
function buildWedge(r: number): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(r * 1.6, r * 0.9, r * 0.9);
  // 沿一条对角线斜切：用 Matrix4 剪切
  geo.applyMatrix4(new THREE.Matrix4().makeShear(0, 0, 0.6, 0, 0, 0));
  return geo;
}

/** 刃状（蓝晶石：扁平长刃） */
function buildBlade(w: number, t: number, h: number): THREE.BufferGeometry {
  return new THREE.BoxGeometry(w, t, h);
}

/** 桶状（刚玉六方桶状） */
function buildBarrel(r: number, h: number, sides: number): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(r, r * 0.92, h, sides, 1);
  return geo;
}

/** 兜底：依晶系 */
function buildDefaultBySystem(system: string): THREE.BufferGeometry {
  if (system.includes('等轴')) return new THREE.OctahedronGeometry(0.9, 0);
  if (system.includes('三方') || system.includes('六方')) {
    return new THREE.CylinderGeometry(1, 1, 2, 6);
  }
  if (system.includes('四方')) {
    return new THREE.CylinderGeometry(0.8, 0.8, 2, 4);
  }
  if (system.includes('单斜') || system.includes('斜方')) {
    return new THREE.BoxGeometry(1.5, 0.5, 1.0);
  }
  return new THREE.BoxGeometry(1.0, 0.6, 0.9);
}

// ====== 晶面标注与坐标轴 ======

export function buildCrystalFaceLabels(mineralId: string): Array<{
  label: string;
  position: [number, number, number];
}> {
  const map: Record<string, Array<{ label: string; position: [number, number, number] }>> = {
    quartz: [
      { label: 'm{10ī0}', position: [1.0, 0, 0] },
      { label: 'r{10ī1}', position: [0.7, 1.7, 0.4] },
      { label: 'z{01ī1}', position: [-0.7, 1.7, -0.4] },
    ],
    calcite: [{ label: '{10ī1}', position: [1.0, 0.5, 0] }],
    dolomite: [{ label: '{10ī1}', position: [1.0, 0.5, 0] }],
    siderite: [{ label: '{10ī1}', position: [1.0, 0.5, 0] }],
    magnesite: [{ label: '{10ī1}', position: [1.0, 0.5, 0] }],
    pyrite: [{ label: '{100}', position: [0.95, 0.95, 0.95] }],
    halite: [{ label: '{100}', position: [1.0, 1.0, 1.0] }],
    fluorite: [{ label: '{111}', position: [0.9, 0.9, 0.9] }],
    garnet: [{ label: '{110}', position: [0.9, 0.9, 0] }],
    sodalite: [{ label: '{110}', position: [0.9, 0.9, 0] }],
    magnetite: [{ label: '{111}', position: [0.9, 0.9, 0.9] }],
    spinel: [{ label: '{111}', position: [0.8, 0.8, 0.8] }],
    chromite: [{ label: '{111}', position: [0.8, 0.8, 0.8] }],
    sphalerite: [{ label: '{110}', position: [0.9, 0.9, 0] }],
    muscovite: [{ label: '{001}', position: [0, 0.6, 0] }],
    biotite: [{ label: '{001}', position: [0, 0.7, 0] }],
    chlorite: [{ label: '{001}', position: [0, 0.7, 0] }],
    tourmaline: [
      { label: '{0001}', position: [0, 1.0, 0] },
      { label: 'm{10ī0}', position: [0.6, 0, 0] },
    ],
    beryl: [{ label: 'm{10ī0}', position: [0.6, 0, 0] }],
    apatite: [{ label: 'm{10ī0}', position: [0.5, 0, 0] }],
    rutile: [{ label: 'm{110}', position: [0.3, 0, 0] }],
    zircon: [{ label: 'm{110}', position: [0.5, 0, 0] }],
  };
  return map[mineralId] || [];
}

export function buildAxesHelper(size: number): THREE.Group {
  const group = new THREE.Group();
  const axes = [
    { dir: new THREE.Vector3(1, 0, 0), color: 0x7eb8ff },
    { dir: new THREE.Vector3(0, 1, 0), color: 0x3d9b8f },
    { dir: new THREE.Vector3(0, 0, 1), color: 0xc9a227 },
  ];
  axes.forEach((a) => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      a.dir.clone().multiplyScalar(size),
    ]);
    const mat = new THREE.LineBasicMaterial({ color: a.color });
    group.add(new THREE.Line(geo, mat));
  });
  return group;
}