/**
 * Single source of identity + site chrome. Everything rendered on the site
 * reads from here or from projects.ts.
 *
 * HONESTY GUARDRAIL (per the positioning spec §8): nothing in this file may
 * be a placeholder that renders. Fields that are pending Nikhil's input are
 * `null` and the UI omits them entirely — no "coming soon", no dead links.
 */

export const site = {
  name: 'Nikhil Gangaramani',
  location: 'Mumbai, IN',
  email: 'gangaramaninikhil@gmail.com',
  headline: 'AI Engineering for Financial Markets',
  subhead:
    'I build RAG systems, fine-tuned models, and data pipelines for investment workflows — grounded in hands-on fixed income and equities domain knowledge.',
  description:
    'Nikhil Gangaramani — AI engineer in Mumbai building GenAI systems for investment workflows: RAG over market documents, agentic tooling for equity screening, and high-throughput financial data pipelines.',

  github: 'https://github.com/gangaramani-nikhil',
  // TODO(nikhil): LinkedIn URL — omitted from the site until provided.
  linkedin: null as string | null,

  // TODO(nikhil): replace with your current résumé PDF. The file below was
  // drafted from the previous site's approved content and must be reviewed
  // before any application goes out.
  resumePath: '/cv/nikhil_gangaramani_cv.pdf',
};

/** The four JD pillars. Items listed are only those defensible in an
 * interview today; extend as P1/P3/P4 ship real work behind them. */
export const pillars = [
  {
    id: 'genai',
    label: 'GenAI systems',
    items: [
      'Retrieval-augmented generation over financial documents',
      'Embeddings + vector search (pgvector) with rerank pass',
      'Grounded citations and refusal paths',
      'Agentic tooling via Model Context Protocol',
    ],
    // TODO(nikhil): add LangChain/LlamaIndex, RAGAS, FAISS/Chroma once the
    // Research Copilot (P1) ships with real eval numbers.
  },
  {
    id: 'ml',
    label: 'ML / DL fundamentals',
    items: [
      'Python-first modelling and evaluation discipline',
      'Held-out evaluation, baselines, and failure analysis',
    ],
    // TODO(nikhil): add PyTorch / Hugging Face / QLoRA / SHAP as P3 and P4
    // produce defensible artifacts.
  },
  {
    id: 'data',
    label: 'Data engineering',
    items: [
      'High-throughput ingestion (Kafka, Go worker pools) at 40–100M points/day',
      'PostgreSQL query optimization — +75% on a production analytics read path',
      'Scheduled API pipelines (REST ingestion, transforms, nightly runs)',
      'FastAPI services, Docker, SQL',
    ],
  },
  {
    id: 'markets',
    label: 'Fixed income / markets',
    items: [
      'Fund analytics domain (Simfund/MarketPulse at ISS)',
      'SEC filings structure (13F institutional holdings)',
      'NSE equities microstructure — daily post-market screening practice',
      'Technical frameworks: Minervini trend template, VCP, SMC',
    ],
  },
] as const;

export const about: string[] = [
  // finance background
  'I work in fund analytics at Institutional Shareholder Services in Mumbai, on the Simfund (MarketPulse) platform — the kind of system where a slow query is a portfolio manager waiting. Markets are not an abstraction here: I run my own nightly screening across 476 NSE equities and read filings for fun.',
  // the pivot / the bridge
  'The work that pulls me is the bridge between that domain and modern AI engineering: retrieval systems over messy financial documents, agentic tools that put screening logic in an LLM’s hands, and the pipeline engineering that makes any of it trustworthy at production volume.',
  // what he's building now
  'Right now I’m building a fixed income research copilot — RAG over central-bank communication with grounded citations and a real evaluation harness — because the gap between a demo and a system an investment team can rely on is exactly the part I enjoy.',
];
