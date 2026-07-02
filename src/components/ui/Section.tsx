import type { ReactNode } from 'react';
import { motion } from 'motion/react';

/**
 * Standard section chrome: `NN. ./cmd` terminal header with a scan-in reveal.
 */
export function Section({
  id,
  num,
  cmd,
  title,
  children,
  className = '',
}: {
  id: string;
  num: string;
  cmd: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative mx-auto w-full max-w-6xl px-5 py-24 md:px-8 md:py-32 ${className}`}>
      <motion.header
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-10 md:mb-14"
      >
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="text-sm text-dim">{num}.</span>
          <h2 className="text-glow text-2xl font-bold text-neon md:text-3xl">{cmd}</h2>
          <span className="text-xs uppercase tracking-[0.25em] text-dim"># {title}</span>
        </div>
        <div className="mt-4 h-px w-full bg-gradient-to-r from-neon/50 via-grid to-transparent" />
      </motion.header>
      {children}
    </section>
  );
}
