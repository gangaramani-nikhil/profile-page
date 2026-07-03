/**
 * Featured projects + case-study content (spec §2, template §4).
 *
 * VISIBILITY RULE (spec §3.2/§8): a project appears here only when it exists.
 * P1 (Research Copilot) and P3/P4 are NOT in this file — they are added when
 * they ship, with real metrics. No "coming soon" cards, ever.
 *
 * Case-study sections render only when populated: fabricating "evaluation
 * results" or "what didn't work" entries is worse than omitting the section.
 * TODO(nikhil) notes mark where your input completes a page.
 */

export type PillarId = 'genai' | 'ml' | 'data' | 'markets';

export interface Decision {
  title: string;
  body: string;
}

export interface Project {
  slug: string;
  title: string;
  oneLiner: string;
  status?: string; // honest status label, e.g. "in daily personal use"
  pillars: PillarId[];
  stack: string[];
  links: { label: string; href: string }[]; // real, live links only
  problem: string[];
  architectureProse: string[];
  diagram: 'screener' | 'mibuddy' | 'routing';
  decisions: Decision[];
  evaluation?: string[]; // real numbers/methodology only
  didntWork?: string[]; // only genuine, first-hand accounts
  next?: string[];
}

export const projects: Project[] = [
  {
    slug: 'nse-screener',
    title: 'NSE Post-Market Screening MCP Server',
    oneLiner:
      'A Model Context Protocol server that gives any LLM client structured post-market screening over 476 NSE equities — Minervini trend template, VCP, and SMC pattern scans — backed by a nightly data pipeline on INDmoney/INDstocks and yfinance APIs.',
    status: 'Built · in daily personal use · public mirror in preparation',
    pillars: ['data', 'genai', 'markets'],
    stack: ['Python', 'MCP', 'INDmoney/INDstocks API', 'yfinance', 'pandas', 'APScheduler', 'pytest'],
    links: [
      // TODO(nikhil): add repo URL once the public mirror (secrets stripped)
      // is up, and a sample output table from a real run.
    ],
    problem: [
      'Post-market screening across 476 NSE equities by hand means hours of chart review, every trading day, applying criteria that are in fact mechanical: trend-template thresholds, contraction patterns, structural levels.',
      'Mechanical criteria belong in tested code — and once they are code, an LLM client becomes the natural interface for querying them: “show me stage-2 names within 10% of a pivot” is a tool call, not an evening.',
    ],
    architectureProse: [
      'A nightly pipeline fetches end-of-day data for the NSE universe from INDmoney/INDstocks and yfinance, normalizes it into a local store, and precomputes the indicator set the screens depend on (moving averages, 52-week ranges, relative strength, volatility contraction measures).',
      'Screening logic lives in pure, unit-tested functions — the Minervini trend template as eight explicit criteria, VCP contraction detection, and smart-money-concepts structure checks — so every screen result is reproducible and debuggable.',
      'A Model Context Protocol server exposes the screens as typed tools. Any MCP client (Claude, or anything else that speaks the protocol) can call them mid-conversation and get structured tables back, which turns screening from a nightly chore into a dialogue.',
    ],
    diagram: 'screener',
    decisions: [
      {
        title: 'MCP server instead of a CLI or dashboard',
        body: 'A dashboard is one more app to open; a CLI is one more syntax to remember. Exposing the screens as MCP tools means the interface is whatever LLM client is already open — and follow-up questions (“which of those reported earnings this week?”) compose naturally with other tools.',
      },
      {
        title: 'Screening criteria as pure, tested functions',
        body: 'Each criterion is a small function with unit tests, not logic buried in a notebook. When a screen’s output looks wrong, the failing criterion is identifiable in minutes — and the tests document exactly what, say, “trend template” means in this system.',
      },
      {
        title: 'Nightly batch over on-demand fetching',
        body: 'End-of-day screening only needs end-of-day data. A scheduled batch keeps API usage predictable and polite, makes every screen instant at query time, and means an API outage degrades to “yesterday’s data” instead of a broken tool.',
      },
    ],
    // TODO(nikhil): evaluation section pends a sample output table from a
    // real run (redacted as you see fit) — real output only, per §8.
    next: [
      'Publish the public mirror with the secrets stripped and a recorded demo of an MCP client driving a screen.',
      'Add a small historical validation harness so each screen’s hit-rate characteristics can be described honestly.',
    ],
  },
  {
    slug: 'mi-buddy',
    title: 'MI Buddy — RAG over SEC 13F Filings',
    oneLiner:
      'A retrieval-augmented generation service that answers natural-language questions about institutional holdings by grounding an LLM in SEC 13F filings, with citations back to the source filing.',
    pillars: ['genai', 'data'],
    stack: ['Python', 'LLM APIs', 'pgvector', 'FastAPI', 'SEC EDGAR'],
    links: [],
    problem: [
      'Institutional holdings live in SEC 13F filings: verbose, structured XML that answers questions only if you already know the schema and can write the query. Analysts who just want “what changed in this manager’s book last quarter” end up filing SQL tickets.',
      'A raw LLM answers those questions fluently and wrongly. The problem is not generation — it is grounding.',
    ],
    architectureProse: [
      'Filings are pulled from EDGAR and parsed into structured records; the text is chunked along the filing’s own structural boundaries so a retrieved chunk is always a coherent unit (an infoTable entry, a cover-page section) rather than an arbitrary token window.',
      'Chunks are embedded into pgvector. At query time the system retrieves candidates, applies a rerank pass, and generates an answer constrained to the retrieved context — every claim carries a citation back to the filing and section it came from, and the answer streams to the client.',
    ],
    diagram: 'mibuddy',
    decisions: [
      {
        title: 'Chunking on filing structure, not token counts',
        body: 'A 13F is not prose. Cutting on structural boundaries keeps each chunk semantically whole, which makes retrieval hits interpretable and citations meaningful — the cited section is a real section a human can open and verify.',
      },
      {
        title: 'Citations as a hard requirement, not a feature',
        body: 'In an investment context an uncited answer is unusable regardless of how often it is right. Constraining generation to retrieved context and attaching the source to every claim converts the system from “chatbot” to “research tool”.',
      },
      {
        title: 'pgvector over a dedicated vector store',
        body: 'The filings corpus and its metadata already fit naturally in Postgres; keeping embeddings in the same database means retrieval filters (manager, quarter, form type) are SQL predicates, and there is one system to operate instead of two.',
      },
    ],
    // TODO(nikhil): add the evaluation section when you have real retrieval/
    // faithfulness measurements for MI Buddy, and a "what didn't work" note
    // from the build — both from memory of the actual build, not invented.
    next: [
      'A golden-set evaluation harness in the style of the fixed income copilot work — faithfulness and retrieval precision measured, not assumed.',
    ],
  },
  {
    slug: 'data-routing',
    title: 'High-Throughput Market Data Routing',
    oneLiner:
      'Ingestion and routing backbone that validates and routes 40–100 million financial data points per day to downstream consumers, built on Golang worker pools over Kafka.',
    pillars: ['data', 'markets'],
    stack: ['Golang', 'Kafka', 'PostgreSQL', 'Redis', 'Prometheus'],
    links: [],
    problem: [
      'Market data platforms live or die on their intake: tens of millions of points arriving daily, in bursts, from sources that duplicate, reorder, and occasionally poison messages — feeding consumers that each want a different slice, delivered exactly once from their point of view.',
    ],
    architectureProse: [
      'Golang worker pools consume from Kafka partitions and fan messages through a rules-based router to downstream sinks. Ordering guarantees are preserved per key, and idempotent writes at the sinks make at-least-once delivery safe.',
      'Backpressure propagates from slow consumers back to the intake instead of ballooning memory, and a dead-letter path quarantines poisoned messages with enough context to replay them after a fix.',
    ],
    diagram: 'routing',
    decisions: [
      {
        title: 'At-least-once with idempotent sinks, not exactly-once',
        body: 'Exactly-once across heterogeneous consumers is a promise the infrastructure cannot keep under real failure modes. At-least-once delivery with idempotency keys at every sink achieves the same effective semantics with machinery that is testable and cheap to reason about.',
      },
      {
        title: 'Goroutines and channels as the concurrency model',
        body: 'The routing layer is thousands of small, independent units of work with clear ownership handoffs — exactly the shape Go’s scheduler is built for. Channel-based handoff makes backpressure a property of the design rather than an afterthought.',
      },
      {
        title: 'Dead-letter with replay context over silent drops',
        body: 'At this volume something will always be malformed. Quarantining bad messages with their full context keeps the pipeline honest: nothing is silently lost, and incidents end with a replay instead of a reconciliation project.',
      },
    ],
    evaluation: [
      'Sustained volume: 40–100 million data points per day in production operation, with strict per-key ordering and idempotency guarantees at the sinks.',
      'On the same platform’s read path, a rebuild of the hot query layer (covering indexes, denormalized read models, aggregate pushdown) delivered a +75% query performance improvement on Simfund (MarketPulse).',
    ],
    next: [
      'A public write-up of the backpressure design — the part of this system other teams most often get wrong.',
    ],
  },
];
