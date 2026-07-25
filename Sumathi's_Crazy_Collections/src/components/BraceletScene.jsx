import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ── Simple seeded random (stable across renders) ── */
const srand = (seed) => {
  const x = Math.sin(seed * 127.1 + 42) * 43758.5453;
  return x - Math.floor(x);
};

/* ── Colorful Floating Sparkle Particles ── */
function Sparkles() {
  const groupRef = useRef(null);

  const sparkleColors = useMemo(
    () => [
      { color: "#FF6B9D", size: 0.07 },
      { color: "#6BCBFF", size: 0.06 },
      { color: "#FFD93D", size: 0.07 },
      { color: "#6FCF97", size: 0.06 },
      { color: "#C084FC", size: 0.05 },
      { color: "#FF8C42", size: 0.05 },
    ],
    []
  );

  const positionsByColor = useMemo(
    () =>
      sparkleColors.map((_, ci) => {
        const pos = new Float32Array(40 * 3);
        for (let i = 0; i < 40; i++) {
          const r = 2.5 + srand(ci * 100 + i * 3) * 2.5;
          const theta = srand(ci * 100 + i * 3 + 1) * Math.PI * 2;
          const phi = srand(ci * 100 + i * 3 + 2) * Math.PI * 2;
          pos[i * 3] = Math.cos(theta) * Math.sin(phi) * r;
          pos[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * r;
          pos[i * 3 + 2] = Math.cos(phi) * r;
        }
        return pos;
      }),
    [sparkleColors]
  );

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.04;
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.03) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {sparkleColors.map((sc, i) => (
        <Points key={i} positions={positionsByColor[i]} stride={3} frustumCulled={false}>
          <PointMaterial
            transparent
            color={sc.color}
            size={sc.size}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={0.85}
          />
        </Points>
      ))}
    </group>
  );
}

/* ── Rotating Beaded Bracelet ── */
function BeadedBracelet() {
  const groupRef = useRef(null);
  const glowRef = useRef(null);

  useFrame(({ pointer, clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.006;
      groupRef.current.rotation.x += (pointer.y * 0.3 - groupRef.current.rotation.x) * 0.03;
      groupRef.current.rotation.z += (pointer.x * 0.2 - groupRef.current.rotation.z) * 0.03;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 0.5) * 0.05);
    }
  });

  /* ── Vivid gemstone palette ── */
  const colorPalette = useMemo(() => [
    "#FF3366", // vibrant ruby
    "#FF6633", // fiery orange
    "#FFD700", // golden topaz
    "#33CC66", // emerald
    "#3399FF", // sapphire
    "#9933FF", // amethyst
    "#FF33CC", // magenta
    "#33FFFF", // aqua
    "#FF9966", // peach
    "#66FF66", // lime
    "#FF66B2", // rose
    "#9966FF", // lavender
    "#33CCCC", // teal
    "#FFCC33", // amber
  ], []);

  const beads = useMemo(() => {
    const count = 28;
    const radius = 2.0;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const colorIndex = i % colorPalette.length;
      return {
        position: [
          Math.cos(angle) * radius,
          Math.sin(angle * 0.6) * 0.3,
          Math.sin(angle) * radius,
        ],
        scale: 0.18 + srand(i + 1) * 0.06,
        color: colorPalette[colorIndex],
        emissive: colorPalette[colorIndex],
        speed: 0.4 + srand(i + 100) * 0.3,
      };
    });
  }, [colorPalette]);

  return (
    <group ref={groupRef}>
      {/* Ambient glow ring */}
      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 2.4, 64]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Inner glow */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.6, 1.9, 64]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-3, -2, -3]} intensity={0.4} color="#FF66B2" />
      <pointLight position={[0, -3, 0]} intensity={0.3} color="#3399FF" />

      {/* Beads — each with its own gemstone color */}
      {beads.map((bead, i) => (
        <Sphere
          key={i}
          args={[bead.scale, 32, 32]}
          position={bead.position}
        >
          <MeshDistortMaterial
            color={bead.color}
            roughness={0.12}
            metalness={0.3}
            distort={0.08}
            speed={bead.speed}
            emissive={bead.emissive}
            emissiveIntensity={0.15}
          />
        </Sphere>
      ))}

      {/* Floating sparkles */}
      <Sparkles />
    </group>
  );
}

/* ── Main Scene ── */
function BraceletScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <BeadedBracelet />
    </Canvas>
  );
}

export default BraceletScene;
