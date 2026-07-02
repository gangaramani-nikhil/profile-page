import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Section } from '../ui/Section';
import { logEntries, type LogEntry } from '../../data/profile';
import { useInViewOnce, usePrefersReducedMotion } from '../../lib/hooks';
import { GoroutinesArt, JvmGcArt, PyDataflowArt } from './logArt';

const ART = {
  goroutines: GoroutinesArt,
  'jvm-gc': JvmGcArt,
  'py-dataflow': PyDataflowArt,
} as const;

/**
 * Terminal counter that rips from 0 to the target the moment the entry
 * enters the viewport — the +75% Simfund (MarketPulse) number leads the
 * section so it's the first thing a recruiter reads.
 */
function MetricCounter({ counter }: { counter: NonNullable<LogEntry['counter']> }) {
  const [ref, seen] = useInViewOnce<HTMLDivElement>(0.5);
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced ? counter.to : counter.from);

  useEffect(() => {
    if (!seen || reduced) return;
    const t0 = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(counter.from + (counter.to - counter.from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, reduced, counter]);

  return (
    <div ref={ref} className="my-4 border border-neon/30 bg-neon/5 p-4">
      <div className="flex items-baseline gap-3">
        <span className="text-glow text-4xl font-bold tabular-nums text-neon md:text-5xl">
          +{value}
          {counter.suffix}
        </span>
        <span className="animate-blink text-neon">▊</span>
      </div>
      <p className="mt-1 text-[11px] uppercase tracking-widest text-dim">
        {counter.caption}
      </p>
    </div>
  );
}

function LogItem({ entry, i }: { entry: LogEntry; i: number }) {
  const Art = ART[entry.art];
  return (
    <motion.li
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: 0.05 * i }}
      className="relative border-l border-grid pb-14 pl-6 last:pb-0 md:pl-10"
    >
      {/* timeline node */}
      <span className="absolute -left-[5px] top-1 h-[9px] w-[9px] rounded-full bg-neon shadow-neon-sm" />

      <div className="relative overflow-hidden">
        {/* architecture blueprint behind the entry */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-end text-neon opacity-[0.09]">
          <div className="h-full max-h-52 w-2/3 min-w-[320px]">
            <Art />
          </div>
        </div>

        <div className="relative">
          <p className="text-[11px] uppercase tracking-[0.2em] text-dim">{entry.period}</p>
          <h3 className="mt-1 text-lg font-bold text-fg md:text-xl">{entry.org}</h3>
          <p className="text-sm text-cyan">
            {entry.role} <span className="text-dim">·</span>{' '}
            <span className="text-amber">{entry.system}</span>
          </p>

          {entry.counter && <MetricCounter counter={entry.counter} />}

          <ul className="mt-3 max-w-2xl space-y-2 text-sm leading-relaxed text-fg/85">
            {entry.bullets.map((b) => (
              <li key={b.slice(0, 24)} className="flex gap-2">
                <span className="mt-[3px] shrink-0 text-neon">▸</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {entry.stack.map((s) => (
              <span key={s} className="border border-grid px-2 py-0.5 text-[10px] text-dim">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.li>
  );
}

export function Log() {
  return (
    <Section id="log" num="04" cmd="./log" title="experience">
      <ol className="ml-1">
        {logEntries.map((entry, i) => (
          <LogItem key={entry.id} entry={entry} i={i} />
        ))}
      </ol>
      <p className="mt-10 text-xs text-dim">
        tail: full history in the CV —{' '}
        <span className="text-neon">⌘K → fetch cv</span>
      </p>
    </Section>
  );
}
