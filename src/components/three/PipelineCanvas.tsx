import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { pipelineFragment, pipelineVertex } from './pipelineShaders';
import { onRipple, type RippleEvent } from '../../lib/rippleBus';
import { makeTextTexture, textAspect } from '../../lib/textSprite';
import { pipelineTokens } from '../../data/profile';
import { useIsMobile, usePrefersReducedMotion } from '../../lib/hooks';

/**
 * The site's connective tissue: a fixed, full-viewport R3F canvas that flies
 * the camera through a 3D data pipeline as the user scrolls. Strictly
 * on-demand — frames render only while scroll position or a ripple is
 * actively animating, and never while the tab is hidden.
 */

const CAM_START_Z = 8;
const CAM_TRAVEL = 62;

interface SharedRefs {
  target: React.MutableRefObject<number>;
  ripple: React.MutableRefObject<{ x: number; y: number; strength: number; t0: number }>;
}

function buildParticleGeometry(count: number): THREE.InstancedBufferGeometry {
  const base = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.attributes.position = base.attributes.position;
  geo.attributes.uv = base.attributes.uv;
  geo.instanceCount = count;

  const start = new Float32Array(count * 3);
  const chunk = new Float32Array(count * 3);
  const embed = new Float32Array(count * 3);
  const seed = new Float32Array(count);

  // Chunk stage: particles collapse onto ~48 cluster centres mid-tunnel.
  const clusters: THREE.Vector3[] = [];
  for (let i = 0; i < 48; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 1.6 + Math.random() * 3.6;
    clusters.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, -16 - Math.random() * 26));
  }

  // Embedding stage: constellations of tight shells deep in the tunnel.
  const shells: THREE.Vector3[] = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const r = 2.2 + (i % 3) * 1.3;
    shells.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, -44 - (i % 4) * 6));
  }

  for (let i = 0; i < count; i++) {
    // Raw stage: wide scatter through the whole tube.
    const a0 = Math.random() * Math.PI * 2;
    const r0 = 2.5 + Math.random() * 6.5;
    start[i * 3] = Math.cos(a0) * r0;
    start[i * 3 + 1] = Math.sin(a0) * r0;
    start[i * 3 + 2] = 14 - Math.random() * 78;

    const c = clusters[i % clusters.length];
    chunk[i * 3] = c.x + (Math.random() - 0.5) * 1.1;
    chunk[i * 3 + 1] = c.y + (Math.random() - 0.5) * 1.1;
    chunk[i * 3 + 2] = c.z + (Math.random() - 0.5) * 1.4;

    const s = shells[i % shells.length];
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const sr = 0.9 + Math.random() * 0.35;
    embed[i * 3] = s.x + Math.sin(phi) * Math.cos(theta) * sr;
    embed[i * 3 + 1] = s.y + Math.sin(phi) * Math.sin(theta) * sr;
    embed[i * 3 + 2] = s.z + Math.cos(phi) * sr;

    seed[i] = Math.random();
  }

  geo.setAttribute('aStart', new THREE.InstancedBufferAttribute(start, 3));
  geo.setAttribute('aChunk', new THREE.InstancedBufferAttribute(chunk, 3));
  geo.setAttribute('aEmbed', new THREE.InstancedBufferAttribute(embed, 3));
  geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 1));
  return geo;
}

