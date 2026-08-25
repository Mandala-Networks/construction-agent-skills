---
name: quantity-takeoff-audit
description: >-
  Audit a quantity takeoff for unit-of-measure errors, double-counted waste, geometry
  assumptions, and missing scope before it becomes a bid number. Use when asked to "check this
  takeoff", "audit these quantities", "review the quantity survey", "does this takeoff look
  right", or when given a quantity sheet, measured-work list, or unit-price breakdown.
metadata:
  author: mandala-networks
  version: "0.1.0"
---

# Quantity takeoff audit

A takeoff error compounds: it is multiplied by a unit price, marked up, and then defended for
the life of the project. The errors worth hunting are not arithmetic — spreadsheets add
correctly. They are unit-of-measure mismatches, waste applied twice, and geometry assumptions
nobody wrote down.

## Units that are commonly mistaken for each other

| Unit | Means | Confused with |
|---|---|---|
| `SQ` | **100 SF** of roofing | `SF` — a 100× error |
| `MSF` | **1,000 SF** | `SF`, `SQ` |
| `CSF` | **100 SF** | `MSF` |
| `MBF` | **1,000 board feet** | `BF`, `LF`, `FBM` |
| `BF` (board foot) | thickness in ÷ 12 × width in ÷ 12 × length ft ×12 → nominal 1 in × 1 ft × 1 ft | `SF` of face |
| `SFCA` | **square feet of contact area** — the formed face touching concrete | `SF` of wall elevation |
| `CY` | cubic yard = 27 CF | `CF`, `CM` |
| `TON` | 2,000 lb (short ton, US) | metric tonne = 2,204.6 lb |
| `LB` of reinforcing | weight, from bar size × length | `LF` of bar |
| `M` in some price books | **1,000 units** (brick, tile) | the metre |

`M` is the one to watch: `1.5 M brick` is 1,500 brick, not 1.5 metres. When a source uses `M`
ambiguously, do not resolve it — report it.

Reinforcing steel converts by nominal weight per foot: #3 = 0.376, #4 = 0.668, #5 = 1.043,
#6 = 1.502, #7 = 2.044, #8 = 2.670, #9 = 3.400, #10 = 4.303, #11 = 5.313 lb/ft. Use these only
when the takeoff already gives you bar size and length. Never derive a bar size from a weight.

## Waste, applied once

Waste can enter a quantity three ways, and the same allowance is routinely applied in two of
them:

1. In the measured quantity (the takeoff adds a percentage).
2. In the unit price (the price book's material rate already includes waste).
3. In a project-level contingency.

Check for the same allowance in more than one place. Where a takeoff shows a waste percentage,
record the percentage and its stated basis. **Never supply a waste factor.** Typical factors
vary by crew, method, geometry, and region; a number you supply becomes a number someone bids.
If the takeoff has no stated factor, that is a finding, not an invitation.

Related: **neat line versus pay line**. Excavation, backfill, and concrete are often measured to
a theoretical neat line while the work requires over-excavation and over-pour. Whether the extra
is paid depends on the measurement clause. Report which basis the takeoff used and whether the
contract measurement provisions agree.

## Geometry assumptions to surface

These are the assumptions that silently change a quantity by double digits:

- **Plan area versus sloped area.** Roofing, paving, and site work measured off a plan
  understate a sloped surface by 1/cos(θ). A 4:12 roof is about 5.4% larger than its plan area;
  8:12 about 20%. Report which was used.
- **Gross versus net wall area.** Whether openings are deducted, and above what size, is a
  measurement convention that must be stated. Do not assume the common rules apply.
- **Centreline versus out-to-out** for footings, walls, and trenches at corners. Corners are
  counted twice or missed entirely depending on the method.
- **Nominal versus actual dimensions** for lumber and masonry. A nominal 2×4 is 1.5 × 3.5 in;
  a modular brick course is not 8 in of brick.
- **Stacked versus vertical measurement** for multi-lift concrete and formwork.
- **Compaction and swell.** Bank, loose, and compacted cubic yards are three different
  quantities of the same soil. A takeoff that reports `CY` without stating which is incomplete.

## Required behavior

1. Check that every line's unit is consistent with what is being measured, and that the unit is
   the same as the unit price's unit. A `SQ` quantity against a `SF` price is a 100× error.
2. Never convert between units without stating the conversion and its factor.
3. Never supply a waste factor, productivity rate, unit price, swell factor, or compaction
   factor. Missing is `unknown` with the owner named.
4. Report each geometry assumption the takeoff depends on, and whether the source documents
   state it. An unstated assumption is a finding.
5. Cross-check quantities against the drawings and schedules that were provided (door schedule
   count against door takeoff, room finish schedule area against flooring). Report coverage —
   what you could and could not cross-check.
6. Look for missing scope, not only wrong numbers: items shown on drawings with no takeoff line
   at all. Absence is the error that survives review.
7. Separate **errors** (demonstrably wrong) from **assumption flags** (correct only if an
   unstated assumption holds).

## Output

```json
{
  "errors": [
    {
      "id": "roofing-uom",
      "line": "07-500-010 Membrane roofing",
      "issue": "unit mismatch",
      "detail": "quantity in SQ, unit price in SF; 100x overstatement",
      "sourceRefs": ["takeoff row 42", "unit price sheet line 12"]
    }
  ],
  "assumptionFlags": [
    {
      "line": "string",
      "assumption": "plan area used for a sloped roof",
      "statedInSource": false,
      "impact": "understated by 1/cos(slope)",
      "owner": "estimator"
    }
  ],
  "missingScope": [{ "item": "string", "shownAt": "A-201 keynote 7", "takeoffLine": null }],
  "crossCheckCoverage": [
    { "against": "door schedule A-601", "result": "matched", "variance": "0" }
  ],
  "unknowns": [{ "field": "waste factor", "line": "string", "owner": "estimator" }],
  "unresolvedQuestions": [{ "question": "string", "owner": "string" }]
}
```

## Boundaries

Do not price the work, apply a markup, set a contingency, or produce a corrected takeoff to be
bid. Do not decide a measurement convention where the contract is silent. The estimator owns the
quantities and the chief estimator owns the bid.
