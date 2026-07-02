import { useEffect, useRef, useState } from 'react';
import { queryMockBackend } from '../../lib/mockBackend';
import { usePrefersReducedMotion } from '../../lib/hooks';

/**
 * Functional demo terminal: type a natural-language query, it "pings" the
 * mocked MI Buddy backend, and the JSON response streams in token by token —
 * a working miniature of the real RAG service's UX.
 */

interface Block {
  id: number;
  kind: 'input' | 'status' | 'json' | 'sys';
  text: string;
}

const PROMPT = 'recruiter@guest:~$';
const SUGGESTIONS = [
  'show MSFT 13F holdings',
  'why is the fund screen slow?',
  'is he available for hire?',
];

let nextId = 1;

export function LiveQueryTerminal() {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: 0, kind: 'sys', text: '# mi_buddy demo shell — mocked backend, real streaming. Ask it something.' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [blocks]);

  const run = async (raw: string) => {
    const query = raw.trim();
    if (!query || busy) return;
    setBusy(true);
    setInput('');

    const inputBlock: Block = { id: nextId++, kind: 'input', text: query };
    setBlocks((b) => [...b, inputBlock]);

    const res = queryMockBackend(query);

    // Simulated network round-trip before first byte.
    await new Promise((r) => setTimeout(r, reduced ? 0 : res.latencyMs));
    setBlocks((b) => [
      ...b,
      { id: nextId++, kind: 'status', text: `${res.endpoint} → 200 OK · ${res.latencyMs}ms · streaming` },
    ]);

    const payload = JSON.stringify(res.body, null, 2);
    const jsonId = nextId++;
    setBlocks((b) => [...b, { id: jsonId, kind: 'json', text: '' }]);

    if (reduced) {
      setBlocks((b) => b.map((blk) => (blk.id === jsonId ? { ...blk, text: payload } : blk)));
    } else {
      // Stream the body in small random chunks, like SSE tokens.
      let i = 0;
      await new Promise<void>((resolve) => {
        const tick = () => {
          i = Math.min(payload.length, i + 2 + Math.floor(Math.random() * 5));
          const slice = payload.slice(0, i);
          setBlocks((b) => b.map((blk) => (blk.id === jsonId ? { ...blk, text: slice } : blk)));
          if (i < payload.length) setTimeout(tick, 12);
          else resolve();
        };
        tick();
      });
    }

    setBusy(false);
    inputRef.current?.focus();
  };

  return (
    <div className="os-panel flex h-[420px] flex-col">
      <div className="os-panel-title">
        <span className="flex gap-1.5">
          <i className="h-2 w-2 rounded-full bg-danger/70" />
          <i className="h-2 w-2 rounded-full bg-amber/70" />
          <i className="h-2 w-2 rounded-full bg-neon/70" />
        </span>
        mi_buddy — live query demo
        <span className="ml-auto text-neon">● mock:online</span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-2 overflow-y-auto p-4 text-xs leading-relaxed md:text-[13px]"
        onClick={() => inputRef.current?.focus()}
      >
        {blocks.map((b) => {
          if (b.kind === 'input') {
            return (
              <p key={b.id}>
                <span className="text-cyan">{PROMPT}</span>{' '}
                <span className="text-fg">{b.text}</span>
              </p>
            );
          }
          if (b.kind === 'status') {
            return (
              <p key={b.id} className="text-amber">
                {b.text}
              </p>
            );
          }
          if (b.kind === 'json') {
            return (
              <pre key={b.id} className="whitespace-pre-wrap break-words border-l-2 border-neon/40 pl-3 text-neon/90">
                {b.text}
                {busy && <span className="animate-blink">▊</span>}
              </pre>
            );
          }
          return (
            <p key={b.id} className="text-dim">
              {b.text}
            </p>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(input);
        }}
        className="flex items-center gap-2 border-t border-grid px-4 py-3"
      >
        <span className="shrink-0 text-xs text-cyan">{PROMPT}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          placeholder={busy ? 'streaming…' : 'ask about holdings, latency, availability…'}
          className="w-full bg-transparent text-xs text-fg placeholder-dim/50 outline-none md:text-[13px]"
          aria-label="Query the mock MI Buddy backend"
        />
        <span className="animate-blink text-neon">▊</span>
      </form>

      <div className="flex flex-wrap gap-2 border-t border-grid px-4 py-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => void run(s)}
            disabled={busy}
            className="border border-grid px-2 py-1 text-[10px] text-dim transition-colors hover:border-neon/60 hover:text-neon disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