function buildTunnelRings(): THREE.BufferGeometry {
  const pts: number[] = [];
  const SEGMENTS = 48;
  for (let ring = 0; ring < 24; ring++) {
    const z = 12 - ring * 3.4;
    const radius = 7 + Math.sin(ring * 1.7) * 0.6;
    for (let s = 0; s < SEGMENTS; s++) {
      const a1 = (s / SEGMENTS) * Math.PI * 2;
      const a2 = ((s + 1) / SEGMENTS) * Math.PI * 2;
      pts.push(Math.cos(a1) * radius, Math.sin(a1) * radius, z);
      pts.push(Math.cos(a2) * radius, Math.sin(a2) * radius, z);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return geo;
}

function TextNodes({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);

  const sprites = useMemo(
    () =>
      pipelineTokens.flatMap((token, i) => {
        const tex = makeTextTexture(token, i % 5 === 0 ? '#ffb454' : '#00ff9c');
        const aspect = textAspect(tex);
        return [0, 1].map((copy) => {
          const a = Math.random() * Math.PI * 2;
          const r = 2.2 + Math.random() * 4.5;
          return {
            tex,
            aspect,
            pos: new THREE.Vector3(
              Math.cos(a) * r,
              Math.sin(a) * r,
              8 - (i * 2.4 + copy * 19) - Math.random() * 3,
            ),
            key: `${token}-${copy}`,
          };
        });
      }),
    [],
  );

  useFrame(({ camera }) => {
    const g = group.current;
    if (!g) return;
    const fadeAll = 1 - THREE.MathUtils.smoothstep(progressRef.current, 0.55, 0.8);
    g.children.forEach((child) => {
      const mesh = child as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
      const dist = camera.position.z - mesh.position.z;
      const vis =
        THREE.MathUtils.smoothstep(dist, 1.5, 7) *
        (1 - THREE.MathUtils.smoothstep(dist, 26, 38));
      mesh.material.opacity = vis * fadeAll * 0.55;
      mesh.quaternion.copy(camera.quaternion);
    });
  });

  return (
    <group ref={group}>
      {sprites.map((s) => (
        <mesh key={s.key} position={s.pos} scale={[s.aspect * 0.6, 0.6, 1]}>
          <planeGeometry />
          <meshBasicMaterial
            map={s.tex}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

function PipelineRig({ target, ripple }: SharedRefs) {
  const { invalidate, camera } = useThree();
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const progress = useRef(0);

  const particleGeo = useMemo(() => buildParticleGeometry(isMobile ? 520 : 1500), [isMobile]);
  const ringGeo = useMemo(() => buildTunnelRings(), []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: pipelineVertex,
        fragmentShader: pipelineFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uNoiseAmp: { value: reduced ? 0 : 0.16 },
          uRippleOrigin: { value: new THREE.Vector2(0, 0) },
          uRippleAge: { value: 99 },
          uRippleStrength: { value: 0 },
          uColText: { value: new THREE.Color('#00ff9c') },
          uColChunk: { value: new THREE.Color('#ffb454') },
          uColEmbed: { value: new THREE.Color('#22d3ee') },
        },
      }),
    [reduced],
  );

  useEffect(() => () => {
    particleGeo.dispose();
    ringGeo.dispose();
    material.dispose();
  }, [particleGeo, ringGeo, material]);

  useFrame((state, delta) => {
    // Ease toward the live scroll position.
    const t = target.current;
    if (reduced) {
      progress.current = t;
    } else {
      progress.current += (t - progress.current) * Math.min(1, delta * 6);
    }
    const p = progress.current;

    camera.position.z = CAM_START_Z - p * CAM_TRAVEL;
    camera.position.x = Math.sin(p * Math.PI * 2) * 0.7;
    camera.position.y = Math.cos(p * Math.PI * 1.5) * 0.45;
    camera.rotation.z = Math.sin(p * Math.PI) * 0.05;

    const now = state.clock.elapsedTime;
    const rip = ripple.current;
    const age = now - rip.t0;

    const u = material.uniforms;
    u.uProgress.value = p;
    u.uTime.value = now;
    u.uRippleOrigin.value.set(rip.x, rip.y);
    u.uRippleAge.value = Math.min(age, 99);
    u.uRippleStrength.value = reduced ? 0 : rip.strength;
    // Ripples also pump the ambient noise amplitude for the "ink splash".
    u.uNoiseAmp.value = reduced ? 0 : 0.16 + Math.exp(-age * 2) * rip.strength * 0.25;

    // Keep the demand loop alive only while something is actually moving.
    const settling = Math.abs(t - progress.current) > 0.0006;
    const rippling = age < 1.8;
    if ((settling || rippling) && !document.hidden) invalidate();
  });

  return (
    <>
      <mesh geometry={particleGeo} material={material} frustumCulled={false} />
      <lineSegments geometry={ringGeo}>
        <lineBasicMaterial
          color="#123528"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      <TextNodes progressRef={progress} />
    </>
  );
}

export function PipelineCanvas() {
  const isMobile = useIsMobile();
  const target = useRef(0);
  const ripple = useRef({ x: 0, y: 0, strength: 0, t0: -99 });
  const invalidateRef = useRef<() => void>(() => {});

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      invalidateRef.current();
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const offRipple = onRipple((e: RippleEvent) => {
      ripple.current = { x: e.x, y: e.y, strength: e.strength, t0: performance.now() / 1000 };
      // Clock and performance.now share an epoch closely enough after the
      // rig rewrites t0 on its first frame; simplest is to let the rig stamp it.
      ripple.current.t0 = -1; // sentinel: rig stamps with its own clock
      invalidateRef.current();
    });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      offRipple();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <Canvas
        frameloop="demand"
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 62, near: 0.1, far: 130, position: [0, 0, CAM_START_Z] }}
        onCreated={({ gl, invalidate }) => {
          gl.setClearColor(0x000000, 0);
          invalidateRef.current = invalidate;
        }}
      >
        <RippleStamper ripple={ripple} />
        <PipelineRig target={target} ripple={ripple} />
      </Canvas>
      {/* scrim keeps foreground terminal text readable over the pipeline */}
      <div className="absolute inset-0 bg-bg/30" />
    </div>
  );
}

/** Stamps incoming ripples with the R3F clock so ages stay consistent. */
function RippleStamper({ ripple }: { ripple: SharedRefs['ripple'] }) {
  useFrame(({ clock }) => {
    if (ripple.current.t0 === -1) ripple.current.t0 = clock.elapsedTime;
  });
  return null;
}
