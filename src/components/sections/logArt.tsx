/**
 * Background SVG motifs for the ./log timeline — accurate backend system
 * sketches (Golang scheduler/channels, JVM generational GC, Python ETL
 * dataflow) rendered as faint blueprint linework behind each entry.
 */

const label = 'font-mono text-[9px] uppercase';

export function GoroutinesArt() {
  return (
    <svg viewBox="0 0 420 200" className="h-full w-full" fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1">
        {/* goroutines */}
        {[24, 74, 124].map((y, i) => (
          <g key={y}>
            <circle cx="40" cy={y} r="14" />
            <text x="40" y={y + 3} textAnchor="middle" className={label} fill="currentColor" stroke="none">
              G{i}
            </text>
            <path d={`M56 ${y} H 108`} markerEnd="url(#arr)" />
          </g>
        ))}
        {/* buffered channel */}
        <rect x="110" y="54" width="104" height="40" />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={136 + i * 26} y1="54" x2={136 + i * 26} y2="94" />
        ))}
        <text x="162" y="46" textAnchor="middle" className={label} fill="currentColor" stroke="none">
          ch := make(chan T, 4)
        </text>
        <path d="M214 74 H 258" markerEnd="url(#arr)" />
        {/* scheduler */}
        <rect x="260" y="44" width="64" height="60" strokeDasharray="4 3" />
        <text x="292" y="66" textAnchor="middle" className={label} fill="currentColor" stroke="none">
          P
        </text>
        <text x="292" y="90" textAnchor="middle" className={label} fill="currentColor" stroke="none">
          M (OS thread)
        </text>
        {/* worker fan-out */}
        {[34, 74, 114, 154].map((y, i) => (
          <g key={y}>
            <path d={`M324 74 C 348 74 348 ${y} 366 ${y}`} markerEnd="url(#arr)" />
            <rect x="368" y={y - 10} width="40" height="20" />
            <text x="388" y={y + 3} textAnchor="middle" className={label} fill="currentColor" stroke="none">
              W{i}
            </text>
          </g>
        ))}
        <text x="40" y="186" className={label} fill="currentColor" stroke="none">
          select {'{ case msg := <-ch: route(msg) }'}
        </text>
      </g>
      <defs>
        <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L8 4 L0 8" fill="none" stroke="currentColor" />
        </marker>
      </defs>
    </svg>
  );
}

export function JvmGcArt() {
  return (
    <svg viewBox="0 0 420 200" className="h-full w-full" fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1">
        <text x="16" y="20" className={label} fill="currentColor" stroke="none">
          jvm heap — generational collection
        </text>
        {/* young gen */}
        <rect x="16" y="32" width="180" height="64" />
        <rect x="24" y="44" width="88" height="44" />
        <text x="68" y="70" textAnchor="middle" className={label} fill="currentColor" stroke="none">
          eden
        </text>
        <rect x="120" y="44" width="32" height="44" />
        <text x="136" y="70" textAnchor="middle" className={label} fill="currentColor" stroke="none">
          S0
        </text>
        <rect x="158" y="44" width="32" height="44" />
        <text x="174" y="70" textAnchor="middle" className={label} fill="currentColor" stroke="none">
          S1
        </text>
        <text x="106" y="112" textAnchor="middle" className={label} fill="currentColor" stroke="none">
          young gen · minor gc
        </text>
        {/* old gen */}
        <rect x="240" y="32" width="164" height="64" strokeDasharray="5 3" />
        <text x="322" y="70" textAnchor="middle" className={label} fill="currentColor" stroke="none">
          old gen (tenured)
        </text>
        {/* promotion arrows */}
        <path d="M112 66 H 118" markerEnd="url(#arr2)" />
        <path d="M152 66 H 156" markerEnd="url(#arr2)" />
        <path d="M190 66 H 238" markerEnd="url(#arr2)" />
        <text x="214" y="58" textAnchor="middle" className={label} fill="currentColor" stroke="none">
          age &gt; 15
        </text>
        {/* gc cycle */}
        <path d="M80 150 a 30 30 0 1 1 60 0 a 30 30 0 1 1 -60 0" strokeDasharray="4 4" markerEnd="url(#arr2)" />
        <text x="110" y="154" textAnchor="middle" className={label} fill="currentColor" stroke="none">
          mark → sweep
        </text>
        <text x="230" y="140" className={label} fill="currentColor" stroke="none">
          STW pause budget: p99 &lt; 40ms
        </text>
        <path d="M228 156 H 404" strokeDasharray="2 5" />
        {[240, 292, 330, 388].map((x) => (
          <line key={x} x1={x} y1="150" x2={x} y2="162" />
        ))}
        <text x="230" y="180" className={label} fill="currentColor" stroke="none">
          allocation pressure ↓ after pooling
        </text>
      </g>
      <defs>
        <marker id="arr2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L8 4 L0 8" fill="none" stroke="currentColor" />
        </marker>
      </defs>
    </svg>
  );
}

export function PyDataflowArt() {
  return (
    <svg viewBox="0 0 420 200" className="h-full w-full" fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1">
        <text x="16" y="20" className={label} fill="currentColor" stroke="none">
          etl dag — market_data_pipeline.py
        </text>
        {/* source */}
        <path d="M16 60 h56 l10 12 v28 h-66 z" />
        <text x="49" y="86" textAnchor="middle" className={label} fill="currentColor" stroke="none">
          raw.csv
        </text>
        <path d="M82 80 H 112" markerEnd="url(#arr3)" />
        {/* stages */}
        {[
          ['extract()', 114],
          ['transform()', 204],
          ['validate()', 294],
        ].map(([name, x]) => (
          <g key={name as string}>
            <rect x={x as number} y="62" width="76" height="36" />
            <text x={(x as number) + 38} y="84" textAnchor="middle" className={label} fill="currentColor" stroke="none">
              {name}
            </text>
          </g>
        ))}
        <path d="M190 80 H 202" markerEnd="url(#arr3)" />
        <path d="M280 80 H 292" markerEnd="url(#arr3)" />
        <path d="M370 80 H 386" markerEnd="url(#arr3)" />
        {/* db cylinder */}
        <ellipse cx="400" cy="66" rx="14" ry="5" />
        <path d="M386 66 v28 a14 5 0 0 0 28 0 v-28" />
        {/* branch to features */}
        <path d="M242 98 V 130 H 292" markerEnd="url(#arr3)" strokeDasharray="4 3" />
        <rect x="294" y="116" width="86" height="30" strokeDasharray="4 3" />
        <text x="337" y="134" textAnchor="middle" className={label} fill="currentColor" stroke="none">
          features.parquet
        </text>
        <text x="16" y="170" className={label} fill="currentColor" stroke="none">
          @task(retries=3, backoff=exp) · idempotent upsert · watermark checkpoints
        </text>
      </g>
      <defs>
        <marker id="arr3" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L8 4 L0 8" fill="none" stroke="currentColor" />
        </marker>
      </defs>
    </svg>
  );
}
