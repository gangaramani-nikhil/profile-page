import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Section } from '../ui/Section';
import { SimCanvas } from '../three/SimCanvas';
import { MiBuddySim } from '../three/MiBuddySim';
import { RoutingSim } from '../three/RoutingSim';
import { projects, type Project } from '../../data/profile';
import { rippleFromElement } from '../../lib/rippleBus';
import { useOnScreen } from '../../lib/hooks';

/** Live odometer under the routing sim: ~40–100M/day ≈ 460–1150 events/sec. */
function ThroughputMeter() {
  const [ref, visible] = useOnScreen<HTMLSpanElement>('0px');
  const [count, setCount] = useState(41_882_113);
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      setCount((c) => c + Math.floor(180 + Math.random() * 240));
    }, 250);
    return () => clearInterval(id);
  }, [visible]);
  return (
    <span ref={ref} className="text-glow tabular-nums text-neon">
      {count.toLocaleString('en-US')}
    </span>
  );
}

function SimCaption({ project }: { project: Project }) {
  if (project.sim === 'rag') {
    return (
      <div className="flex justify-between px-4 pb-2 text-[10px] uppercase tracking-widest text-dim">
        <span className="text-neon/80">13F filings</span>
        <span className="text-amber/80">chunks</span>
        <span className="text-cyan/80">vector space</span>
        <span className="text-neon/80">answer</span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between px-4 pb-2 text-[10px] uppercase tracking-widest text-dim">
      <span>ingest</span>
      <span>
        routed today: <ThroughputMeter />
      </span>
      <span>sinks</span>
    </div>
  );
}

function ProjectCard({ project, i }: { project: Project; i: number }) {
  const cardRef = useRef<HTMLElement>(null);

  // Card interactions splash "ink" through the background pipeline shader.
  const ripple = (strength: number) => {
    if (cardRef.current) rippleFromElement(cardRef.current, strength);
  };

  return (
    <motion.article
      ref={cardRef}
      id={`project-card-${project.id}`}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
      onPointerEnter={() => ripple(1)}
      onClick={() => ripple(2.6)}
      className="os-panel group transition-colors hover:border-neon/40"
    >
      <div className="os-panel-title">
        <span className="text-neon">{project.index}</span>
        <span className="text-fg">./{project.binary}</span>
        <span className="ml-auto flex gap-1.5">
          <i className="h-2 w-2 rounded-full bg-danger/70" />
          <i className="h-2 w-2 rounded-full bg-amber/70" />
          <i className="h-2 w-2 rounded-full bg-neon/70" />
        </span>
      </div>

      {project.sim !== 'none' && (
        <>
          <SimCanvas className="h-52 w-full md:h-60" cameraZ={7.4} fov={48}>
            {project.sim === 'rag' ? <MiBuddySim /> : <RoutingSim />}
          </SimCanvas>
          <SimCaption project={project} />
        </>
      )}

      <div className="border-t border-grid p-5">
        <h3 className="text-lg font-bold text-fg group-hover:text-neon md:text-xl">
          {project.name}
        </h3>
        <p className="mt-1 text-xs text-cyan">{project.tagline}</p>
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-fg/80">
          {project.description.map((d) => (
            <p key={d.slice(0, 24)}>{d}</p>
          ))}
        </div>

        <dl className="mt-4 grid gap-1 text-[11px]">
          {project.metrics.map((m) => (
            <div key={m.label} className="flex gap-2">
              <dt className="w-20 shrink-0 text-dim">{m.label}:</dt>
              <dd className="text-neon/90">{m.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <span key={s} className="border border-grid px-2 py-0.5 text-[10px] text-dim">
              {s}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

export function Projects() {
  return (
    <Section id="projects" num="03" cmd="./projects" title="live simulations">
      <p className="mb-8 max-w-2xl text-sm text-dim">
        Each card runs a real-time WebGL simulation of the system's actual architecture —
        instanced on the GPU, rendered on demand, paused off-screen. Hover or click a card
        to splash the pipeline behind this page.
      </p>
      <div className="grid gap-8 lg:grid-cols-1">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} i={i} />
        ))}
      </div>
    </Section>
  );
}
