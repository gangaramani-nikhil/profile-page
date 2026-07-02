import { useEffect, useRef } from 'react';
import { useOnScreen, usePrefersReducedMotion } from '../../lib/hooks';

/**
 * Raw WebGL (no three.js) fullscreen-shader layer for the hero: a slowly
 * pulsing voronoi "neural membrane". Desktop only — mobile viewports get the
 * boosted 2D FlowField instead. Render loop is gated by an
 * IntersectionObserver and the page visibility API.
 */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0) * 7.0;

  float f1 = 8.0;
  float f2 = 8.0;
  vec2 cellId = vec2(0.0);
  vec2 g0 = floor(p);
  for (int dy = -1; dy <= 1; dy++) {
    for (int dx = -1; dx <= 1; dx++) {
      vec2 g = g0 + vec2(float(dx), float(dy));
      vec2 o = hash(g);
      o = 0.5 + 0.38 * sin(uTime * 0.5 + 6.2831 * o);
      vec2 r = g + o - p;
      float d = dot(r, r);
      if (d < f1) { f2 = f1; f1 = d; cellId = g; }
      else if (d < f2) { f2 = d; }
    }
  }

  float membrane = smoothstep(0.10, 0.0, f2 - f1);
  float node = smoothstep(0.055, 0.0, f1);
  float pulse = 0.45 + 0.55 * sin(uTime * 1.8 + dot(cellId, vec2(3.13, 1.71)));

  vec3 green = vec3(0.0, 1.0, 0.612);
  vec3 cyan = vec3(0.133, 0.827, 0.933);
  vec3 col = green * node * pulse + cyan * membrane * 0.30;

  float vign = smoothstep(1.25, 0.35, distance(uv, vec2(0.5)));
  float alpha = clamp(node * pulse * 0.75 + membrane * 0.20, 0.0, 1.0) * vign * 0.55;
  gl_FragColor = vec4(col, alpha);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) ?? 'shader compile failed');
  }
  return sh;
}

export function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hostRef, visible] = useOnScreen<HTMLDivElement>('0px');
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    if (!gl) return; // FlowField still carries the hero

    let program: WebGLProgram;
    try {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    } catch {
      return;
    }

    gl.useProgram(program);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    // One oversized triangle covers the viewport with no seam.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'uRes');
    const uTime = gl.getUniformLocation(program, 'uTime');
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    let raf = 0;
    let running = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const t0 = performance.now();
    const frame = () => {
      if (!running) return;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };

    const setRunning = (on: boolean) => {
      if (on === running) return;
      running = on;
      if (on) raf = requestAnimationFrame(frame);
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
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [visible, reduced]);

  return (
    <div ref={hostRef} className="absolute inset-0 overflow-hidden" aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
