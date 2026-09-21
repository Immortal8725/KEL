# Merchant Services Agreement

**Effective:** 21 September 2026  
**Product:** ElectroRaid  
**Status:** Demonstration only — no merchant acquirer is connected.

This document describes how **money would** move if the City took ElectroRaid to production, and what the **prototype actually does**.

## 1. Parties (intended production)

- **Merchant:** City of Tshwane (prepaid electricity and tamper recoveries).  
- **Platform:** ElectroRaid (records the event; does not hold card data).  
- **Acquirer / vending vendors:** existing municipal prepaid vendors (referenced in seed as `COT-VEND-441`).  
- **Payer:** the account holder, only in a real deployment.

This repo is **not** a party to a card-scheme agreement. No PCI DSS scope is opened.

## 2. What the prototype shows as “money”

| Amount | Where it comes from | Real charge? |
| --- | --- | --- |
| Fine ZAR | `issueFine` / seeded `fineAmountZar` | No |
| Back-bill ZAR | `estimateBackbillZar` / seed | No |
| Penalty ZAR | seed / issue path | No |
| Recovered this shift | `computeRoi` sum of closed recovered cases | No |
| Fleet savings | avoided duplicate vans from 500 m merge | No |
| Vending kWh / ZAR | `vending_telemetry_logs` seed | Historical **demo** rows only |

UI strings such as “Issue tamper fine · R…” do **not** create a receivable in SAP or a debit order.

## 3. Production merchant rules (if adopted)

1. ElectroRaid would **record** a fine or back-bill id and pass it to the City’s billing system.  
2. Card or EFT collection would stay with the City’s existing merchant / cashier channels.  
3. Prepaid token sales stay with licensed vending agents. ElectroRaid only **reads** last-purchase timestamps for the 60-day rule.  
4. Refunds and reversals follow the City credit-control policy and the [Dispute Policy](DISPUTE_POLICY.md).  
5. Settlement reports would be daily; ElectroRaid would not hold client funds.

## 4. Fees

The prototype charges **ZAR 0**. Any future SaaS or support fee would be in a separate City procurement contract, not in this file.

## 5. Chargebacks and fraud

Not applicable to the demo. In production, the acquirer’s chargeback rules would apply to card payments only — not to municipal tamper penalties, which are administrative.

## 6. Tax

Simulated amounts are inclusive of illustrative VAT where the seed implies a tariff. They are not tax invoices.

## 7. Termination

Stop using the demo at any time. Production merchant terms would survive for settlements already in flight.

## 8. Related

[Terms of Use](../TERMS_OF_USE.md) §6, [Data Processing Agreement](DATA_PROCESSING_AGREEMENT.md), [Service Providers](SERVICE_PROVIDERS.md).
