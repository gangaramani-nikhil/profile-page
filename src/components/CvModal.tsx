import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { profile } from '../data/profile';

/**
 * Renders the LaTeX CV source in a pager window (think `less cv.tex`) with a
 * one-keystroke download. The .tex file in /public is the single source —
 * fetched here, so the modal and the download can never drift apart.
 */
export function CvModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || src) return;
    fetch(profile.cv.path)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then(setSrc)
      .catch(() => setError(true));
  }, [open, src]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'q') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-bg/85 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.97, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.97, y: 12 }}
            transition={{ duration: 0.18 }}
            className="os-panel flex max-h-[84vh] w-full max-w-3xl flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="os-panel-title">
              less {profile.cv.fileName}
              <span className="ml-auto flex items-center gap-3 normal-case">
                <a
                  href={profile.cv.path}
                  download={profile.cv.fileName}
                  className="border border-neon/50 bg-neon/10 px-2 py-1 text-[10px] text-neon hover:bg-neon/20"
                >
                  ↓ download .tex
                </a>
                <button onClick={onClose} className="text-dim hover:text-danger" aria-label="Close CV viewer">
                  [q]
                </button>
              </span>
            </div>
            <pre className="flex-1 overflow-auto whitespace-pre-wrap p-5 text-[11px] leading-relaxed text-fg/85 md:text-xs">
              {error
                ? '! error: cv source unreachable — email gangaramaninikhil@gmail.com instead'
                : src ?? 'loading tex source…'}
            </pre>
            <div className="border-t border-grid px-4 py-2 text-[10px] text-dim">
              (END) — press q or ESC to quit · compile with pdflatex
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
