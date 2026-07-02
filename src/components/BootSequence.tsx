import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { usePrefersReducedMotion } from '../lib/hooks';

const BOOT_LINES = [
  '[ OK ] mounting /dev/portfolio',
  '[ OK ] loading kernel module: webgl_pipeline.ko',
  '[ OK ] instancing particle buffers (1 draw call)',
  '[ OK ] embedding index warm · recall@10 nominal',
  '[ OK ] identity: nikhil@mumbai',
  '>> boot complete — entering interactive session',
];

/** Fast terminal boot overlay. Skippable by click/keypress; skipped entirely
 * for reduced-motion users and repeat visits within the session. */
export function BootSequence() {
  const reduced = usePrefersReducedMotion();
  const [done, setDone] = useState(
    () => reduced || sessionStorage.getItem('booted') === '1',
  );
  const [lines, setLines] = useState(0);

  useEffect(() => {
    if (done) return;
    if (lines >= BOOT_LINES.length) {
      const id = setTimeout(() => {
        sessionStorage.setItem('booted', '1');
        setDone(true);
      }, 260);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setLines(lines + 1), 110);
    return () => clearTimeout(id);
  }, [lines, done]);

  useEffect(() => {
    if (done) return;
    const skip = () => {
      sessionStorage.setItem('booted', '1');
      setDone(true);
    };
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-bg"
        >
          <div className="w-full max-w-lg px-6 text-xs leading-relaxed md:text-sm">
            {BOOT_LINES.slice(0, lines).map((l) => (
              <p key={l} className={l.startsWith('>>') ? 'text-glow mt-2 text-neon' : 'text-dim'}>
                {l.startsWith('[ OK ]') ? (
                  <>
                    <span className="text-neon">[ OK ]</span>
                    {l.slice(6)}
                  </>
                ) : (
                  l
                )}
              </p>
            ))}
            <span className="animate-blink text-neon">▊</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
