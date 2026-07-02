import { useEffect, useRef, useState } from 'react';

/** Mobile breakpoint — WebGL NeuralCanvas is disabled at or below this width. */
export const MOBILE_MAX = 767;

export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return mobile;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * IntersectionObserver visibility for scroll-gating canvases: renders must
 * fully pause when the element leaves the viewport.
 */
export function useOnScreen<T extends Element>(
  rootMargin = '96px',
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return [ref, visible];
}

/** Fires once when the element first enters the viewport (for counters etc). */
export function useInViewOnce<T extends Element>(
  threshold = 0.4,
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, seen]);
  return [ref, seen];
}

/**
 * Scrollspy: returns the id of the section currently crossing the upper-middle
 * band of the viewport, so the nav can highlight where the reader is.
 */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0] ?? '');
  useEffect(() => {
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
          else visible.delete(e.target.id);
        }
        // Highest section in document order that is inside the band wins.
        for (const id of ids) {
          if (visible.has(id)) {
            setActive(id);
            return;
          }
        }
      },
      { rootMargin: '-35% 0px -60% 0px', threshold: [0, 0.01, 0.5] },
    );
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

/** Document scroll progress 0..1, updated outside React render. */
export function useDocScrollProgress(): React.MutableRefObject<number> {
  const progress = useRef(0);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return progress;
}
