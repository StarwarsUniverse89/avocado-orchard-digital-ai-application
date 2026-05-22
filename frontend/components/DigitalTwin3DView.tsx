"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const orchardAssetPaths = {
  overview: "/assets/orchard-real/aerial_orchard_overview_01.png",
  droneCapture: "/assets/orchard-real/drone_capture_card.png",
};

function browserSupportsWebGL() {
  if (typeof document === "undefined") return true;

  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
}

type TreeSample = {
  id: string;
  position: [number, number, number];
  scale: number;
  height: number;
  tone: "healthy" | "medium" | "high";
  rotation: number;
};

const boundaryPoints: Array<[number, number, number]> = [
  [-50, 0.32, -24],
  [-34, 0.34, -35],
  [7, 0.35, -34],
  [48, 0.33, -18],
  [42, 0.34, 27],
  [11, 0.35, 35],
  [-39, 0.33, 28],
  [-55, 0.32, 4],
  [-50, 0.32, -24],
];

const mediumStressZone: Array<[number, number, number]> = [
  [-15, 0.42, -16],
  [16, 0.42, -19],
  [31, 0.42, 3],
  [14, 0.42, 19],
  [-19, 0.42, 12],
  [-25, 0.42, -5],
  [-15, 0.42, -16],
];

const highStressZone: Array<[number, number, number]> = [
  [14, 0.45, -4],
  [43, 0.45, -1],
  [39, 0.45, 20],
  [9, 0.45, 17],
  [14, 0.45, -4],
];

const droneRoute: Array<[number, number, number]> = [
  [-43, 9, -25],
  [-25, 10, -16],
  [-7, 9.4, -9],
  [12, 10.3, -2],
  [31, 9.2, 8],
  [42, 10.1, 21],
];

function seededNoise(index: number) {
  const x = Math.sin(index * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildShape(points: Array<[number, number, number]>) {
  const shape = new THREE.Shape();
  points.forEach(([x, , z], index) => {
    if (index === 0) shape.moveTo(x, z);
    else shape.lineTo(x, z);
  });
  return new THREE.ShapeGeometry(shape);
}

function TerrainSurface() {
  const geometry = useMemo(() => {
    const terrain = new THREE.PlaneGeometry(132, 92, 56, 38);
    const position = terrain.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const slope = x * 0.011 - y * 0.006;
      const ridge = Math.sin(x * 0.1) * 0.42 + Math.cos(y * 0.16) * 0.34;
      const small = Math.sin((x + y) * 0.43) * 0.1 + Math.cos((x - y) * 0.27) * 0.07;
      position.setZ(i, slope + ridge + small);
    }

    terrain.computeVertexNormals();
    return terrain;
  }, []);

  return (
    <group>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshLambertMaterial
          color="#2b351f"
          emissive="#10180b"
          emissiveIntensity={0.26}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.09, 0]}>
        <planeGeometry args={[132, 92]} />
        <meshBasicMaterial
          transparent
          opacity={0.22}
          color="#4b5d2f"
          depthWrite={false}
        />
      </mesh>
      {Array.from({ length: 14 }).map((_, index) => (
        <mesh
          key={`lane-${index}`}
          rotation={[-Math.PI / 2, 0.04, 0.075]}
          position={[0, 0.18, -34 + index * 5.15]}
        >
          <planeGeometry args={[114, 0.62]} />
          <meshBasicMaterial color="#6a4a28" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      ))}
      {[
        [-36, -24, 10, 4, "#324420", 0.2],
        [24, -21, 18, 7, "#29381d", 0.24],
        [-14, 21, 17, 6, "#5b4328", 0.16],
        [38, 24, 16, 5, "#3b4a22", 0.18],
      ].map(([x, z, w, h, color, opacity], index) => (
        <mesh key={`terrain-patch-${index}`} rotation={[-Math.PI / 2, 0, seededNoise(index) * 0.4]} position={[x as number, 0.2, z as number]}>
          <planeGeometry args={[w as number, h as number]} />
          <meshBasicMaterial color={color as string} transparent opacity={opacity as number} depthWrite={false} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[27, 0.18, 15]}>
        <circleGeometry args={[12, 36]} />
        <meshBasicMaterial color="#6b4325" transparent opacity={0.14} depthWrite={false} />
      </mesh>
    </group>
  );
}

function StressPolygon({
  points,
  color,
  opacity,
}: {
  points: Array<[number, number, number]>;
  color: string;
  opacity: number;
}) {
  const geometry = useMemo(() => buildShape(points), [points]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, points[0][1], 0]}>
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function TreeCrown({ tree }: { tree: TreeSample }) {
  const palette = {
    healthy: ["#385f2a", "#4f7330", "#2c4a22", "#65813a", "#1d3318"],
    medium: ["#5d642d", "#777333", "#42491f", "#7f7c3d", "#343919"],
    high: ["#5a3a29", "#70422b", "#38281e", "#6a512e", "#26301a"],
  }[tree.tone];

  const canopyOffsets: Array<[number, number, number, number]> = [
    [0, 2.0, 0, 1.15],
    [-0.95, 1.88, 0.18, 0.92],
    [0.88, 1.95, -0.24, 0.95],
    [-0.16, 2.28, 0.28, 0.78],
  ];

  return (
    <group position={tree.position} rotation={[0, tree.rotation, 0]} scale={[tree.scale * 1.05, tree.height, tree.scale * 1.18]}>
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.14, 0.22, 1.04, 7]} />
        <meshLambertMaterial color="#4a2f1b" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.34, 0.06, 0.42]}>
        <circleGeometry args={[2.45, 24]} />
        <meshBasicMaterial color="#020403" transparent opacity={0.42} depthWrite={false} />
      </mesh>
      {canopyOffsets.map(([x, y, z, size], index) => (
        <mesh
          key={`${tree.id}-crown-${index}`}
          position={[x, y, z]}
          rotation={[seededNoise(index + tree.rotation) * 0.35, seededNoise(index + tree.position[0]) * Math.PI, seededNoise(index + tree.position[2]) * 0.3]}
          scale={[1.48 * size, 0.48 * size, 1.12 * size]}
        >
          <dodecahedronGeometry args={[1.05, 0]} />
          <meshLambertMaterial
            color={palette[index % palette.length]}
            emissive={palette[index % palette.length]}
            emissiveIntensity={0.04}
          />
        </mesh>
      ))}
    </group>
  );
}

