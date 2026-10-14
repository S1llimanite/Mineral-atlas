'use client';

import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { buildProceduralGeometry, buildCrystalFaceLabels, buildAxesHelper } from '@/lib/crystalGeometry';
import { useTheme } from '@/components/ThemeProvider';
import type { Mineral } from '@/types/mineral';

interface CrystalViewerProps {
  mineral: Mineral;
  width?: number | string;
  height?: number | string;
}

/** 主晶体 mesh */
function CrystalMesh({
  mineral,
  wireframe,
  opacity,
  showFaceLabels,
  color,
}: {
  mineral: Mineral;
  wireframe: boolean;
  opacity: number;
  showFaceLabels: boolean;
  color: string;
}) {
  const geometry = useMemo(
    () =>
      buildProceduralGeometry({
        mineralId: mineral.id,
        system: mineral.crystal.system,
        habit: mineral.crystal.habit,
        mineralClass: mineral.mineralClass,
      }),
    [mineral]
  );

  const labels = useMemo(() => buildCrystalFaceLabels(mineral.id), [mineral.id]);

  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          metalness={0.08}
          roughness={0.32}
          transparent={opacity < 1}
          opacity={opacity}
          wireframe={wireframe}
          side={THREE.DoubleSide}
          flatShading
        />
      </mesh>
      {/* 晶棱高亮 */}
      {!wireframe && (
        <lineSegments>
          <edgesGeometry args={[geometry]} />
          <lineBasicMaterial color="#8FB8E8" transparent opacity={0.55} />
        </lineSegments>
      )}
      {showFaceLabels &&
        labels.map((l, i) => (
          <Html key={i} position={l.position} center distanceFactor={6}>
            <div className="px-1.5 py-0.5 text-[10px] font-mono bg-void/90 text-moon border border-moon/30 rounded whitespace-nowrap backdrop-blur-sm">
              {l.label}
            </div>
          </Html>
        ))}
    </group>
  );
}

