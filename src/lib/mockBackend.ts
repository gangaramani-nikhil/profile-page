/**
 * Mocked MI Buddy backend for the contact-section terminal. Deterministic,
 * client-side, zero network — but shaped exactly like the real service's
 * streaming JSON responses so the demo reads as a live API.
 */

export interface MockResponse {
  endpoint: string;
  latencyMs: number;
  body: Record<string, unknown>;
}

export function queryMockBackend(raw: string): MockResponse {
  const q = raw.toLowerCase();
  const latencyMs = 90 + Math.floor(Math.random() * 140);

  if (/(hire|available|open to|job|role|interview)/.test(q)) {
    return {
      endpoint: 'POST /api/v1/availability/ping',
      latencyMs,
      body: {
        status: 'AVAILABLE',
        candidate: 'Nikhil Gangaramani',
        location: 'Mumbai, IN (IST)',
        strengths: ['RAG systems', 'high-throughput pipelines', 'query optimization'],
        response_sla: 'usually < 24h',
        next_step: 'email gangaramaninikhil@gmail.com',
      },
    };
  }

  if (/(mi buddy|mi_buddy|how does|rag|retrieval)/.test(q)) {
    return {
      endpoint: 'GET /api/v1/systems/mi_buddy',
      latencyMs,
      body: {
        system: 'MI Buddy',
        purpose: 'natural-language answers over SEC 13F institutional filings',
        pipeline: [
          '1. parse filing XML into structured infoTables',
          '2. chunk along structural boundaries',
          '3. embed chunks → pgvector (768d)',
          '4. retrieve@k=8 + rerank on query',
          '5. generate answer with citations, streamed',
        ],
        stack: ['Python', 'pgvector', 'FastAPI', 'LLM APIs'],
        see_also: './projects → 3.1 ./mi_buddy (live simulation above)',
      },
    };
  }

  if (/(built|project|portfolio|work on|show me what)/.test(q)) {
    return {
      endpoint: 'GET /api/v1/projects',
      latencyMs,
      body: {
        count: 3,
        projects: [
          { name: 'MI Buddy', desc: 'RAG system over SEC 13F filings', sim: 'live in ./projects' },
          { name: 'High-Throughput Routing', desc: '40–100M data points/day ingestion + routing' },
          { name: 'This Terminal', desc: 'the scroll-driven WebGL portfolio you are inside' },
        ],
        highlight: '+75% query performance increase on Simfund (MarketPulse)',
      },
    };
  }

  if (/(stack|tech|language|skill|tools|framework)/.test(q)) {
    return {
      endpoint: 'GET /api/v1/stack',
      latencyMs,
      body: {
        languages: ['Golang', 'Python', 'Java', 'TypeScript', 'SQL'],
        ai_retrieval: ['RAG architecture', 'embeddings', 'pgvector/FAISS', 'LLM orchestration'],
        data_infra: ['Kafka', 'PostgreSQL', 'Redis', 'Docker/K8s', 'AWS'],
        pattern: 'take a system that moves data, make it faster, make it explain itself',
      },
    };
  }

  if (/(latency|performance|slow|optimi[sz]e|query)/.test(q)) {
    return {
      endpoint: 'POST /api/v1/perf/explain',
      latencyMs,
      body: {
        query: raw,
        before_ms: 1840,
        after_ms: 460,
        delta: '+75% faster',
        applied: ['covering index', 'denormalized read model', 'aggregate pushdown'],
        platform: 'Simfund (MarketPulse)',
      },
    };
  }

  if (/(holding|13f|msft|position|shares|institutional|fund)/.test(q)) {
    return {
      endpoint: 'POST /api/v1/query',
      latencyMs,
      body: {
        query: raw,
        pipeline: ['parse', 'embed', 'retrieve@k=8', 'rerank', 'generate'],
        retrieved_chunks: [
          { filing: '13F-HR 2026-Q1', section: 'infoTable[214]', score: 0.91 },
          { filing: '13F-HR 2025-Q4', section: 'infoTable[198]', score: 0.87 },
        ],
        answer:
          'Institutional managers increased the position by 4.2% QoQ; sole discretion filings dominate.',
        citations: 2,
        confidence: 0.88,
      },
    };
  }

  return {
    endpoint: 'POST /api/v1/query',
    latencyMs,
    body: {
      query: raw,
      mode: 'rag',
      retrieved_chunks: [
        { source: 'profile.ts', section: 'summary', score: 0.93 },
        { source: 'log/iss.md', section: 'bullets[0]', score: 0.85 },
      ],
      answer:
        'Nikhil builds AI systems that survive production: retrieval over SEC filings, 40–100M pt/day routing, and the +75% query-path rebuild on MarketPulse.',
      hint: "try: 'show MSFT 13F holdings' or 'is he available for hire?'",
      confidence: 0.86,
    },
  };
}
