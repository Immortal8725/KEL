# GridPulse — City of Tshwane

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
| Sibusiso Mabena | Resident | `/resident` — dropdown for the fault, anonymous tip (with Other), technician on-site / done notifications, Confirm restored |
| Thandiwe Nkosi | Dispatcher | `/ops` — live map with labelled legend, clustered tickets, **Play all 4 acts**, ROI |
| Sipho Dlamini | Field technician | `/tech` — En Route / On Site / Resolved, serial + signature |
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
| GET | `/api/audit` | Immutable ledger |
| GET | `/api/analytics` | Municipal ROI |
| POST | `/api/field/action` | On-site, evidence, fine, sign-off, resident confirm/dispute, inspector QA |

No database or API keys are required to run the prototype. Seeded geography uses real Tshwane suburbs (Mamelodi, Atteridgeville, Soshanguve, Hatfield, Pretoria CBD); account numbers are representative, not live CIS records.