function DroneMarker() {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (Math.sin(clock.elapsedTime * 0.7) + 1) / 2;
    const a = droneRoute[2];
    const b = droneRoute[4];
    ref.current.position.set(
      THREE.MathUtils.lerp(a[0], b[0], t),
      THREE.MathUtils.lerp(a[1], b[1], t),
      THREE.MathUtils.lerp(a[2], b[2], t)
    );
    ref.current.rotation.y = clock.elapsedTime * 0.8;
  });

  return (
    <group ref={ref} position={[14, 10, 0]}>
      <mesh>
        <boxGeometry args={[1.25, 0.18, 0.55]} />
        <meshBasicMaterial color="#d8eef2" />
      </mesh>
      {[
        [-0.86, 0, -0.52],
        [0.86, 0, -0.52],
        [-0.86, 0, 0.52],
        [0.86, 0, 0.52],
      ].map(([x, y, z], index) => (
        <mesh key={`rotor-${index}`} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.34, 18]} />
          <meshBasicMaterial color="#e9fbff" transparent opacity={0.72} />
        </mesh>
      ))}
      <pointLight color="#67e8f9" intensity={1.4} distance={11} />
    </group>
  );
}

function WebGLRendererLifecycle({ onContextLost }: { onContextLost: () => void }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    gl.setPixelRatio(1);
    gl.shadowMap.enabled = false;
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn("3D View WebGL context lost; falling back to image Digital Twin");
      onContextLost();
    };

    canvas.addEventListener("webglcontextlost", handleContextLost, false);

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost, false);
      gl.dispose();
    };
  }, [gl, onContextLost]);

  return null;
}

