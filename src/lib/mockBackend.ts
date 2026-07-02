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
      endpoint: 'POST /api/v1/recruiter/ping',
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
