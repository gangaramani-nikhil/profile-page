/**
 * Tiny event bus connecting DOM interactions (project card hover/click,
 * palette commands) to the WebGL pipeline shader. The pipeline subscribes and
 * splashes its "ink" outward from the given screen-space origin.
 */

export interface RippleEvent {
  /** Normalized device coords of the interaction origin, -1..1. */
  x: number;
  y: number;
  /** 1 = hover ripple, 2.5+ = click splash. */
  strength: number;
}

type Listener = (e: RippleEvent) => void;

const listeners = new Set<Listener>();

export function onRipple(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitRipple(e: RippleEvent): void {
  listeners.forEach((fn) => fn(e));
}

/** Emit a ripple from the center of a DOM element (e.g. a hovered card). */
export function rippleFromElement(el: Element, strength: number): void {
  const r = el.getBoundingClientRect();
  const x = ((r.left + r.width / 2) / window.innerWidth) * 2 - 1;
  const y = -(((r.top + r.height / 2) / window.innerHeight) * 2 - 1);
  emitRipple({ x, y, strength });
}