function OrchardReconstructionScene({ onContextLost }: { onContextLost: () => void }) {
  const trees = useMemo<TreeSample[]>(() => {
    const samples: TreeSample[] = [];
    const rows = 10;
    const cols = 15;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const id = row * cols + col;
        const rowCurve = Math.sin(row * 0.9) * 1.1;
        const x = -43 + col * 5.7 + rowCurve + (seededNoise(id) - 0.5) * 1.2;
        const z = -28 + row * 5.2 + Math.sin(col * 0.55) * 0.8 + (seededNoise(id + 33) - 0.5) * 0.7;
        if (x < -51 || x > 48 || z < -35 || z > 35) continue;

        const high = x > 12 && z > -5 && z < 22;
        const medium = x > -22 && x < 29 && z > -20 && z < 19;
        samples.push({
          id: `tree-${row}-${col}`,
          position: [x, 0.15 + Math.sin((x + z) * 0.12) * 0.15, z],
          scale: 0.72 + seededNoise(id + 8) * 0.42,
          height: 0.82 + seededNoise(id + 19) * 0.22,
          rotation: seededNoise(id + 4) * Math.PI,
          tone: high ? "high" : medium ? "medium" : "healthy",
        });
      }
    }

    return samples.slice(0, 150);
  }, []);

  return (
    <>
      <WebGLRendererLifecycle onContextLost={onContextLost} />
      <PerspectiveCamera makeDefault position={[-32, 34, 50]} fov={38} />
      <OrbitControls
        target={[1, 0, 0]}
        minDistance={24}
        maxDistance={90}
        maxPolarAngle={Math.PI / 2.08}
        enableDamping
        dampingFactor={0.08}
      />
      <color attach="background" args={["#06100c"]} />
      <fog attach="fog" args={["#07110c", 92, 172]} />

      <ambientLight intensity={0.74} />
      <hemisphereLight args={["#bdd7b2", "#18220f", 0.7]} />
      <directionalLight
        position={[-28, 52, 34]}
        intensity={2.2}
      />
      <directionalLight position={[36, 24, -28]} intensity={0.8} color="#9bcf8b" />

      <TerrainSurface />
      <StressPolygon points={mediumStressZone} color="#facc15" opacity={0.16} />
      <StressPolygon points={highStressZone} color="#ef4444" opacity={0.19} />

      {trees.map((tree) => (
        <TreeCrown key={tree.id} tree={tree} />
      ))}

      <Line points={boundaryPoints} color="#dffaff" lineWidth={1.7} transparent opacity={0.9} />
      <Line points={mediumStressZone} color="#facc15" lineWidth={1.1} transparent opacity={0.68} />
      <Line points={highStressZone} color="#f87171" lineWidth={1.2} transparent opacity={0.74} />
      <Line points={droneRoute} color="#f8fafc" lineWidth={1.6} dashed dashSize={1.3} gapSize={0.9} transparent opacity={0.84} />
      <DroneMarker />
    </>
  );
}

function DroneCaptureImage({ expanded = false }: { expanded?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={orchardAssetPaths.droneCapture}
        alt="Drone capture of avocado orchard canopy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(0,0,0,0.48)_100%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.42))]" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
      <div className={`absolute rounded-md border border-cyan-200/75 bg-cyan-300/10 shadow-[0_0_22px_rgba(103,232,249,0.18)] ${expanded ? "left-[32%] top-[28%] h-[33%] w-[38%]" : "left-[31%] top-[27%] h-[34%] w-[39%]"}`}>
        <div className="absolute -top-5 left-0 rounded border border-cyan-200/30 bg-black/65 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-cyan-100">
          Leaf density cluster
        </div>
      </div>
      <div className="absolute left-[64%] top-[18%] h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(103,232,249,0.9)]" />
    </div>
  );
}

