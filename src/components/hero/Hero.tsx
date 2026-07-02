import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FlowField } from './FlowField';
import { NeuralCanvas } from './NeuralCanvas';
import { profile } from '../../data/profile';
import { useIsMobile, usePrefersReducedMotion } from '../../lib/hooks';

const TYPED_LINE = 'exec ./portfolio --mode=recruiter --gpu=on';

function TypedCommand() {
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(reduced ? TYPED_LINE.length : 0);
  useEffect(() => {
    if (reduced) return;
    if (n >= TYPED_LINE.length) return;
    const id = setTimeout(() => setN(n + 1), 34 + Math.random() * 40);
    return () => clearTimeout(id);
  }, [n, reduced]);
  return (
    <p className="text-sm text-dim md:text-base">
      <span className="text-neon">{profile.handle}@{profile.host}</span>
      <span className="text-dim">:~$ </span>
      <span className="text-fg">{TYPED_LINE.slice(0, n)}</span>
      <span className="animate-blink text-neon">▊</span>
    </p>
  );
}

export function Hero() {
  const isMobile = useIsMobile();

  return (
    <section id="init" className="relative flex min-h-screen flex-col justify-center overflow-hidden">
      {/*
       * Mobile fallback: the WebGL NeuralCanvas is disabled ≤767px, so the 2D
       * FlowField runs denser and faster to keep the hero alive on its own.
       */}
      <FlowField density={isMobile ? 2.3 : 1} speed={isMobile ? 1.9 : 1} />
      {!isMobile && <NeuralCanvas />}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/30 via-transparent to-bg" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="os-panel max-w-3xl p-6 md:p-10"
        >
          <div className="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-widest text-dim">
            <span className="h-2 w-2 rounded-full bg-neon shadow-neon-sm" />
            <span>session: interactive</span>
            <span className="text-grid">|</span>
            <span>{profile.location} · {profile.timezone}</span>
          </div>

          <TypedCommand />

          <h1 className="text-glow mt-6 text-4xl font-bold leading-tight text-neon md:text-6xl">
            {profile.name}
          </h1>
          <p className="mt-3 text-lg text-fg md:text-2xl">
            {profile.role}
            <span className="animate-blink text-neon">_</span>
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-dim md:text-base">
            {profile.subRole}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs">
            <a
              href="#projects"
              className="border border-neon/50 bg-neon/10 px-4 py-2 text-neon shadow-neon-sm transition-all hover:bg-neon/20 hover:shadow-neon"
            >
              cat ./projects
            </a>
            <a
              href="#contact"
              className="border border-grid px-4 py-2 text-fg transition-colors hover:border-cyan/60 hover:text-cyan"
            >
              open --contact
            </a>
            <span className="text-dim">
              or press <kbd className="border border-grid bg-panel px-1.5 py-0.5 text-neon">⌘K</kbd>
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="pointer-events-none mt-16 flex items-center gap-3 text-[11px] uppercase tracking-widest text-dim"
        >
          <span className="animate-flicker">▼ scroll to enter the pipeline</span>
          <span className="h-px flex-1 bg-gradient-to-r from-grid to-transparent" />
          <span>raw_text → chunks → embeddings</span>
        </motion.div>
      </div>
    </section>
  );
}
