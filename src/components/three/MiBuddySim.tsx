import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * MI Buddy architectural sim: an SEC 13F filing (left) continuously breaks
 * into chunks that fly into vector space (center); every few seconds a query
 * pulse fires from the answer panel (right), the nearest embeddings light up,
 * and retrieval beams return the highlighted result.
 *
 * Chunks + embeddings are InstancedMesh — the whole sim is ~6 draw calls.
 */

const CHUNKS = 90;
const EMBEDS = 150;
const HITS = 6;
const CYCLE = 7; // seconds

const tmpObj = new THREE.Object3D();

function bez(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, t: number, out: THREE.Vector3) {
  const ab = out.copy(a).lerp(b, t);
  const bc = b.clone().lerp(c, t);
  return ab.lerp(bc, t);
}

export function MiBuddySim() {
  const chunkMesh = useRef<THREE.InstancedMesh>(null);
  const embedMesh = useRef<THREE.InstancedMesh>(null);
  const hitMesh = useRef<THREE.InstancedMesh>(null);
  const queryDot = useRef<THREE.Mesh>(null);
  const beams = useRef<THREE.LineSegments>(null);
  const answerRows = useRef<THREE.Group>(null);

  const data = useMemo(() => {
    const clusterCenter = new THREE.Vector3(0.3, 0.1, 0);
    const docRows = Array.from({ length: CHUNKS }, (_, i) => {
      return new THREE.Vector3(-3.1 + (Math.random() - 0.5) * 0.9, 1.2 - (i % 9) * 0.3, 0.1);
    });
    const cluster = Array.from({ length: EMBEDS }, () => {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 0.4 + Math.random() * 1.15;
      return new THREE.Vector3(
        clusterCenter.x + Math.sin(phi) * Math.cos(theta) * r * 1.25,
        clusterCenter.y + Math.sin(phi) * Math.sin(theta) * r,
        clusterCenter.z + Math.cos(phi) * r * 0.7,
      );
    });
    const chunkTargets = Array.from({ length: CHUNKS }, (_, i) => cluster[i % EMBEDS]);
    const mid = new THREE.Vector3(-1.4, 1.5, 0.4);
    const seeds = Array.from({ length: CHUNKS }, () => Math.random());
    const hits = Array.from({ length: HITS }, (_, i) => cluster[(i * 23) % EMBEDS]);
    const panel = new THREE.Vector3(3.05, 0.1, 0);
    return { clusterCenter, docRows, cluster, chunkTargets, mid, seeds, hits, panel };
  }, []);

  const beamGeo = useMemo(() => {
    const pos = new Float32Array(HITS * 2 * 3);
    for (let i = 0; i < HITS; i++) {
      data.hits[i].toArray(pos, i * 6);
      data.panel.toArray(pos, i * 6 + 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [data]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const cycle = t % CYCLE;
    const v = new THREE.Vector3();

    // Continuous chunk stream: document → vector space.
    const cm = chunkMesh.current;
    if (cm) {
      for (let i = 0; i < CHUNKS; i++) {
        const lt = (t * 0.12 + data.seeds[i]) % 1;
        bez(data.docRows[i], data.mid, data.chunkTargets[i], lt, v);
        tmpObj.position.copy(v);
        const s = 0.09 * (1 - lt * 0.55);
        tmpObj.scale.setScalar(Math.max(s, 0.03));
        tmpObj.rotation.set(lt * 5 + i, lt * 3, 0);
        tmpObj.updateMatrix();
        cm.setMatrixAt(i, tmpObj.matrix);
      }
      cm.instanceMatrix.needsUpdate = true;
    }

    // Standing embedding cloud breathes gently.
    const em = embedMesh.current;
    if (em) {
      em.rotation.y = Math.sin(t * 0.18) * 0.25;
      em.rotation.x = Math.cos(t * 0.13) * 0.12;
    }

    // Query pulse: panel → cluster (3.0s..3.9s of the cycle).
    const q = queryDot.current;
    if (q) {
      const qt = THREE.MathUtils.clamp((cycle - 3.0) / 0.9, 0, 1);
      q.visible = cycle >= 3.0 && cycle < 4.0;
      q.position.lerpVectors(data.panel, data.clusterCenter, qt);
      q.scale.setScalar(0.1 + Math.sin(qt * Math.PI) * 0.08);
    }

    // Hits flare + retrieval beams return (3.9s..6.2s).
    const hitOn = THREE.MathUtils.smoothstep(cycle, 3.9, 4.3) * (1 - THREE.MathUtils.smoothstep(cycle, 5.9, 6.4));
    const hm = hitMesh.current;
    if (hm) {
      for (let i = 0; i < HITS; i++) {
        tmpObj.position.copy(data.hits[i]);
        tmpObj.scale.setScalar(0.05 + hitOn * (0.11 + Math.sin(t * 6 + i) * 0.02));
        tmpObj.rotation.set(0, 0, 0);
        tmpObj.updateMatrix();
        hm.setMatrixAt(i, tmpObj.matrix);
      }
      hm.instanceMatrix.needsUpdate = true;
      (hm.material as THREE.MeshBasicMaterial).opacity = 0.25 + hitOn * 0.75;
    }
    if (beams.current) {
      (beams.current.material as THREE.LineBasicMaterial).opacity = hitOn * 0.65;
    }

    // Answer rows stream into the panel while beams are live.
    const rows = answerRows.current;
    if (rows) {
      rows.children.forEach((row, i) => {
        const rt = THREE.MathUtils.clamp((cycle - 4.2 - i * 0.4) / 0.7, 0, 1) * hitOn;
        row.scale.x = Math.max(rt, 0.001);
      });
    }
  });

  return (
    <group position={[0, -0.1, 0]}>
      {/* SEC 13F document */}
      <lineSegments position={[-3.1, 0, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(1.5, 3.2)]} />
        <lineBasicMaterial color="#00ff9c" transparent opacity={0.7} />
      </lineSegments>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[-3.15, 1.2 - i * 0.34, 0]}>
          <planeGeometry args={[1.1 - (i % 3) * 0.22, 0.045]} />
          <meshBasicMaterial color="#00ff9c" transparent opacity={0.35} />
        </mesh>
      ))}

      {/* chunk stream */}
      <instancedMesh ref={chunkMesh} args={[undefined, undefined, CHUNKS]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ffb454" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>

      {/* standing vector space */}
      <instancedMesh
        ref={embedMesh}
        args={[undefined, undefined, EMBEDS]}
        frustumCulled={false}
        onUpdate={(m) => {
          for (let i = 0; i < EMBEDS; i++) {
            tmpObj.position.copy(data.cluster[i]);
            tmpObj.scale.setScalar(0.035 + (i % 5) * 0.008);
            tmpObj.updateMatrix();
            m.setMatrixAt(i, tmpObj.matrix);
          }
          m.instanceMatrix.needsUpdate = true;
        }}
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>

      {/* retrieval hits */}
      <instancedMesh ref={hitMesh} args={[undefined, undefined, HITS]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#00ff9c" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>

      {/* query pulse + retrieval beams */}
      <mesh ref={queryDot} visible={false}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#f472b6" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <lineSegments ref={beams} geometry={beamGeo}>
        <lineBasicMaterial color="#00ff9c" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>

      {/* answer panel */}
      <lineSegments position={[3.05, 0.1, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(1.7, 2.2)]} />
        <lineBasicMaterial color="#22d3ee" transparent opacity={0.7} />
      </lineSegments>
      <group ref={answerRows}>
        {Array.from({ length: 4 }, (_, i) => (
          <mesh key={i} position={[2.45, 0.7 - i * 0.4, 0]} scale={[0.001, 1, 1]}>
            <planeGeometry args={[1.3, 0.07]} />
            <meshBasicMaterial color="#00ff9c" transparent opacity={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