function DroneCaptureInset() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group absolute bottom-4 left-4 w-56 cursor-pointer overflow-hidden rounded-xl bg-black/70 text-left shadow-2xl shadow-black/40 outline-none ring-1 ring-white/10 backdrop-blur-md transition duration-300 hover:scale-[1.03] hover:ring-cyan-300/35 hover:shadow-[0_0_28px_rgba(103,232,249,0.16)]"
        aria-label="View full drone capture"
      >
        <div className="relative h-32 overflow-hidden rounded-xl">
          <DroneCaptureImage />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-2.5 py-2">
            <span className="rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-cyan-100 backdrop-blur">
              Drone Capture
            </span>
            <span className="rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-200 backdrop-blur">
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Live
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/88 via-black/62 to-transparent px-2.5 pb-2.5 pt-8">
            <div className="text-[10px] font-semibold text-white">May 15, 2025 · 10:42 AM</div>
            <div className="mt-0.5 flex items-center justify-between text-[9px] font-medium text-gray-300">
              <span>RGB · 42m AGL</span>
              <span className="text-cyan-200">View Full Capture</span>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_0_24px_rgba(0,0,0,0.65)]" />
        </div>
      </button>

      {open && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/62 p-6 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-[#061018] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">Drone Capture</div>
                <div className="mt-1 text-sm font-semibold text-white">Block 7A · RGB canopy inspection</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="relative h-[420px] overflow-hidden">
              <DroneCaptureImage expanded />
              <div className="absolute left-4 top-4 rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100 backdrop-blur">
                AI overlay · high density canopy
              </div>
              <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/10 bg-black/70 px-4 py-3 backdrop-blur">
                <div className="grid gap-3 text-xs text-gray-300 sm:grid-cols-4">
                  <div><span className="block text-[9px] uppercase tracking-[0.14em] text-gray-500">Timestamp</span>May 15, 2025 · 10:42 AM</div>
                  <div><span className="block text-[9px] uppercase tracking-[0.14em] text-gray-500">Mode</span>RGB / NDVI ready</div>
                  <div><span className="block text-[9px] uppercase tracking-[0.14em] text-gray-500">Altitude</span>42m AGL</div>
                  <div><span className="block text-[9px] uppercase tracking-[0.14em] text-gray-500">Detection</span>Leaf density cluster</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function HybridOrchardImageryView({ onSynthetic }: { onSynthetic: () => void }) {
  useEffect(() => {
    console.log("Using generated orchard aerial asset for Digital Twin view");
  }, []);

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-[#020507]">
      <img
        src={orchardAssetPaths.overview}
        alt="Aerial avocado orchard overview"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,transparent_42%,rgba(0,0,0,0.50)_100%),linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.40))]" />
      <div className="absolute inset-0 backdrop-saturate-[0.85]" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 640" preserveAspectRatio="none">
        <defs>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="zoneYellow" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#facc15" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id="zoneRed" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#991b1b" stopOpacity="0.26" />
          </linearGradient>
        </defs>
        <polygon
          points="82,372 164,186 392,94 692,126 910,270 856,512 596,584 268,548"
          fill="rgba(16,185,129,0.045)"
          stroke="rgba(225,250,255,0.88)"
          strokeWidth="2"
          filter="url(#softGlow)"
        />
        <polygon
          points="312,336 486,266 658,318 608,454 390,480"
          fill="url(#zoneYellow)"
          stroke="rgba(250,204,21,0.70)"
          strokeWidth="1.3"
        />
        <polygon
          points="600,354 812,360 760,496 552,472"
          fill="url(#zoneRed)"
          stroke="rgba(248,113,113,0.76)"
          strokeWidth="1.4"
        />
        <path
          d="M190 210 C 312 266, 386 302, 510 344 S 734 420, 832 516"
          fill="none"
          stroke="rgba(255,255,255,0.86)"
          strokeWidth="2"
          strokeDasharray="10 10"
        />
        <g transform="translate(516 344) rotate(18)" filter="url(#softGlow)">
          <rect x="-12" y="-3" width="24" height="6" rx="2" fill="white" />
          <rect x="-3" y="-12" width="6" height="24" rx="2" fill="white" />
          <circle cx="-16" cy="-12" r="5" fill="rgba(255,255,255,0.75)" />
          <circle cx="16" cy="-12" r="5" fill="rgba(255,255,255,0.75)" />
          <circle cx="-16" cy="12" r="5" fill="rgba(255,255,255,0.75)" />
          <circle cx="16" cy="12" r="5" fill="rgba(255,255,255,0.75)" />
        </g>
        <g opacity="0.28">
          {Array.from({ length: 16 }).map((_, index) => (
            <path
              key={`row-line-${index}`}
              d={`M ${120 + index * 42} 128 C ${188 + index * 34} 260, ${216 + index * 30} 438, ${300 + index * 28} 580`}
              stroke="rgba(224,242,187,0.38)"
              strokeWidth="1"
              fill="none"
            />
          ))}
        </g>
      </svg>

      <div className="pointer-events-none absolute right-5 top-5 w-64 rounded-lg border border-white/10 bg-black/70 p-4 shadow-2xl backdrop-blur-md">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
          Selected Zone - <span className="text-red-300">High Risk</span>
        </div>
        <div className="mt-3 space-y-2 text-xs">
          <div className="flex justify-between border-b border-white/5 pb-1.5"><span className="text-gray-500">Zone Area</span><b className="text-gray-100">2.14 ha</b></div>
          <div className="flex justify-between border-b border-white/5 pb-1.5"><span className="text-gray-500">Tree Count</span><b className="text-gray-100">612</b></div>
          <div className="flex justify-between border-b border-white/5 pb-1.5"><span className="text-gray-500">Risk Level</span><b className="text-red-300">High</b></div>
          <div className="flex justify-between border-b border-white/5 pb-1.5"><span className="text-gray-500">Est. Yield Impact</span><b className="text-amber-200">-18%</b></div>
          <div className="flex justify-between"><span className="text-gray-500">Priority Score</span><b className="text-cyan-200">87 / 100</b></div>
        </div>
      </div>

      <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-white/10 bg-black/70 px-4 py-3 backdrop-blur-md">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Operational Digital Twin</div>
        <div className="mt-1 text-sm font-semibold text-white">Los Reyes Orchard - Block 7A</div>
        <div className="mt-2 grid grid-cols-3 gap-3 text-[10px] text-gray-400">
          <span><b className="text-gray-100">Drone</b> capture</span>
          <span><b className="text-amber-200">12%</b> stress</span>
          <span><b className="text-cyan-200">91%</b> confidence</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 w-[42%] -translate-x-1/2 rounded-lg border border-white/10 bg-black/70 px-4 py-3 backdrop-blur-md">
        <div className="mb-2 text-center text-xs font-semibold text-gray-200">May 15, 2025 10:42 AM</div>
        <div className="relative h-1 rounded-full bg-gray-700">
          <span className="absolute left-[52%] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.7)]" />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-gray-500">
          <span>May 10</span><span>May 12</span><span>May 15</span><span>May 18</span><span>May 21</span>
        </div>
      </div>

      <div className="absolute right-4 bottom-4 rounded-md border border-white/10 bg-black/65 p-2.5 text-[10px] text-gray-400 backdrop-blur-md">
        <div className="mb-1.5 font-semibold uppercase tracking-[0.14em] text-gray-300">Layers</div>
        <div className="space-y-1">
          <div><span className="mr-2 inline-block h-2 w-2 rounded-full bg-white" />orchard boundary</div>
          <div><span className="mr-2 inline-block h-2 w-2 rounded-full bg-amber-300" />medium stress</div>
          <div><span className="mr-2 inline-block h-2 w-2 rounded-full bg-red-400" />high stress</div>
          <div><span className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan-300" />drone route</div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSynthetic}
        className="absolute right-4 top-[190px] rounded-md border border-white/10 bg-black/55 px-3 py-1.5 text-[10px] font-semibold text-gray-300 backdrop-blur hover:border-cyan-300/30 hover:text-cyan-200"
      >
        Synthetic Twin
      </button>

      <DroneCaptureInset />
    </div>
  );
}

