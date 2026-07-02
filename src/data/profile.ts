/**
 * Global identity + content injection.
 * Every section, the command palette, and the LaTeX CV read from this file —
 * edit here and the whole OS updates.
 *
 * Links set to `null` are intentionally dead: the UI renders them as raw
 * terminal text ([STATUS: OFFLINE] / [WIP]) instead of clickable buttons.
 */

export interface ProfileLink {
  label: string;
  href: string | null;
  /** Terminal token rendered when href is null. */
  offlineToken?: string;
}

export interface Project {
  id: string;
  index: string;
  name: string;
  binary: string; // fake executable name used by the palette
  tagline: string;
  description: string[];
  stack: string[];
  metrics: { label: string; value: string }[];
  sim: 'rag' | 'routing' | 'none';
  links: ProfileLink[];
}

export interface LogEntry {
  id: string;
  period: string;
  org: string;
  role: string;
  system: string;
  bullets: string[];
  stack: string[];
  /** Counter animated when the entry scrolls into view. */
  counter?: { from: number; to: number; suffix: string; caption: string };
  /** Which architecture SVG motif backs this entry. */
  art: 'goroutines' | 'jvm-gc' | 'py-dataflow';
}

export const profile = {
  name: 'Nikhil Gangaramani',
  handle: 'nikhil',
  host: 'mumbai',
  role: 'AI Engineer',
  subRole: 'RAG systems · high-throughput data pipelines · backend architecture',
  location: 'Mumbai, IN',
  timezone: 'Asia/Kolkata',
  email: 'gangaramaninikhil@gmail.com',
  summary: [
    'I build AI systems that survive contact with production: retrieval pipelines over messy financial filings, routing layers that move tens of millions of records a day, and the query layers that make all of it feel instant.',
    'Currently focused on retrieval-augmented generation over SEC filings and the unglamorous engineering that makes LLM systems reliable — chunking strategy, vector index hygiene, latency budgets, and observability.',
  ],
  links: {
    github: { label: 'github/gangaramani-nikhil', href: 'https://github.com/gangaramani-nikhil' } as ProfileLink,
    email: { label: 'gangaramaninikhil@gmail.com', href: 'mailto:gangaramaninikhil@gmail.com' } as ProfileLink,
    linkedin: { label: 'linkedin', href: null, offlineToken: '[STATUS: OFFLINE]' } as ProfileLink,
    blog: { label: 'blog', href: null, offlineToken: '[WIP]' } as ProfileLink,
  },
  cv: {
    fileName: 'nikhil_gangaramani_cv.tex',
    path: '/cv/nikhil_gangaramani_cv.tex',
  },
};

export const stack: { group: string; items: { name: string; note: string }[] }[] = [
  {
    group: 'languages',
    items: [
      { name: 'Golang', note: 'concurrency-heavy services, channels/goroutines' },
      { name: 'Python', note: 'RAG pipelines, data tooling, ML glue' },
      { name: 'Java', note: 'JVM services, tuning GC for throughput' },
      { name: 'TypeScript', note: 'tooling + interfaces like this one' },
      { name: 'SQL', note: 'query plans read for fun' },
    ],
  },
  {
    group: 'ai / retrieval',
    items: [
      { name: 'RAG architecture', note: 'chunking → embedding → rerank → cite' },
      { name: 'Vector stores', note: 'pgvector, FAISS; index + recall tuning' },
      { name: 'LLM orchestration', note: 'eval harnesses, streaming, guardrails' },
      { name: 'Embeddings', note: 'domain-tuned for financial filings' },
    ],
  },
  {
    group: 'data / infra',
    items: [
      { name: 'Kafka', note: 'multi-tenant ingestion at 40–100M msgs/day' },
      { name: 'PostgreSQL', note: 'the +75% query-time win lives here' },
      { name: 'Redis', note: 'hot-path caching, rate limiting' },
      { name: 'Docker / K8s', note: 'ship it, scale it, watch it' },
      { name: 'AWS', note: 'S3, ECS, Lambda, the usual suspects' },
    ],
  },
];

