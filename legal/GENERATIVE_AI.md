# Generative AI Notice

**Effective:** 21 September 2026  
**Product:** GridPulse

## 1. What this product does not do

The running GridPulse app **does not call a generative model** to classify outages, write fines, or decide dispatch.

Routing, clustering, and scoring are deterministic TypeScript:

| Engine | File | AI? |
| --- | --- | --- |
| Spatial merge 500 m / 2 h | `src/lib/engines/spatial.ts` | No |
| Priority = hh×12 + critical×280 + minutes×1.8 | `src/lib/engines/priority.ts` | No |
| Zero-kWh ≥ 60 d AND feeder ENERGIZED | `src/lib/engines/anomaly.ts` | No |
| Nearest crew of the right specialisation | `src/lib/engines/dispatch.ts` | No |
| SHA-256 audit chain | `src/lib/engines/audit.ts` | No |
| ZAR ROI roll-up | `src/lib/engines/roi.ts` | No |

Resident **Other** text is stored as notes. It is **not** sent to an LLM.

## 2. How this repository was built

Parts of the prototype (UI copy, this legal pack, scaffolding) may have been drafted with a coding assistant. That assistant is **not** in the request path of `/api/reports`, `/api/dispatch`, or `/api/field/action`.

## 3. Human remains accountable

Dispatchers still assign (or accept a recommendation). Inspectors still tick seal / bypass and type a QA score. Residents still confirm restore. No automated decision in this repo has legal effect on a real account.

## 4. If a future version adds a model

We would update this notice and the Privacy Policy to say: which vendor, which fields leave South Africa, whether prompts include personal information, and how to opt out. Until then, treat GridPulse as **rules + GPS + an audit log**, not as generative AI.

## 5. Acceptable use of AI around the demo

Do not paste live resident dumps into a public chatbot to “enrich” a tip. See [Acceptable Use](ACCEPTABLE_USE.md).
