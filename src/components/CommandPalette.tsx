import { useEffect } from 'react';
import { Command } from 'cmdk';
import { toast } from 'sonner';
import { profile, sections } from '../data/profile';
import { emitRipple, rippleFromElement } from '../lib/rippleBus';

interface PaletteProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  onViewCv: () => void;
}

/** Plays a fake process: sequential terminal lines surfaced as toasts. */
function runProcess(lines: { text: string; ok?: boolean }[], doneMsg: string) {
  lines.forEach((line, i) => {
    setTimeout(() => {
      toast(line.text, {
        icon: line.ok === false ? '✗' : '▸',
        duration: 1800,
      });
    }, i * 420);
  });
  setTimeout(() => {
    toast.success(doneMsg, { duration: 3200 });
  }, lines.length * 420 + 200);
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function CommandPalette({ open, setOpen, onViewCv }: PaletteProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  const close = () => setOpen(false);

  const startMiBuddy = () => {
    close();
    scrollToId('projects');
    setTimeout(() => {
      const card = document.getElementById('project-card-mi-buddy');
      if (card) rippleFromElement(card, 2.6);
    }, 700);
    runProcess(
      [
        { text: '> start mi_buddy' },
        { text: 'loading 13F corpus … 12,408 filings' },
        { text: 'chunking on structural boundaries … ok' },
        { text: 'embedding batch → pgvector (768d) … ok' },
        { text: 'rerank model warm · citations armed' },
      ],
      'mi_buddy online — simulation running in ./projects',
    );
  };

  const optimizeQueries = () => {
    close();
    scrollToId('log');
    runProcess(
      [
        { text: '> optimize_queries --target=marketpulse' },
        { text: 'EXPLAIN ANALYZE … seq scan detected on fund_flows' },
        { text: 'building covering index … ok' },
        { text: 'denormalizing read model … ok' },
        { text: 'pushing aggregates into pg … ok' },
      ],
      'p95 1840ms → 460ms · +75% faster — see ./log',
    );
  };

  const stressRouter = () => {
    close();
    scrollToId('projects');
    setTimeout(() => {
      const card = document.getElementById('project-card-routing');
      if (card) rippleFromElement(card, 2.2);
    }, 700);
    runProcess(
      [
        { text: '> router_core --stress --rate=100M/day' },
        { text: 'spawning goroutine pool (512 workers)' },
        { text: 'kafka lag nominal · backpressure engaged' },
        { text: 'dead-letter queue: 0 poisoned messages' },
      ],
      'router_core steady at 1.16k events/sec — watch it in ./projects',
    );
  };

  const copyEmail = async () => {
    close();
    try {
      await navigator.clipboard.writeText(profile.email);
      toast.success('email copied', { description: profile.email });
    } catch {
      toast(profile.email, { description: 'clipboard blocked — copy manually' });
    }
  };

  const sudoHire = () => {
    close();
    runProcess(
      [
        { text: '> sudo hire-me' },
        { text: '[sudo] password for guest: ********' },
        { text: 'permission granted — drafting offer.eml' },
      ],
      `channel open: ${profile.email}`,
    );
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      shouldFilter
      loop
    >
      <Command.Input placeholder="type a command or search… (esc to close)" />
      <Command.List>
        <Command.Empty>command not found — try `start mi_buddy`</Command.Empty>

        <Command.Group heading="processes">
          <Command.Item onSelect={startMiBuddy} keywords={['rag', 'demo', 'run']}>
            <span className="text-neon">&gt;</span> start mi_buddy
            <span className="cmd-hint">boot the RAG sim</span>
          </Command.Item>
          <Command.Item onSelect={optimizeQueries} keywords={['performance', 'sql', 'marketpulse']}>
            <span className="text-neon">&gt;</span> optimize_queries
            <span className="cmd-hint">replay the +75% win</span>
          </Command.Item>
          <Command.Item onSelect={stressRouter} keywords={['throughput', 'kafka', 'load']}>
            <span className="text-neon">&gt;</span> router_core --stress
            <span className="cmd-hint">100M pts/day</span>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="cv">
          <Command.Item
            onSelect={() => {
              close();
              const a = document.createElement('a');
              a.href = profile.cv.pdfPath;
              a.download = profile.cv.pdfFileName;
              a.click();
              toast.success('downloading CV', { description: profile.cv.pdfFileName });
            }}
            keywords={['resume', 'pdf', 'download']}
          >
            <span className="text-amber">$</span> fetch cv --pdf
            <span className="cmd-hint">print-ready</span>
          </Command.Item>
          <Command.Item
            onSelect={() => {
              close();
              onViewCv();
            }}
            keywords={['resume', 'latex', 'view']}
          >
            <span className="text-amber">$</span> fetch cv --view
            <span className="cmd-hint">less cv.tex</span>
          </Command.Item>
          <Command.Item
            onSelect={() => {
              close();
              const a = document.createElement('a');
              a.href = profile.cv.path;
              a.download = profile.cv.fileName;
              a.click();
              toast.success('downloading LaTeX CV', { description: profile.cv.fileName });
            }}
            keywords={['resume', 'download', 'latex']}
          >
            <span className="text-amber">$</span> fetch cv --download
            <span className="cmd-hint">.tex source</span>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="goto">
          {sections.map((s) => (
            <Command.Item
              key={s.id}
              onSelect={() => {
                close();
                scrollToId(s.id);
              }}
              keywords={[s.id]}
            >
              <span className="text-cyan">cd</span> {s.num}. {s.cmd}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="contact">
          <Command.Item onSelect={copyEmail} keywords={['email', 'copy']}>
            <span className="text-magenta">@</span> copy email
            <span className="cmd-hint">{profile.email}</span>
          </Command.Item>
          <Command.Item
            onSelect={() => {
              close();
              window.location.href = `mailto:${profile.email}`;
            }}
            keywords={['mail', 'send']}
          >
            <span className="text-magenta">@</span> open mailto:
          </Command.Item>
          <Command.Item onSelect={sudoHire} keywords={['easter', 'egg', 'sudo', 'hire']}>
            <span className="text-danger">#</span> sudo hire-me
            <span className="cmd-hint">requires clearance</span>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="system">
          <Command.Item
            onSelect={() => {
              close();
              emitRipple({ x: 0, y: 0, strength: 3 });
              toast('ink splash injected into pipeline shader', { icon: '▸' });
            }}
            keywords={['ripple', 'shader', 'splash']}
          >
            <span className="text-neon">&gt;</span> inject --ripple
            <span className="cmd-hint">poke the WebGL</span>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
