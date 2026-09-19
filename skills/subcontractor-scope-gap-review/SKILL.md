---
name: subcontractor-scope-gap-review
description: >-
  Crosswalk a subcontractor proposal against the bid scope and classify every requirement as
  included, excluded, qualified, unclear, or not addressed, with both sides cited. Use when
  asked to "review this sub's bid", "compare these proposals", "what is this sub missing",
  "level the bids", "check the scope letter", or when given a subcontractor quotation, scope
  letter, or proposal against a scope of work.
metadata:
  author: mandala-networks
  version: "0.2.0"
---

# Subcontractor scope gap review

Bid levelling fails in one specific way: silence gets read as coverage. A proposal that never
mentions fire-stopping is not a proposal that includes fire-stopping, and it is not a proposal
that excludes it either. It is `not addressed`, which is the single most valuable finding this
workflow produces, because it is the one that becomes a change order.

## Five classifications, kept apart

Every requirement in the scope gets exactly one:

- **included** — the proposal affirmatively covers it. Cite where.
- **excluded** — the proposal affirmatively excludes it. Cite where.
- **qualified** — covered, but conditioned. An allowance, a stated quantity, an assumption, an
  access requirement, a schedule condition, a price escalation clause, an acceptance-of-
  substitution condition. The condition is the finding; record it verbatim.
- **unclear** — the proposal addresses the subject but not in a way that resolves coverage.
- **not addressed** — the proposal is silent.

Never collapse `excluded` and `not addressed`. Never convert `unclear` into either by reading
intent.

## Commercial terms are not scope, and are not interchangeable

These five are distinct, and proposals routinely blur them. Keep them in separate fields, and
never compare two proposals across different categories.

| Term | What it is | The levelling trap |
|---|---|---|
| **Base bid** | The scope at the stated price | — |
| **Alternate** | A priced addition or deduction the owner may accept | Adding an alternate into a base bid comparison |
| **Unit price** | A rate for a quantity not yet known | Multiplying by an assumed quantity |
| **Allowance** | A carried sum for scope not yet defined | Two proposals with different allowance amounts are not comparable until the basis is compared |
| **Exclusion** | Scope the bidder is not carrying | Assuming another bidder's scope fills the gap |

An allowance comparison must compare the **basis**, not the number. A $50,000 hardware allowance
and a $30,000 hardware allowance may or may not represent the same coverage; if the basis is not
stated, that is an unresolved question, not a $20,000 difference.

## Things that hide in a scope letter

Check for each explicitly, and record `not addressed` when silent:

- Sales tax, permits, fees, and bonds — included or added
- Insurance limits and additional-insured endorsements against the requirement
- Bond capacity and rate, if bonding is required or may be
- Escalation, price validity period, and material price adjustment clauses
- Schedule assumptions: duration, crew count, sequence, shift, access windows, phasing
- Layout, hoisting, scaffolding, temporary power, dumpsters, and clean-up — the general
  conditions items every trade assumes someone else carries
- Warranty duration and start date
- Submittals, engineering, and delegated design responsibility
- Off-hours and weather-dependent work
- Liquidated damages acceptance and retainage terms
- Named exclusions of adjacent trades' work at the interface

## Required behavior

1. Cite **both sides** of every row: the scope requirement location and the proposal location.
   A crosswalk with one-sided citations cannot be audited.
2. Never convert silence to a classification. `not addressed` with the proposal sections you
   read.
3. Record qualifications verbatim. Paraphrasing a condition loses the condition.
4. Never normalize an allowance, a unit price, or an alternate into a base bid comparison.
5. Never recommend an award, rank bidders, or state that one bid is low. Levelling produces the
   comparison; the award is a human commercial decision.
6. Report coverage: which proposal sections you read, and anything unreadable.
7. Flag every commercial, safety, schedule, and legal condition for a named reviewer, including
   conditions that appear favorable.
8. Where a proposal's exclusion creates a scope gap that no other trade obviously carries, say
   so as a **gap**, and do not assign it.

## Output

```json
{
  "proposal": { "bidder": "string", "date": "unknown", "revision": "unknown" },
  "crosswalk": [
    {
      "id": "req-014",
      "requirement": "string",
      "requirementRef": "07 84 00, para 1.1.B",
      "classification": "qualified",
      "proposalRef": "scope letter, page 2, item 7",
      "qualificationVerbatim": "string",
      "needsHumanDecision": true
    }
  ],
  "commercialTerms": {
    "baseBid": "unknown",
    "alternates": [{ "id": "string", "description": "string", "value": "unknown" }],
    "unitPrices": [{ "item": "string", "unit": "string", "rate": "unknown" }],
    "allowances": [{ "item": "string", "amount": "unknown", "basisStated": false }],
    "exclusions": ["string"]
  },
  "scopeGaps": [
    { "summary": "string", "requirementRef": "string", "carriedByNoOne": true }
  ],
  "coverage": { "sectionsRead": ["..."], "unreadable": ["..."] },
  "unresolvedQuestions": [{ "question": "string", "owner": "string" }]
}
```

## Boundaries

Do not award, rank, recommend, negotiate, price a gap, or contact a bidder. Do not decide
whether an exclusion is acceptable or whether an allowance is adequate. The project manager and
the estimator own the buyout decision.
