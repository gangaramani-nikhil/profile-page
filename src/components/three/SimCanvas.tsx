import type { ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useOnScreen, usePrefersReducedMotion } from '../../lib/hooks';

/**
 * Wrapper for the per-project WebGL planes attached to card DOM rects.
 * Scroll-gated on-demand rendering: the canvas only mounts while its rect
 * intersects the viewport (± margin), uses frameloop="demand", and the
 * Ticker re-invalidates each frame only while visible — so a card fully
 * off-screen costs zero GPU.
 */
function Ticker({ paused }: { paused: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => {
    if (!paused && !document.hidden) invalidate();
  });
  return null;
}

export function SimCanvas({
  children,
  className = '',
  cameraZ = 8,
  fov = 45,
}: {
  children: ReactNode;
  className?: string;
  cameraZ?: number;
  fov?: number;
}) {
  const [ref, visible] = useOnScreen<HTMLDivElement>('120px');
  const reduced = usePrefersReducedMotion();

  return (
    <div ref={ref} className={`relative ${className}`} aria-hidden>
      {visible && (
        <Canvas
          frameloop="demand"
          dpr={[1, 1.75]}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0, cameraZ], fov, near: 0.1, far: 60 }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <Ticker paused={reduced} />
          {children}
        </Canvas>
      )}
    </div>
  );
}
