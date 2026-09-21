# Data Processing Agreement

**Effective:** 21 September 2026  
**Product:** ElectroRaid  
**Law:** Protection of Personal Information Act 4 of 2013 (POPIA) and, where relevant, the GDPR for any EU-based hosting.

This DPA is a **template for a future production host**. The current prototype processes data only in memory on the machine that runs `next dev` / `next start`.

## 1. Parties

- **Responsible party / Controller:** City of Tshwane (“City”).  
- **Operator / Processor:** the organisation that hosts ElectroRaid in production (“Processor”).  
- **Sub-processors:** listed in [Service Providers](SERVICE_PROVIDERS.md).

Hackathon teammates running the repo locally are **not** appointed operators of the City.

## 2. Subject matter

Processing of personal and operational information to:

- ingest and spatially merge outage reports;  
- dispatch field crews;  
- run the zero-consumption anomaly scan;  
- capture field evidence and QA;  
- maintain an append-only audit chain;  
- display ROI in ZAR.

Categories of data subjects: residents, callers, anonymous tipsters (limited fields), City employees, contractors.

Categories of data: identity and contact (name, phone, email, employee number), account and meter numbers, GPS, addresses, photos, signatures, notes, vending timestamps, role.

Special personal information: not intended. Do not load health, religion, or children’s data.

## 3. Duration

For the term of the City–Processor hosting contract, plus the retention in the Privacy Policy.

## 4. Processor duties

The Processor shall:

1. Process only on documented City instructions (this DPA + the product spec).  
2. Ensure staff are bound to confidentiality.  
3. Implement appropriate security (encryption in transit, access control replacing the demo password, backups of Postgres/PostGIS — not the in-memory store).  
4. Engage sub-processors only as listed or with City notice.  
5. Assist with data-subject requests and Information Regulator investigations.  
6. Notify the City without undue delay after becoming aware of a breach.  
7. Delete or return City data at the end of the contract, except where law requires retention.  
8. Allow reasonable audits (the hash chain `verifyAuditChain` is one technical control).

## 5. City duties

The City shall not instruct the Processor to load live CIS extracts into a **demo** build, and shall decide the lawful basis for each channel (app, WhatsApp, call centre, walk-in, anonymous tip, system anomaly).

## 6. International transfers

If the Processor hosts outside South Africa, it must use a transfer mechanism acceptable under POPIA (and GDPR if applicable) and name the country in [Service Providers](SERVICE_PROVIDERS.md).

## 7. Prototype carve-out

`src/lib/store.ts` is an in-process singleton. It is **not** a compliant production operator environment. Clause 4 applies only after a hosted Postgres/PostGIS deployment against `db/schema.sql`.

## 8. Order of precedence

City master services agreement > this DPA > [Terms of Use](../TERMS_OF_USE.md) > product README.

## 9. Contact

City information officer (production). Prototype: [Privacy & Cookie Policy](../PRIVACY_POLICY.md).
