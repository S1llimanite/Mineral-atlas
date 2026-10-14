'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMemo, useRef, useState, Suspense } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/components/ThemeProvider';
import { HeroCrystalIllustration } from '@/components/HeroCrystalIllustration';

/**
 * 首页 Hero · 3D 旋转多面体 v0.5
 * R3F 程序化多面体群（二十面体 + 八面体 + 十二面体 + 悬浮小晶体）
 * 浅色 Mineral Gallery Light 配色；支持拖拽旋转；WebGL 不可用时回退 2D 插图
 */

/** 单个缓慢自转的多面体 */
function SpinningPoly({
  geometry,
  color,
  edgeColor,
  position,
  scale = 1,
  speed = 0.25,
  floatAmp = 0.08,
  floatPhase = 0,
}: {
  geometry: THREE.BufferGeometry;
  color: string;
  edgeColor: string;
  position: [number, number, number];
  scale?: number;
  speed?: number;
  floatAmp?: number;
  floatPhase?: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = t * speed;
    g.rotation.x = Math.sin(t * speed * 0.6 + floatPhase) * 0.18;
    g.position.y = position[1] + Math.sin(t * 0.7 + floatPhase) * floatAmp;
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          metalness={0.12}
          roughness={0.38}
          flatShading
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color={edgeColor} transparent opacity={0.5} />
      </lineSegments>
    </group>
  );
}

/** 悬浮微粒：小型四面体群 */
function FloatingShards({ color }: { color: string }) {
  const ref = useRef<THREE.Group>(null);
  const shards = useMemo(() => {
    // 种子化伪随机，保证每次渲染位置一致
    let seed = 20240501;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    return Array.from({ length: 10 }, () => ({
      pos: [(rnd() - 0.5) * 11, (rnd() - 0.5) * 5.5, (rnd() - 0.5) * 3 - 1.5] as [number, number, number],
      s: 0.07 + rnd() * 0.1,
      phase: rnd() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.children.forEach((child, i) => {
      child.rotation.x = t * 0.4 + i;
      child.rotation.z = t * 0.3 + i * 1.7;
      child.position.y = shards[i].pos[1] + Math.sin(t * 0.5 + shards[i].phase) * 0.25;
    });
  });

  return (
    <group ref={ref}>
      {shards.map((s, i) => (
        <mesh key={i} position={s.pos} scale={s.s}>
          <tetrahedronGeometry args={[1]} />
          <meshStandardMaterial color={color} transparent opacity={0.55} flatShading />
        </mesh>
      ))}
    </group>
  );
}

export function HeroPolyhedron3D() {
  const { globalTheme } = useTheme();
  const isDark = globalTheme !== 'light';
  const [webglFailed, setWebglFailed] = useState(false);

  const geoms = useMemo(
    () => ({
      icosa: new THREE.IcosahedronGeometry(1.9, 0),
      octa: new THREE.OctahedronGeometry(1.0, 0),
      dodeca: new THREE.DodecahedronGeometry(0.78, 0),
    }),
    []
  );

  // 主题配色：浅色 = 祖母绿/薄荷/琥珀；深色 = 亮化版本
  const palette = isDark
    ? { main: '#4C9B85', mint: '#7EB8FF', gold: '#D4AF37', edge: '#BFE3D8', shard: '#7EB8FF' }
    : { main: '#3D8471', mint: '#6FAE9E', gold: '#CFAF6B', edge: '#1F5546', shard: '#8FB8A8' };

  if (webglFailed) {
    // WebGL 不可用 → 回退到 v0.4 的 2D 几何插图
    return (
      <div className="relative w-full h-full">
        <HeroCrystalIllustration />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0.4, 8.6], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          if (!gl) setWebglFailed(true);
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.05} />
          <directionalLight position={[5, 6, 6]} intensity={1.5} color="#FFFFFF" castShadow />
          <directionalLight position={[-6, 2, -4]} intensity={0.4} color="#5B9A8B" />
          <pointLight position={[0, -5, 3]} intensity={0.3} color="#C4A35A" />

          <SpinningPoly
            geometry={geoms.icosa}
            color={palette.main}
            edgeColor={palette.edge}
            position={[0, 0.1, 0]}
            speed={0.28}
            floatAmp={0.1}
          />
          <SpinningPoly
            geometry={geoms.octa}
            color={palette.gold}
            edgeColor={palette.edge}
            position={[3.4, 1.35, -1.2]}
            scale={0.9}
            speed={-0.4}
            floatAmp={0.16}
            floatPhase={1.8}
          />
          <SpinningPoly
            geometry={geoms.dodeca}
            color={palette.mint}
            edgeColor={palette.edge}
            position={[-3.5, -1.5, -1.0]}
            scale={0.85}
            speed={0.35}
            floatAmp={0.14}
            floatPhase={3.4}
          />
          <SpinningPoly
            geometry={geoms.octa}
            color={palette.mint}
            edgeColor={palette.edge}
            position={[-3.2, 1.9, -2.2]}
            scale={0.45}
            speed={0.5}
            floatAmp={0.2}
            floatPhase={5.1}
          />
          <FloatingShards color={palette.shard} />
        </Suspense>

        <OrbitControls
          autoRotate
          autoRotateSpeed={0.55}
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.55}
        />
      </Canvas>

      <div className="absolute bottom-3 right-4 text-[9.5px] font-mono uppercase tracking-[0.15em] text-ink-faint pointer-events-none">
        procedural 3D · 几何示意 · 可拖拽旋转
      </div>
    </div>
  );
}