/** 相机与控制器 */
function Controls({ autoRotate, resetSignal }: { autoRotate: boolean; resetSignal: number }) {
  const controls = useRef<any>(null);
  const { camera } = useThree();

  useMemo(() => {
    camera.position.set(4, 2.6, 4.2);
    camera.lookAt(0, 0, 0);
    if (controls.current) {
      controls.current.target.set(0, 0, 0);
      controls.current.update();
    }
  }, [resetSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <OrbitControls
      ref={controls}
      autoRotate={autoRotate}
      autoRotateSpeed={0.7}
      enableDamping
      dampingFactor={0.09}
      minDistance={1.8}
      maxDistance={14}
      enablePan
    />
  );
}

function ModelFallback({ msg }: { msg: string }) {
  return (
    <Html center>
      <div className="px-3 py-2 text-[11px] font-mono bg-void/90 text-ink-mid border border-hair rounded shadow-float">
        {msg}
      </div>
    </Html>
  );
}

function WebGLUnavailable() {
  return (
    <div className="flex items-center justify-center h-full bg-void text-ink-mid text-sm text-center p-6">
      <div>
        <div className="mb-2 text-base text-ink-bright">无法启用 WebGL</div>
        <div className="opacity-70">请使用支持 WebGL 的现代浏览器，或检查显卡驱动是否正常。</div>
      </div>
    </div>
  );
}

/** 配色方案：默认（按矿物）/ 晶面中性 / 月光蓝 / 祖母绿 / 琥珀金 / 素白 */
const PALETTES = [
  { label: '默认', color: null },
  { label: '中性', color: '#9AA6B5' },
  { label: '月光', color: '#7EB8FF' },
  { label: '绿柱', color: '#3D9B8F' },
  { label: '琥珀', color: '#C9A227' },
  { label: '素白', color: '#E8ECF1' },
];

export function CrystalViewer({ mineral, width = '100%', height = 500 }: CrystalViewerProps) {
  const [wireframe, setWireframe] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [showAxes, setShowAxes] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const [colorOverride, setColorOverride] = useState<string | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  // 按矿物分配默认色（克制、科学）
  const defaultColor = useMemo(() => {
    const map: Record<string, string> = {
      quartz: '#E4E7EC',
      plagioclase: '#D8DDE6',
      'k-feldspar': '#D8DDE6',
      orthoclase: '#D8DDE6',
      sanidine: '#E4E7EC',
      microcline: '#D8DDE6',
      albite: '#D8DDE6',
      oligoclase: '#D8DDE6',
      andesine: '#D8DDE6',
      labradorite: '#C8D2E0',
      anorthite: '#C8D2E0',
      biotite: '#6B5847',
      muscovite: '#DCE3EA',
      chlorite: '#6FA88C',
      epidote: '#8FBF6A',
      hornblende: '#3F6B4F',
      clinopyroxene: '#7A8C76',
      augite: '#7A8C76',
      diopside: '#7A8C76',
      olivine: '#A8B55A',
      calcite: '#E8ECF1',
      dolomite: '#E8ECF1',
      siderite: '#D8BFA0',
      garnet: '#9C4A4A',
      magnetite: '#4A4D55',
      pyrite: '#C8A84A',
      fluorite: '#B8A8D8',
      tourmaline: '#3D4A6B',
      apatite: '#D8C8A8',
      zircon: '#B8A898',
      rutile: '#9C5A3A',
    };
    return map[mineral.id] || '#B8C2CE';
  }, [mineral.id]);

  const color = colorOverride ?? defaultColor;

  // 坐标轴对象：memo 化，避免每次渲染重建导致 three 资源反复挂载
  const axesObject = useMemo(() => buildAxesHelper(1.7), []);

  // v0.4：根据当前主题切换 3D 场景背景与雾色
  const { globalTheme } = useTheme();
  const isDark = globalTheme !== 'light';
  const sceneBg = isDark ? '#0A0C10' : '#F1EEE3';
  const fog = isDark ? '#0A0C10' : '#F1EEE3';

  return (
    <div className="w-full" style={{ height, width }}>
      <div className="relative w-full h-full panel overflow-hidden" style={{ borderRadius: 12 }}>
        {webglFailed ? (
          <WebGLUnavailable />
        ) : (
          <Canvas
            camera={{ position: [4, 2.6, 4.2], fov: 45 }}
            onCreated={({ gl }) => {
              if (!gl) setWebglFailed(true);
            }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: false }}
            shadows
          >
            <color attach="background" args={[sceneBg]} />
            <fog attach="fog" args={[fog, 12, 26]} />
            {/* 精密仪器级照明：弱环境光 + 冷主光 + 暖补光 */}
            <ambientLight intensity={isDark ? 0.35 : 0.85} />
            <directionalLight position={[5, 6, 5]} intensity={isDark ? 1.1 : 1.4} color={isDark ? '#EAF0FA' : '#FFFFFF'} castShadow />
            <directionalLight position={[-5, 2, -4]} intensity={0.35} color="#5B9A8B" />
            <pointLight position={[0, -4, 2]} intensity={0.25} color="#C4A35A" />

            <Suspense fallback={<ModelFallback msg="模型加载中…" />}>
              <CrystalMesh
                mineral={mineral}
                wireframe={wireframe}
                opacity={opacity}
                showFaceLabels={showLabels}
                color={color}
              />
            </Suspense>

            {showAxes && <primitive object={axesObject} />}

            <Grid
              args={[24, 24]}
              cellSize={0.5}
              cellColor={isDark ? '#1C2128' : '#E5E0D2'}
              sectionSize={2.5}
              sectionColor={isDark ? '#232A33' : '#D5CFBE'}
              fadeDistance={16}
              fadeStrength={1.6}
              position={[0, -2.2, 0]}
              infiniteGrid={false}
            />

            <Controls autoRotate={autoRotate} resetSignal={resetSignal} />
          </Canvas>
        )}

        {/* 顶部控制条 */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5">
          <button className={ctl(autoRotate)} onClick={() => setAutoRotate(!autoRotate)} type="button">
            {autoRotate ? '停止旋转' : '自动旋转'}
          </button>
          <button className={ctl(true)} onClick={() => setResetSignal((s) => s + 1)} type="button">
            重置视角
          </button>
          <button className={ctl(wireframe)} onClick={() => setWireframe(!wireframe)} type="button">
            线框
          </button>
          <button className={ctl(showAxes)} onClick={() => setShowAxes(!showAxes)} type="button">
            坐标轴
          </button>
          <button className={ctl(showLabels)} onClick={() => setShowLabels(!showLabels)} type="button">
            晶面指数
          </button>
        </div>

        {/* 底部：透明度 + 配色 */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[11px] text-ink-mid">
            <span>透明度</span>
            <input
              type="range"
              min={0.2}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-24 accent-moon"
            />
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-ink-faint">配色</span>
            {PALETTES.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setColorOverride(p.color)}
                title={p.label}
                className={`w-5 h-5 rounded-full border transition-all ${
                  (colorOverride ?? null) === p.color ? 'ring-2 ring-moon border-moon' : 'border-hair2'
                }`}
                style={{ background: p.color ?? defaultColor }}
              />
            ))}
          </div>
        </div>

        {/* 模型类型标注 */}
        <div className="absolute top-3 right-3 hidden sm:flex items-center gap-2 px-2 py-1 text-[10px] font-mono bg-void/80 border border-hair rounded backdrop-blur-sm">
          <span className="text-status-schematic">{mineral.assets.crystalModel?.modelType || 'missing'}</span>
          <span className="text-ink-faint">示意模型 · 非精确晶形重建</span>
        </div>
      </div>
    </div>
  );
}

function ctl(active: boolean): string {
  return [
    'px-2.5 py-1 text-[11px] rounded-md border backdrop-blur-sm transition-all duration-300 ease-crystal',
    active
      ? 'bg-moon/20 text-moon border-moon/40'
      : 'bg-void/70 text-ink-mid border-hair hover:bg-void/90 hover:text-ink-bright',
  ].join(' ');
}