function SyntheticTwinView({ onHybrid }: { onHybrid: () => void }) {
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);
  const handleContextLost = useCallback(() => {
    setWebglAvailable(false);
  }, []);

  useEffect(() => {
    setWebglAvailable(browserSupportsWebGL());
  }, []);

  if (webglAvailable === false) {
    return <HybridOrchardImageryView onSynthetic={() => setWebglAvailable(browserSupportsWebGL())} />;
  }

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-[#020507]">
      {webglAvailable && (
        <Canvas
          dpr={1}
          gl={{ antialias: false, alpha: false, powerPreference: "low-power" }}
          fallback={<HybridOrchardImageryView onSynthetic={() => setWebglAvailable(browserSupportsWebGL())} />}
        >
          <Suspense fallback={null}>
            <OrchardReconstructionScene onContextLost={handleContextLost} />
          </Suspense>
        </Canvas>
      )}
      {webglAvailable === null && (
        <div className="absolute inset-0 bg-[#020507]">
          <HybridOrchardImageryView onSynthetic={() => setWebglAvailable(browserSupportsWebGL())} />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_48%,rgba(0,0,0,0.34)_100%),linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.24))]" />

      <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-white/10 bg-black/70 px-4 py-3 backdrop-blur-md">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Synthetic Twin</div>
        <div className="mt-1 text-sm font-semibold text-white">Procedural orchard fallback</div>
        <div className="mt-2 grid grid-cols-3 gap-3 text-[10px] text-gray-400">
          <span><b className="text-gray-100">150</b> canopy samples</span>
          <span><b className="text-amber-200">12%</b> stress</span>
          <span><b className="text-cyan-200">91%</b> confidence</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onHybrid}
        className="absolute right-4 top-4 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-semibold text-cyan-200 backdrop-blur hover:bg-cyan-300/15"
      >
        Hybrid Drone View
      </button>

      <DroneCaptureInset />
    </div>
  );
}

export default function DigitalTwin3DView() {
  const [viewMode, setViewMode] = useState<"hybrid" | "synthetic">("hybrid");

  useEffect(() => {
    console.log("3D View mounted");

    return () => {
      console.log("3D View unmounted");
    };
  }, []);

  if (viewMode === "synthetic") {
    return <SyntheticTwinView onHybrid={() => setViewMode("hybrid")} />;
  }

  return <HybridOrchardImageryView onSynthetic={() => setViewMode("synthetic")} />;
}
