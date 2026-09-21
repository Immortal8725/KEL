# Terms of Use

**Product:** ElectroRaid  
**Effective:** 21 September 2026  
**Operator (intended):** City of Tshwane  
**Status:** Municipal operations platform.

These terms govern use of the ElectroRaid web app, APIs, and field PWAs in this repository. Related rules: [Acceptable Use](legal/ACCEPTABLE_USE.md), [Privacy & Cookie Policy](PRIVACY_POLICY.md), [Dispute Policy](legal/DISPUTE_POLICY.md), [Generative AI](legal/GENERATIVE_AI.md).

## 1. What ElectroRaid is

ElectroRaid is a working prototype of an outage-management and revenue-protection platform. It clusters nearby resident reports (500 m / 2 hours), scores ticket priority, flags prepaid meters with 0 kWh for ≥ 60 days on an ENERGIZED feeder, dispatches maintenance or revenue-protection crews, and writes an append-only audit log.

It is **not** the City’s official outage line, **not** a payment gateway, and **not** a substitute for 911 / 10111 / the municipal call centre.

## 2. Who may use it

- Staff accounts listed in [CODE.md](CODE.md).

You must not point this build at live CIS, SCADA, or payment systems without a separate City agreement.

## 3. Accounts

Sign-in is role-based (`src/lib/session.ts`). Switching user clears `localStorage` key `electroraid.session`.

You are responsible for what you submit while that persona is selected (reports, tips, fines, QA scores).

## 4. Licence to use

We grant you a limited, revocable, non-exclusive right to run ElectroRaid. The City retains rights in the code, design, and the name “ElectroRaid”. You may not scrape seeded accounts for real collections, or present seed fines as enforceable debt.

## 5. Your content

Outage notes, anonymous tips, photos, signatures, and QA comments are treated as operational records. You warrant that you have the right to submit them and that tips are made in good faith. False tamper accusations may be a crime and a POPIA complaint — see [Acceptable Use](legal/ACCEPTABLE_USE.md).

## 6. No real money

Fines, back-bills, penalties, and “revenue recovered” figures are **simulated ZAR** from `src/lib/engines/roi.ts` and seeded investigations. No card is charged. See [Merchant Services Agreement](legal/MERCHANT_SERVICES.md).

## 7. Availability

The in-memory store resets when the process dies or when a dispatcher runs the hackathon reset. SSE live events can drop. We do not warrant uptime, map accuracy, or ETA.

## 8. Disclaimer

THE PROTOTYPE IS PROVIDED “AS IS”. TO THE MAXIMUM EXTENT ALLOWED BY SOUTH AFRICAN LAW, WE DISCLAIM IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE ARE NOT LIABLE FOR DECISIONS MADE ON DEMO DATA (DISPATCH, FINES, RESTORE CONFIRMATIONS).

## 9. Liability cap

If a court finds liability despite clause 8, it is limited to **ZAR 0** for the prototype (no fee is charged) or, if you paid a host to run it, the amount you paid that host in the last 12 months.

## 10. Indemnity

You indemnify the City and the authors against claims arising from your misuse, unlawful tips, or uploading of live personal information into this demo.

## 11. Governing law

Republic of South Africa. Courts of Gauteng (Pretoria) have non-exclusive jurisdiction. Consumer rights under the CPA that cannot be waived still apply where the CPA applies.

## 12. Changes and contact

We may update these terms by committing a new dated version. Questions: see [Dispute Policy](legal/DISPUTE_POLICY.md).
