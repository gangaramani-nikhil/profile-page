import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { profile, sections } from '../data/profile';

export function NavBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () =>
      setClock(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: profile.timezone,
        }).format(new Date()),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-grid bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-4 px-5 text-xs md:px-8">
        <a href="#init" className="text-glow shrink-0 font-bold text-neon">
          {profile.handle}@{profile.host}:~$
        </a>

        <nav className="hidden items-center gap-4 md:flex">
          {sections
            .filter((s) => s.id !== 'init')
            .map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-dim transition-colors hover:text-neon"
              >
                <span className="text-grid">{s.num}. </span>
                {s.cmd}
              </a>
            ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-dim lg:inline" suppressHydrationWarning>
            IST {clock}
          </span>
          <span className="hidden h-2 w-2 rounded-full bg-neon shadow-neon-sm lg:inline-block" />
          <button
            onClick={onOpenPalette}
            className="border border-grid px-2 py-1 text-dim transition-colors hover:border-neon/60 hover:text-neon"
            aria-label="Open command palette"
          >
            ⌘K
          </button>
        </div>
      </div>
      <motion.div
        className="h-[2px] origin-left bg-neon shadow-neon-sm"
        style={{ scaleX: progress }}
      />
    </header>
  );
}
