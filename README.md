# Nikhil Gangaramani — Portfolio

Positioning: **AI engineering for financial markets** — a finance-native
engineer building GenAI systems for investment workflows. Institutional,
data-forward design (a research note, not a landing page).

Built with **Astro** (static, zero-JS by default except the ⌘K index).

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static output to dist/
npm run preview   # serve the build
npm run check     # astro type check
```

## Structure

```
src/
  data/
    site.ts          # identity, JD pillars (skills), about copy
    projects.ts      # featured projects + case-study content (§4 template)
  layouts/Base.astro # <head>, OG/Twitter meta, header/footer/palette
  components/
    Header, Footer
    CommandPalette.astro  # the one signature element — terminal-style index
    ProjectCard.astro
    Diagram.astro    # in-style SVG architecture diagrams (no Mermaid)
  pages/
    index.astro          # hero · work · skills · about · contact
    projects/[slug].astro # one case study per project
public/
  cv/  favicon.svg  og.png  robots.txt
```

## Editing content

Everything renders from `src/data/`. To add a project, append to
`projects.ts`; it appears in the grid, the palette, and gets a case-study
route automatically.

## Honesty guardrails (non-negotiable, per the plan §8)

- **No placeholder metrics, no "coming soon".** A project exists in
  `projects.ts` only when it is real. P1 (Fixed Income Research Copilot),
  P3 (FinTune), and P4 (Curve & Spread Lab) are deliberately **absent** until
  they ship with real content.
- Case-study sections (`evaluation`, `didntWork`) render only when populated —
  a page that jumps §3 → §6 is intended, not a bug.
- Status labels ("public mirror in preparation") are momentum, not weakness.

## Open `[NEEDS-INPUT]` items (blocking, from the plan §7)

Grep `TODO(nikhil)` for these in-context. Summary:

| Item | Where | Blocks |
|---|---|---|
| Production domain | `astro.config.mjs` `SITE_URL` | sitemap, absolute OG URLs |
| Résumé PDF (real) | `public/cv/` + `site.resumePath` | the current PDF is drafted from prior approved content — **review before applying** |
| LinkedIn URL | `site.ts` `linkedin` | footer/contact link (hidden until set) |
| P2 repo URL + sample output | `projects.ts` nse-screener `links`/`evaluation` | screener repo link + evaluation section |
| Real metrics (P1 RAGAS, P3 F1, MI Buddy eval) | `projects.ts` | those `evaluation` sections stay hidden until provided |
| Deploy target | hosting | site is unhosted; no deploy config committed |

## Content provenance note

The MI Buddy, routing, and ISS/Simfund content carries over from the prior
site per Nikhil's instruction that it is real work. The dates, the +75% figure,
and the drafted CV originated in an earlier build and **must survive an
interview drill-down** — confirm or correct before the application goes out.
