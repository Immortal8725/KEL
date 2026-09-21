# Privacy & Cookie Policy

**Product:** GridPulse (City of Tshwane outage and revenue-protection prototype)  
**Effective:** 21 September 2026  
**Applies to:** `PRIVACY_POLICY.md` — website, resident PWA, dispatcher portal, field apps, and APIs in this repository.

This policy explains what GridPulse collects, why, and how long it stays. It is written for a **hackathon prototype**. Seeded names, phone numbers, prepaid accounts, and GPS points are **representative demo data**, not live City of Tshwane CIS records.

Related documents: [Terms of Use](TERMS_OF_USE.md), [Visitor Privacy](legal/VISITOR_PRIVACY.md), [Event Privacy](legal/EVENT_PRIVACY.md), [Data Processing Agreement](legal/DATA_PROCESSING_AGREEMENT.md).

## 1. Who is responsible

The **responsible party** (POPIA) / controller for a production deployment would be the **City of Tshwane**, Energy and Electricity / Revenue Protection.

This repository is a prototype. There is no production tenant, no real identity provider, and no persistent database. State lives in the Node.js process (`src/lib/store.ts`) and a browser `localStorage` key `gridpulse.demo.session`.

Contact for this demo: `cfo.energy@tshwane.gov.za` (seeded executive mailbox — not a monitored live inbox).

## 2. What we collect

| Source in code | Data | Why |
| --- | --- | --- |
| Fake login (`src/lib/session.ts`) | Persona id, name, role, email, optional suburb / account / crew | Open the right app surface |
| Resident report (`POST /api/reports`) | Account number (outage only), name, phone, GPS, address, classification, notes, channel | Open or merge a master outage ticket |
| Anonymous tip | Address, notes, tip type — **no phone, no account** | Flag a revenue investigation |
| Technician / inspector field actions | GPS on-site time, photos (inline SVG in the demo), serial, signature, QA score | Prove work and write the audit chain |
| Prepaid vending seed | Account, meter number, kWh, ZAR, last purchase date | Zero-consumption (Izinyoka) scan |
| SSE `/api/events` | Live event title and detail | Notify residents and the control room |
| Audit log | Actor id, role, action, entity, payload, SHA-256 seal | Immutable “who did what” |

We do **not** collect payment card numbers, ID numbers, or biometric templates in this prototype.

## 3. Cookies and similar storage

GridPulse does **not** set advertising or analytics cookies.

| Name | Type | Purpose | Duration |
| --- | --- | --- | --- |
| `gridpulse.demo.session` | Browser `localStorage` (not a cookie) | Remembers which demo persona you picked | Until you tap **Switch user** or clear site data |
| Next.js / dev-server cookies | Technical, if the host sets them | Keep the preview session on the same origin | Session |

No third-party ad pixels, no Google Analytics, no social trackers ship in this repo.

## 4. Legal bases (POPIA-aligned)

- **Contract / municipal service:** restoring supply and dispatching crews.  
- **Legal obligation:** revenue protection, tamper evidence, audit trail.  
- **Legitimate interest / public interest:** clustering duplicate reports, flagging silent prepaid meters on an ENERGIZED feeder.  
- **Consent (demo):** you choose a persona and may send a tip. Anonymous tips are designed so the resident number is not stored.

## 5. Who can see what

Access is role-gated in `navForRole` (`src/lib/session.ts`):

- **Resident** — own suburb tickets, own reports, on-site / done notifications, confirm or dispute restore.  
- **Dispatcher / executive** — command map, audit diary, ROI.  
- **Technician** — maintenance jobs only (not Izinyoka tickets).  
- **Revenue inspector** — investigations plus Repair QA on technician work.  
- **System** — engine user that writes seed, merge, and anomaly events.

See [CODE.md](CODE.md) for every seeded user id.

## 6. How long we keep it

In this prototype, data lasts until the process restarts or someone runs the demo **reset** (`POST /api/demo/step` with `step: "reset"`). There is no backup tape and no off-site replica.

A production City deployment would retain outage tickets, fines, and the hash chain for the periods required by municipal finance and records rules, then archive or destroy them.

## 7. Transfers

The demo runs on the machine or preview host that serves Next.js. OpenStreetMap tiles load from `tile.openstreetmap.org` (map only). See [Service Providers](legal/SERVICE_PROVIDERS.md).

## 8. Your rights

You may ask to see, correct, or delete personal information we hold, or object to processing, under POPIA. In the prototype: tap **Switch user**, or reset the ops floor. Production requests would go to the City information officer.

## 9. Security

Field actions and reports append to a SHA-256 hash chain (`src/lib/engines/audit.ts`). Rows are not updated or deleted in the store. The demo login password `gridpulse` is **not** a production secret. Do not put live resident data into this app.

## 10. Children

GridPulse is a municipal operations tool. It is not aimed at children under 18. Do not submit a child’s personal information in a tip.

## 11. Changes

We will date a new version at the top of this file. Continued use of the prototype after a change means you have seen the new text.

## 12. Contact

City of Tshwane — Energy / Revenue Protection (prototype).  
See also [Visitor Privacy](legal/VISITOR_PRIVACY.md) and [Event Privacy](legal/EVENT_PRIVACY.md).
