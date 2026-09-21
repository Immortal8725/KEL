# Dispute Policy

**Effective:** 21 September 2026  
**Product:** ElectroRaid

This policy explains how to raise a complaint about the prototype, a demo ticket, a simulated fine, or personal information. It does not replace SAPS, NERSA, or the City’s official credit-control by-laws.

## 1. What you can dispute

| Kind | Example | What the code already does |
| --- | --- | --- |
| Restore | Technician signed off but the house is still dark | Resident taps **Still no power** → `residentDispute` reopens the ticket (`status: "open"`) |
| Restore | Power is back | Resident taps **Confirm restored** → `status: "closed"` |
| Repair quality | Joint left unsafe | Inspector **Repair QA** (1–5 + notes) → `INSPECTOR_QA_ON_REPAIR` |
| Tip / flag | Wrong house flagged | Ask dispatch to close the investigation `closed_no_finding` |
| Privacy | You typed a real number into Other | Ask for a store reset; see [Visitor Privacy](VISITOR_PRIVACY.md) |
| Demo account | Someone used your judging laptop | Switch user / clear `electroraid.session` |

## 2. How to raise it (prototype)

1. Use the in-app control if one exists (Still no power, QA, investigation close).  
2. If you are at the hackathon, tell the ElectroRaid team or the information desk.  
3. If the matter is a live City account, **stop using this demo** and use the official City channels. This app cannot reverse a real bill.

## 3. How to raise it (if ElectroRaid were in production)

1. Write to the City information officer / revenue-protection desk with the ticket reference (`TSH-OUT-…` or `TSH-RP-…`).  
2. The City should acknowledge within a reasonable time and log the complaint on the same audit chain (new append-only row — never an edit of the old one).  
3. If unresolved: City appeals process, then the Information Regulator (POPIA) for privacy, or the relevant credit ombud for billing.

## 4. What we will not do

- Erase a hash-chain row to “make it disappear”. The design is append-only (`src/lib/engines/audit.ts`). A correction is a **new** event.  
- Pay compensation from demo “revenue recovered” figures. Those are simulated.  
- Arbitrate criminal Izinyoka cases.

## 5. Time limits

Demo disputes should be raised **during the event** so the store can be reset. Production time limits would follow the City’s credit-control policy and POPIA.

## 6. Related

[Terms of Use](../TERMS_OF_USE.md), [Acceptable Use](ACCEPTABLE_USE.md), [Privacy & Cookie Policy](../PRIVACY_POLICY.md).
