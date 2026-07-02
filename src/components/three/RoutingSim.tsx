import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useIsMobile } from '../../lib/hooks';

/**
 * High-throughput routing sim: particles are ingested on the left, converge
 * on the router core, and fan out to consumer sinks — visualizing the
 * 40–100M points/day pipeline. All particle motion is computed in the vertex
 * shader over an InstancedBufferGeometry: one draw call regardless of count.
 */

const INGRESS_Y = [1.7, 0.85, 0, -0.85, -1.7];
const EGRESS_Y = [1.5, 0.5, -0.5, -1.5];
const EGRESS_COLORS = ['#22d3ee', '#00ff9c', '#ffb454', '#f472b6'];

const VERT = /* glsl */ `
attribute float aPhase;
attribute float aYIn;
attribute float aYOut;
attribute float aSeed;
attribute vec3 aColor;

uniform float uTime;

varying vec3 vColor;
varying float vT;
varying vec2 vUv;

vec2 bez(vec2 a, vec2 b, vec2 c, float t) {
  return mix(mix(a, b, t), mix(b, c, t), t);
}

void main() {
  vUv = uv;
  float speed = 0.14 * (0.7 + 0.6 * fract(aSeed * 3.71));
  float t = fract(aPhase + uTime * speed);
  vec2 p;
  if (t < 0.5) {
    p = bez(vec2(-4.6, aYIn), vec2(-1.4, aYIn * 0.22), vec2(0.0, 0.0), t * 2.0);
  } else {
    p = bez(vec2(0.0, 0.0), vec2(1.4, aYOut * 0.22), vec2(4.6, aYOut), (t - 0.5) * 2.0);
  }
  p.y += sin(aSeed * 61.0 + t * 20.0) * 0.06;
  float z = sin(aSeed * 40.0 + t * 12.0) * 0.15;

  vColor = aColor;
  vT = t;

  vec4 mv = modelViewMatrix * vec4(p, z, 1.0);
  float scale = 0.045 + 0.035 * fract(aSeed * 9.13);
  scale *= 1.0 + 1.1 * exp(-abs(t - 0.5) * 9.0); // flare through the router
  mv.xy += position.xy * scale;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vT;
varying vec2 vUv;

void main() {
  float r = length(vUv - 0.5);
  float alpha = 1.0 - smoothstep(0.12, 0.5, r);
  // ingress runs phosphor green, colour switches to its route after the core
  vec3 ingress = vec3(0.0, 1.0, 0.61);
  vec3 col = mix(ingress, vColor, smoothstep(0.48, 0.56, vT));
  col *= 0.85 + 0.6 * exp(-abs(vT - 0.5) * 8.0);
  alpha *= 0.8;
  if (alpha < 0.02) discard;
  gl_FragColor = vec4(col, alpha);
}
`;

function buildGeometry(count: number): THREE.InstancedBufferGeometry {
  const base = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.attributes.position = base.attributes.position;
  geo.attributes.uv = base.attributes.uv;
  geo.instanceCount = count;

  const phase = new Float32Array(count);
  const yIn = new Float32Array(count);
  const yOut = new Float32Array(count);
  const seed = new Float32Array(count);
  const color = new Float32Array(count * 3);
  const c = new THREE.Color();

  for (let i = 0; i < count; i++) {
    phase[i] = Math.random();
    yIn[i] = INGRESS_Y[i % INGRESS_Y.length] + (Math.random() - 0.5) * 0.3;
    const egress = (i * 7) % EGRESS_Y.length;
    yOut[i] = EGRESS_Y[egress] + (Math.random() - 0.5) * 0.24;
    seed[i] = Math.random();
    c.set(EGRESS_COLORS[egress]).toArray(color, i * 3);
  }

  geo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phase, 1));
  geo.setAttribute('aYIn', new THREE.InstancedBufferAttribute(yIn, 1));
  geo.setAttribute('aYOut', new THREE.InstancedBufferAttribute(yOut, 1));
  geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 1));
  geo.setAttribute('aColor', new THREE.InstancedBufferAttribute(color, 3));
  return geo;
}

export function RoutingSim() {
  const isMobile = useIsMobile();
  const router = useRef<THREE.LineSegments>(null);

  const geo = useMemo(() => buildGeometry(isMobile ? 1100 : 2600), [isMobile]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 } },
      }),
    [],
  );

  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
    if (router.current) {
      router.current.rotation.y = clock.elapsedTime * 0.5;
      router.current.rotation.x = clock.elapsedTime * 0.23;
    }
  });

  return (
    <group>
      <mesh geometry={geo} material={mat} frustumCulled={false} />

      {/* router core */}
      <lineSegments ref={router}>
        <edgesGeometry args={[new THREE.OctahedronGeometry(0.55, 0)]} />
        <lineBasicMaterial color="#00ff9c" transparent opacity={0.9} />
      </lineSegments>

      {/* ingress sources */}
      {INGRESS_Y.map((y) => (
        <lineSegments key={`in-${y}`} position={[-4.75, y, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(0.3, 0.3, 0.3)]} />
          <lineBasicMaterial color="#7a948a" transparent opacity={0.6} />
        </lineSegments>
      ))}

      {/* consumer sinks, tinted by their route */}
      {EGRESS_Y.map((y, i) => (
        <lineSegments key={`out-${y}`} position={[4.75, y, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(0.34, 0.34, 0.34)]} />
          <lineBasicMaterial color={EGRESS_COLORS[i]} transparent opacity={0.8} />
        </lineSegments>
      ))}
    </group>
  );
}