export const projects: Project[] = [
  {
    id: 'mi-buddy',
    index: '3.1',
    name: 'MI Buddy',
    binary: 'mi_buddy',
    tagline: 'RAG system over SEC 13F institutional filings',
    description: [
      'Retrieval-augmented generation service that answers natural-language questions about institutional holdings by grounding an LLM in SEC 13F filings.',
      'Filings are parsed, chunked along structural boundaries, embedded into a vector index, and retrieved with a rerank pass — the answer streams back with citations into the source filing.',
    ],
    stack: ['Python', 'LLM APIs', 'pgvector', 'FastAPI', 'SEC EDGAR'],
    metrics: [
      { label: 'corpus', value: '13F filings' },
      { label: 'pipeline', value: 'parse → chunk → embed → retrieve' },
      { label: 'answers', value: 'streamed + cited' },
    ],
    sim: 'rag',
    links: [
      { label: 'source', href: 'https://github.com/gangaramani-nikhil', offlineToken: '[WIP]' },
      { label: 'live demo', href: null, offlineToken: '[STATUS: OFFLINE]' },
    ],
  },
  {
    id: 'routing',
    index: '3.2',
    name: 'High-Throughput Routing',
    binary: 'router_core',
    tagline: 'Ingestion + routing layer for 40–100M data points/day',
    description: [
      'Backbone service that ingests, validates, and routes 40 to 100 million financial data points per day across downstream consumers.',
      'Golang worker pools fan messages out of Kafka partitions through a rules-based router; backpressure and dead-letter handling keep the pipeline honest under burst load.',
    ],
    stack: ['Golang', 'Kafka', 'PostgreSQL', 'Redis', 'Prometheus'],
    metrics: [
      { label: 'volume', value: '40–100M points/day' },
      { label: 'model', value: 'goroutines + channels' },
      { label: 'delivery', value: 'at-least-once, idempotent sinks' },
    ],
    sim: 'routing',
    links: [
      { label: 'source', href: null, offlineToken: '[STATUS: OFFLINE]' },
      { label: 'writeup', href: null, offlineToken: '[WIP]' },
    ],
  },
  {
    id: 'this-site',
    index: '3.3',
    name: 'This Terminal',
    binary: 'portfolio_os',
    tagline: 'Scroll-driven WebGL portfolio — the thing you are inside right now',
    description: [
      'Single-page Hacker-OS portfolio: a scroll-driven R3F data pipeline as connective tissue, GPU-instanced particle sims, demand-frameloop rendering gated by intersection observers, and a cmdk command palette with mock system calls.',
    ],
    stack: ['React 18', 'TypeScript', 'Three.js / R3F', 'Tailwind', 'motion v12'],
    metrics: [
      { label: 'draw calls', value: 'collapsed via InstancedMesh' },
      { label: 'frameloop', value: 'demand — renders only on scroll' },
    ],
    sim: 'none',
    links: [
      { label: 'source', href: 'https://github.com/gangaramani-nikhil/profile-page' },
    ],
  },
];

export const logEntries: LogEntry[] = [
  {
    id: 'iss',
    period: '2023 → PRESENT',
    org: 'Institutional Shareholder Services (ISS)',
    role: 'Software Engineer — Data & AI',
    system: 'Simfund (MarketPulse)',
    bullets: [
      'Rebuilt the hot query path on the Simfund (MarketPulse) fund-analytics platform — reworked indexes, denormalized read models, and pushed aggregation into the database.',
      'Built ingestion services in Golang handling tens of millions of market data points daily with strict ordering and idempotency guarantees.',
      'Shipped RAG tooling over SEC filings so analysts query institutional holdings in natural language instead of SQL.',
    ],
    stack: ['Golang', 'Java', 'Python', 'PostgreSQL', 'Kafka'],
    counter: {
      from: 0,
      to: 75,
      suffix: '%',
      caption: 'query performance increase on Simfund (MarketPulse)',
    },
    art: 'goroutines',
  },
  {
    id: 'jvm',
    period: '2022 → 2023',
    org: 'Backend Platform Work',
    role: 'Software Engineer',
    system: 'JVM Services',
    bullets: [
      'Owned latency-sensitive Java services; profiled allocation pressure and tuned generational GC to cut p99 pauses.',
      'Introduced structured concurrency patterns and load-shedding so services degrade predictably instead of falling over.',
    ],
    stack: ['Java', 'Spring', 'Redis', 'Grafana'],
    art: 'jvm-gc',
  },
  {
    id: 'origin',
    period: 'ORIGIN',
    org: 'Computer Science + Markets',
    role: 'Student → Engineer',
    system: 'Bootstrap Sequence',
    bullets: [
      'Started in Python data pipelines: scrapers, ETL, feature engineering for market data — where the obsession with clean data flow began.',
      'The pattern since: take a system that moves data, make it faster, then make it explain itself.',
    ],
    stack: ['Python', 'Pandas', 'Airflow'],
    art: 'py-dataflow',
  },
];

/** Words that float through the 3D pipeline before being "chunked". */
export const pipelineTokens = [
  'SEC 13F-HR',
  'CUSIP 594918104',
  'shares: 12,400,000',
  'value_usd',
  'holdings.parquet',
  'PUT/CALL',
  'inst_manager',
  'quarter_end',
  'raw_filing.xml',
  'ticker: MSFT',
  'discretion: SOLE',
  '<infoTable>',
  'fund_id: 40312',
  'nav_change',
  'market_pulse',
  'embedding[768]',
];

export const sections = [
  { id: 'init', num: '00', cmd: './init' },
  { id: 'whoami', num: '01', cmd: './whoami' },
  { id: 'stack', num: '02', cmd: './stack' },
  { id: 'projects', num: '03', cmd: './projects' },
  { id: 'log', num: '04', cmd: './log' },
  { id: 'contact', num: '05', cmd: './contact' },
] as const;

export type SectionId = (typeof sections)[number]['id'];
