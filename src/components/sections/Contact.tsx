import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Section } from '../ui/Section';
import { GhostLink } from '../ui/GhostLink';
import { LiveQueryTerminal } from './LiveQueryTerminal';
import { profile } from '../../data/profile';

export function Contact() {
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      toast.success('email copied to clipboard', { description: profile.email });
    } catch {
      toast.error('clipboard unavailable', { description: profile.email });
    }
  };

  return (
    <Section id="contact" num="05" cmd="./contact" title="open a channel">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <p className="max-w-md text-sm leading-relaxed text-fg/85 md:text-base">
            Hiring for AI infrastructure, RAG systems, or backend performance work?
            The fastest route is email — the terminal on the right shows what I build.
          </p>

          <div className="mt-8 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-dim">email</span>
              <button
                onClick={copyEmail}
                className="text-glow text-left text-neon underline decoration-neon/40 underline-offset-4 hover:decoration-neon"
              >
                {profile.email}
              </button>
              <span className="text-[10px] text-dim">[click to copy]</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-dim">github</span>
              <GhostLink link={profile.links.github} className="!text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-dim">linkedin</span>
              <GhostLink link={profile.links.linkedin} className="!text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-dim">base</span>
              <span className="text-fg/85">{profile.location} · {profile.timezone}</span>
            </div>
          </div>

          <p className="mt-10 text-xs text-dim">
            pro tip: <kbd className="border border-grid bg-panel px-1.5 py-0.5 text-neon">⌘K</kbd>{' '}
            → <span className="text-neon">fetch cv</span> pulls the LaTeX CV without leaving the shell.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.12 }}
        >
          <LiveQueryTerminal />
        </motion.div>
      </div>
    </Section>
  );
}
