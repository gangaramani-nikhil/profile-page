import * as THREE from 'three';

/**
 * Rasterizes a terminal token to a CanvasTexture so the 3D pipeline can float
 * real text without fetching font files at runtime (no network dependency,
 * no layout thrash). One small canvas per unique token, cached.
 */
const cache = new Map<string, THREE.CanvasTexture>();

export function makeTextTexture(text: string, color = '#00ff9c'): THREE.CanvasTexture {
  const key = `${text}|${color}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const font = '600 28px "JetBrains Mono", monospace';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 24;
  canvas.width = Math.max(2, w);
  canvas.height = 48;

  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = color;
  ctx.fillText(text, 12, canvas.height / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  cache.set(key, tex);
  return tex;
}

export function textAspect(tex: THREE.CanvasTexture): number {
  const img = tex.image as HTMLCanvasElement;
  return img.width / img.height;
}
