import { useEffect, useRef } from 'react';
import { useOnScreen, usePrefersReducedMotion } from '../../lib/hooks';

/**
 * 2D phosphor flow-field: particles advected through a layered-sine vector
 * field, leaving CRT-style trails. This is the hero's guaranteed-cheap
 * ambient layer — on mobile (where the WebGL NeuralCanvas is disabled) it is
 * cranked up via `density` and `speed` to carry the section alone.
 */
interface FlowFieldProps {
  density?: number;
  speed?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  life: number;
}

export function FlowField({ density = 1, speed = 1, className = '' }: FlowFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hostRef, visible] = useOnScreen<HTMLDivElement>('0px');
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let raf = 0;
    let running = false;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const spawn = (p: Particle) => {
      p.x = Math.random() * w;
      p.y = Math.random() * h;
      p.life = 40 + Math.random() * 160;
    };

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = 'rgb(5 8 7)';
      ctx.fillRect(0, 0, w, h);
      const count = Math.floor(((w * h) / 9000) * density);
      particles = Array.from({ length: count }, () => {
        const p = { x: 0, y: 0, life: 0 };
        spawn(p);
        return p;
      });
    };

    const field = (x: number, y: number, t: number) => {
      const s = 0.006;
      return (
        Math.sin(x * s * 1.3 + t * 0.32) +
        Math.cos(y * s * 1.7 - t * 0.23) +
        Math.sin((x + y) * s * 0.6 + t * 0.11) * 1.4
      );
    };

    let t = Math.random() * 100;
    const step = () => {
      if (!running) return;
      t += 0.016 * speed;
      ctx.fillStyle = 'rgba(5, 8, 7, 0.085)';
      ctx.fillRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (const p of particles) {
        const a = field(p.x, p.y, t) * Math.PI;
        const v = (0.6 + Math.abs(Math.sin(p.x * 0.01 + t))) * 1.1 * speed;
        const nx = p.x + Math.cos(a) * v;
        const ny = p.y + Math.sin(a) * v;
        ctx.strokeStyle = p.life % 90 > 84 ? 'rgba(34, 211, 238, 0.5)' : 'rgba(0, 255, 156, 0.28)';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        p.x = nx;
        p.y = ny;
        p.life -= 1;
        if (p.life <= 0 || p.x < -4 || p.x > w + 4 || p.y < -4 || p.y > h + 4) spawn(p);
      }
      raf = requestAnimationFrame(step);
    };

    const setRunning = (on: boolean) => {
      if (on === running) return;
      running = on;
      if (on) raf = requestAnimationFrame(step);
      else cancelAnimationFrame(raf);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    const onVis = () => setRunning(!document.hidden && visible);
    document.addEventListener('visibilitychange', onVis);
    setRunning(visible && !document.hidden);

    return () => {
      setRunning(false);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [density, speed, visible, reduced]);

  return (
    <div ref={hostRef} className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
