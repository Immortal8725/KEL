# ElectroRaid from GridPulse — City of Tshwane

**ElectroRaid** is the municipal outage and revenue-protection product. It is built **from GridPulse** — the spatial clustering, dispatch, Izinyoka, and audit engines in this repo.

Smart outage management and revenue protection for the City of Tshwane. Built as a working prototype for the Tshwane Varsity Hackathon.

The platform sits between residents, municipal dispatchers, field technicians, and revenue-protection inspectors. It clusters duplicate outage reports in real time, flags prepaid meters that stop buying electricity while the feeder is still live (Izinyoka / meter bypass), dispatches the right crew, and writes every action to an append-only audit chain.

## Fast start

```bash
npm install
npm run dev
```

Open [http://localhost:43147](http://localhost:43147). You land on a **fake login**. Password for every demo account is `gridpulse`, or tap a persona card:

| Persona | Role | Lands on |
| --- | --- | --- |
| Sibusiso Mabena | Resident | `/resident` — report a fault, **live-track the technician like Bolt**, confirm restore |
| Thandiwe Nkosi | Dispatcher | `/ops` — tap **Assign {callsign}** on the resident’s ticket; job lands on that technician immediately |
| Sipho Dlamini | Field technician | `/tech` — assigned jobs appear the moment control room dispatches you |
| Nomsa Khumalo | Revenue investigator | `/inspect` — zero-kWh audits **and Repair QA** on technician work |

Use **Switch user** in the sidebar to hop personas without a real IdP.

## What is running

This prototype is a Next.js app with TypeScript engines that mirror a production PostgreSQL + PostGIS design.

| Layer | Where |
| --- | --- |
| PostGIS schema, indexes, SQL functions | `db/schema.sql` |
| Spatial dedup, priority, anomaly, dispatch, audit, ROI | `src/lib/engines/` |
| In-memory store (hot-reload safe) | `src/lib/store.ts` |
| REST + SSE | `src/app/api/` |
| Command map, demo, field PWA, audit, analytics | `src/app/` and `src/components/` |

Production would swap the store for Postgres. The engines stay the same — they already implement the SQL in `db/schema.sql` (`ST_DWithin` 500 m / 2 h, `compute_priority_score`, `recommend_crew`, `zero_consumption_candidates`).

## Priority score

```
Priority = (affected households × 12)
         + (critical infrastructure × 280)
         + (elapsed minutes × 1.8)
```

## Anomaly rule

Flag an **active** prepaid meter when it has purchased **0 kWh for ≥ 60 days** and the linked feeder status is **ENERGIZED**. Risk score is 0–100 (duration past the floor + feeder confirmation).

## Roles

| User | Interface | Responsibility |
| --- | --- | --- |
| Resident | `/resident` PWA / WhatsApp-style | Choose what to report from a dropdown (Other if it is not listed), send anonymous tips the same way, get notified when the technician logs on site and when they finish, then Confirm restored or Still no power |
| Dispatcher | `/ops` admin portal | Heatmap with a labelled map key, deduplicated master tickets, vending anomalies, assign crews, wait for resident confirm |
| Field technician | `/tech` PWA | Physical repairs, live GPS status, closure proof (notes, serial, signature) |
| Revenue investigator | `/inspect` audit PWA | Zero-consumption audits, Izinyoka evidence, digital tamper fines, **quality assurance on the technician's repair** |
- Dispatch picks the nearest available unit of the right specialisation, penalised by current queue size

## Field PWA

`/field` is the technician / inspector kit. It installs as a PWA (`manifest.json`) and queues actions in IndexedDB when offline, then flushes them to `/api/field/action`.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/state` | Full snapshot + ROI + hash-chain status |
| GET | `/api/events` | Server-sent events (live map / dashboard) |
| POST | `/api/reports` | Ingest a resident report or anonymous tip |
| POST | `/api/anomalies/scan` | Run the zero-consumption worker |
| POST | `/api/dispatch` | Assign nearest matching crew |
| POST | `/api/demo/step` | Scripted hackathon acts |
| GET | `/api/audit` | Immutable ledger (shown in `/audit` as a plain-language activity diary; seals stay hidden until you open them) |
| GET | `/api/analytics` | Municipal ROI |
| POST | `/api/field/action` | On-site, evidence, fine, sign-off, resident confirm/dispute, inspector QA |

No database or API keys are required to run the prototype. Seeded geography uses real Tshwane suburbs (Mamelodi, Atteridgeville, Soshanguve, Hatfield, Pretoria CBD); account numbers are representative, not live CIS records.

## Users in the code

Every seeded person, login card, crew van, and role guard is listed in **[CODE.md](CODE.md)**.

## Legal

| Document | File |
| --- | --- |
| Privacy & Cookie Policy | [PRIVACY_POLICY.md](PRIVACY_POLICY.md) |
| Terms of Use | [TERMS_OF_USE.md](TERMS_OF_USE.md) |
| Acceptable Use | [legal/ACCEPTABLE_USE.md](legal/ACCEPTABLE_USE.md) |
| Event Privacy | [legal/EVENT_PRIVACY.md](legal/EVENT_PRIVACY.md) |
| Visitor Privacy | [legal/VISITOR_PRIVACY.md](legal/VISITOR_PRIVACY.md) |
| Dispute Policy | [legal/DISPUTE_POLICY.md](legal/DISPUTE_POLICY.md) |
| Generative AI | [legal/GENERATIVE_AI.md](legal/GENERATIVE_AI.md) |
| Merchant Services | [legal/MERCHANT_SERVICES.md](legal/MERCHANT_SERVICES.md) |
| Data Processing Agreement | [legal/DATA_PROCESSING_AGREEMENT.md](legal/DATA_PROCESSING_AGREEMENT.md) |
| Service Providers, Sub-processors, and Affiliates | [legal/SERVICE_PROVIDERS.md](legal/SERVICE_PROVIDERS.md) |
| Index | [legal/README.md](legal/README.md) |
