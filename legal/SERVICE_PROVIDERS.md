# Service Providers, Sub-processors, and Affiliates

**Effective:** 21 September 2026  
**Product:** GridPulse  
**Related:** [Data Processing Agreement](DATA_PROCESSING_AGREEMENT.md), [Privacy & Cookie Policy](../PRIVACY_POLICY.md)

This list is what the **current prototype** actually talks to, plus who would appear in a City production build.

## 1. In this repository (demo)

| Party | Role | Data that may be seen | Location / notes |
| --- | --- | --- | --- |
| GridPulse Node process | Application + in-memory store | Full snapshot (users, tickets, GPS, audit) | The machine running `npm run dev` (port 43147) |
| Browser | Persona session | `gridpulse.demo.session` in `localStorage` | User device |
| OpenStreetMap tile servers (`tile.openstreetmap.org`) | Basemap only | Client IP, tile XYZ | Community tiles — **no API key** in `command-map.tsx` |
| Cursor / preview host (when used) | Temporary HTTPS front | Whatever the preview proxy forwards | See host’s own terms |

There is **no** Stripe, PayGate, PayFast, Firebase, Auth0, Mixpanel, or Sentry dependency in `package.json`.

## 2. Libraries (not processors of City data)

These run **in process** or in the browser. They are not separate operators:

- Next.js, React, TypeScript  
- Tailwind CSS, shadcn/ui, Base UI  
- Leaflet (map rendering)  
- Lucide icons  

See `package.json`.

## 3. Affiliates (intended City group)

| Affiliate | Role |
| --- | --- |
| City of Tshwane — Energy and Electricity | Outage operations |
| City of Tshwane — Revenue Protection | Izinyoka / tamper |
| City of Tshwane — Finance / Office of the CFO | ROI dashboard (`usr_cfo`) |
| Licensed prepaid vending agents | Token sales (read-only telemetry in a real build) |

No affiliate receives demo data unless a human screenshares the pitch.

## 4. Production sub-processors (not contracted yet)

If the City hosted GridPulse, typical additions would be listed here before go-live:

| Candidate | Purpose | Data |
| --- | --- | --- |
| IaaS region in ZA (e.g. Cape Town / Johannesburg) | Postgres + PostGIS + app | Full operational DB |
| City identity (Active Directory / municipal SSO) | Replace fake login | Employee number, role |
| SMS / WhatsApp business API | Resident notifications | Phone, ticket status |
| Object storage | Real field photos | Images + GPS EXIF |
| Municipal ERP / CIS | Accounts and billing | Account numbers, fines |

None of the rows in §4 are wired in this prototype.

## 5. Changes

We will date an update when a new outbound host is added to the running app. OSM tiles are the only third-party **runtime** network call besides the app origin.

## 6. Contact

[Privacy & Cookie Policy](../PRIVACY_POLICY.md) §12.
