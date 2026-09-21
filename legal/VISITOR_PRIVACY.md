# Visitor Privacy Policy

**Effective:** 21 September 2026  
**Who this is for:** Anyone who opens the GridPulse URL without being a City employee — residents in the demo, judges, campus visitors, and people who only read the repo.

Employees and field crews are covered by the main [Privacy & Cookie Policy](../PRIVACY_POLICY.md) and the [Data Processing Agreement](DATA_PROCESSING_AGREEMENT.md).

## 1. If you only visit the login page

We store nothing until you tap a persona or submit the typed-login form. No advertising cookie is set. See the cookie table in the Privacy Policy.

## 2. If you enter as the resident (Sibusiso Mabena)

The code treats you as `usr_sibusiso` (`role: "resident"`):

- Outage reports may include the seeded account `3218840441`, name, phone `+27 82 441 0190`, and a jittered GPS near Tsamaya Road, Mamelodi.  
- **Anonymous tip** sets `reporterName` to `"Anonymous tip"`, `contactPhone` to `null`, and `accountNumber` to `null` (`src/components/resident-portal.tsx`).  
- **Other** requires a free-text description. Do not type another person’s ID number.  
- You receive notifications when a technician logs on site (`field.onsite`) and when they finish (`incident.resolved`).  
- **Confirm restored** closes the ticket; **Still no power** reopens it. Both write audit actions `RESIDENT_CONFIRMED_RESTORE` / `RESIDENT_STILL_NO_POWER`.

## 3. If you only watch the map

The command map loads OpenStreetMap tiles. That is a third-party request (IP address visible to OSM). Crew labels show callsigns (MT-12, RP-03), not home addresses.

## 4. Children and vulnerable persons

Do not use the visitor demo to report a child or to publish a household’s prepaid history. Izinyoka tips must stay factual and location-based.

## 5. Your requests

Clear site data or tap **Switch user** to drop the local session. Ask the booth operator to reset the store if you typed something you regret.

## 6. Contact

[Privacy & Cookie Policy](../PRIVACY_POLICY.md) §12. Complaints: [Dispute Policy](DISPUTE_POLICY.md).
