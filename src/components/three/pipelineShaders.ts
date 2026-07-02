/**
 * Shader pair for the instanced pipeline particles.
 * One InstancedBufferGeometry + one draw call carries every particle through
 * its whole lifecycle: raw text node → chunk → glowing vector embedding.
 * Morphing, noise, and the ripple splash all run on the GPU.
 */

export const pipelineVertex = /* glsl */ `
attribute vec3 aStart;
attribute vec3 aChunk;
attribute vec3 aEmbed;
attribute float aSeed;

uniform float uProgress;      // document scroll progress 0..1
uniform float uTime;
uniform float uNoiseAmp;      // dynamic noise amplitude (boosted by ripples)
uniform vec2  uRippleOrigin;  // NDC origin of the last interaction
uniform float uRippleAge;     // seconds since last ripple (large = none)
uniform float uRippleStrength;

varying float vStage;         // 0 = raw text, 1 = chunk, 2 = embedding
varying float vGlow;
varying vec2  vUv;

void main() {
  vUv = uv;

  // Cascaded morph: each particle converts a little after its neighbours.
  float m  = clamp(uProgress * 1.7 - aSeed * 0.55, 0.0, 1.0);
  float s1 = smoothstep(0.0, 0.5, m);
  float s2 = smoothstep(0.5, 1.0, m);
  vec3 p = mix(aStart, aChunk, s1);
  p = mix(p, aEmbed, s2);

  // Ambient drift, amplitude driven by uNoiseAmp.
  float n = uNoiseAmp * (0.6 + 0.4 * sin(aSeed * 43.0));
  p.x += sin(uTime * 0.6 + aSeed * 12.0 + p.z * 0.35) * n;
  p.y += cos(uTime * 0.5 + aSeed * 7.0  + p.z * 0.30) * n;

  float scale = mix(0.14, 0.26, s1);   // text motes grow into chunks
  scale = mix(scale, 0.11, s2);        // then condense into embeddings
  scale *= 0.8 + 0.5 * fract(aSeed * 7.31);

  // Billboard the quad in view space.
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  mv.xy += position.xy * scale;
  vec4 clip = projectionMatrix * mv;

  // Screen-space ink splash radiating from the interaction origin.
  vec2 ndc = clip.xy / max(clip.w, 0.0001);
  float d = distance(ndc, uRippleOrigin);
  float wave = sin(d * 14.0 - uRippleAge * 11.0)
             * exp(-d * 2.4)
             * exp(-uRippleAge * 2.1)
             * uRippleStrength;
  mv.xy += normalize(ndc - uRippleOrigin + vec2(0.0001)) * wave * 0.4;
  clip = projectionMatrix * mv;

  vStage = s1 + s2;
  vGlow  = clamp(abs(wave) * 2.2, 0.0, 1.0);
  gl_Position = clip;
}
`;

export const pipelineFragment = /* glsl */ `
precision highp float;

uniform vec3 uColText;
uniform vec3 uColChunk;
uniform vec3 uColEmbed;

varying float vStage;
varying float vGlow;
varying vec2  vUv;

void main() {
  vec2 c = vUv - 0.5;
  float r = length(c);

  // Glyph shape morphs with the data: soft mote -> hard square chunk -> orb.
  float square = 1.0 - smoothstep(0.30, 0.46, max(abs(c.x), abs(c.y)));
  float orb    = 1.0 - smoothstep(0.04, 0.50, r);

  float toChunk = clamp(vStage, 0.0, 1.0);
  float toEmbed = clamp(vStage - 1.0, 0.0, 1.0);
  float chunkiness = toChunk * (1.0 - toEmbed);

  float alpha = mix(orb * 0.8, square * 0.9, chunkiness);
  alpha = mix(alpha, orb, toEmbed);

  vec3 col = mix(uColText, uColChunk, toChunk);
  col = mix(col, uColEmbed, toEmbed);
  col += vGlow;

  alpha *= 0.55;
  if (alpha < 0.02) discard;
  gl_FragColor = vec4(col, alpha);
}
`;
