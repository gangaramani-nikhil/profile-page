import { motion } from 'motion/react';
import { Section } from '../ui/Section';
import { GhostLink } from '../ui/GhostLink';
import { profile } from '../../data/profile';

const FACTS: [string, string][] = [
  ['user', profile.name.toLowerCase().replace(' ', '.')],
  ['role', profile.role],
  ['loc', `${profile.location} (${profile.timezone})`],
  ['focus', 'RAG · data pipelines · query performance'],
  ['status', 'open to hard problems'],
];

export function About() {
  return (
    <Section id="whoami" num="01" cmd="./whoami" title="identity">
      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="os-panel"
        >
          <div className="os-panel-title">
            <span className="text-neon">●</span> cat ./about.txt
          </div>
          <div className="space-y-4 p-5 text-sm leading-relaxed text-fg/90 md:p-6 md:text-base">
            {profile.summary.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
            <p className="text-dim">
              The throughline: systems that move a lot of data, made fast, then made{' '}
              <span className="text-neon">explainable</span>.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="os-panel h-fit"
        >
          <div className="os-panel-title">
            <span className="text-amber">●</span> env | grep NIKHIL
          </div>
          <dl className="space-y-3 p-5 text-xs md:text-sm">
            {FACTS.map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-16 shrink-0 text-dim">{k}=</dt>
                <dd className="text-fg/90">{v}</dd>
              </div>
            ))}
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-dim">links=</dt>
              <dd className="flex flex-col gap-1.5">
                <GhostLink link={profile.links.github} />
                <GhostLink link={profile.links.email} />
                <GhostLink link={profile.links.linkedin} />
              </dd>
            </div>
          </dl>
        </motion.div>
      </div>
    </Section>
  );
}
