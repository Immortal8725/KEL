# GridPulse — City of Tshwane

Smart outage management and revenue protection for the City of Tshwane. Built as a working prototype for the Tshwane Varsity Hackathon.

The platform sits between residents, municipal dispatchers, field technicians, and revenue-protection inspectors. It clusters duplicate outage reports in real time, flags prepaid meters that stop buying electricity while the feeder is still live (Izinyoka / meter bypass), dispatches the right crew, and writes every action to an append-only audit chain.

## Fast start

```bash
npm install
npm run dev
```

Open [http://localhost:43147](http://localhost:43147). Use **Hackathon demo → Play all 4 acts** on the command centre (or `/demo`) to walk the judges through:

1. Three Mamelodi reports inside 500 m collapsing into one master ticket
2. Zero-consumption scan on an ENERGIZED feeder opening an Izinyoka investigation
3. Inspector on-site photos and a tamper fine hashed into the audit log
4. Executive ROI board with recovered revenue in ZAR

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

- **Maintenance technicians** — cable / transformer / equipment faults
- **Revenue protection inspectors** — zero-consumption houses and anonymous Izinyoka tips
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
| POST | `/api/field/action` | On-site, evidence, fine, sign-off |

No database or API keys are required to run the prototype. Seeded geography uses real Tshwane suburbs (Mamelodi, Atteridgeville, Soshanguve, Hatfield, Pretoria CBD); account numbers are representative, not live CIS records.
