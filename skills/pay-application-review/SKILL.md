---
name: pay-application-review
description: >-
  Check a progress payment application and its continuation sheet for arithmetic, retainage,
  stored materials, change order, and lien waiver defects before certification. Use when asked
  to "review this pay app", "check the payment application", "verify the G702", "audit the
  schedule of values", or when given an AIA G702/G703, continuation sheet, or requisition.
metadata:
  author: mandala-networks
  version: "0.1.0"
---

# Pay application review

Most pay application defects are arithmetic or tie-out failures that a careful check catches in
minutes and that cost real money when they pass. This skill checks the math first, because a
line that does not foot makes every judgment above it meaningless.

## The document

The standard progress payment package is a summary sheet (AIA G702 or its equivalent) backed by
a continuation sheet (G703) that carries the schedule of values line by line. Read the contract
— many owners use custom forms with the same structure and different line numbers.

**Summary lines**

| Line | Content | Ties to |
|---|---|---|
| 1 | Original contract sum | Executed agreement |
| 2 | Net change by change orders | Executed change order log |
| 3 | Contract sum to date | Line 1 ± Line 2 |
| 4 | Total completed and stored to date | Sum of continuation sheet Column G |
| 5a | Retainage on completed work | % × (Columns D + E) |
| 5b | Retainage on stored material | % × Column F |
| 5 | Total retainage | 5a + 5b |
| 6 | Total earned less retainage | Line 4 − Line 5 |
| 7 | Less previous certificates for payment | Prior application's Line 6 |
| 8 | Current payment due | Line 6 − Line 7 |
| 9 | Balance to finish including retainage | Line 3 − Line 6 |

**Continuation sheet columns**

`A` item number · `B` description of work · `C` scheduled value ·
`D` work completed from previous applications · `E` work completed this period ·
`F` materials presently stored, not in D or E · `G` total completed and stored to date
(D + E + F) · `G/C` percent · `H` balance to finish (C − G) · `I` retainage, where the rate
varies by line

## Checks, in order

**Arithmetic and tie-out**

1. Sum of Column C equals Line 3. If it equals Line 1 instead, the change orders were never
   added to the schedule of values.
2. For every line: `G = D + E + F`, and `H = C − G`.
3. For positive scheduled values, flag `G > C`. Reconcile negative scheduled values against
   executed deductive change orders separately; `G = 0` on a not-yet-applied credit is not
   an overbilling finding solely because `G > C`.
4. Line 4 equals the sum of Column G.
5. Line 5 equals 5a + 5b, and each is the contract retainage rate applied to the right base.
   Retainage on stored materials is frequently at a different rate or not withheld at all —
   read the contract, do not assume it matches.
6. Line 6 = Line 4 − Line 5. Line 8 = Line 6 − Line 7. Line 9 = Line 3 − Line 6.
7. Line 7 equals the **prior application's Line 6**, not the prior amount paid. They differ
   whenever a prior payment was short-paid or is still outstanding.
8. Column D this period equals **D + E from the prior application**, excluding prior F.
   Materials still stored remain in F; materials installed this period move from prior F
   into current E. Reconcile the transfer separately to avoid double counting. If the prior
   continuation sheet is missing, report this check as `not run`. See the
   [AIA completion instructions](https://help.aiacontracts.com/hc/en-us/articles/1500009290501-Completing-payment-applications-in-ACD5).

**Change orders**

9. Every change order in Line 2 is executed. Pending, proposed, and disputed change orders do
   not belong in Line 2. A change order billed before execution is a common and material defect.
10. Each executed change order appears as its own continuation sheet line or is clearly
    allocated. Change orders folded silently into existing lines destroy the audit trail.
11. Line 2 equals the net of the change order log. Deducts are negative.

**Stored materials**

12. Column F requires substantiation: invoice or bill of sale, evidence of transfer of title,
    insurance covering the material, and — for off-site storage — the owner's written consent
    and typically a bonded warehouse or right of access. List which are missing.
13. Material previously billed as stored must move from F into current E as it is installed, not be
    double counted. Check the prior application.
14. Stored material is not stored *work*. Column F carries material cost, not installed value
    with markup.

**Judgment items — flag, do not decide**

15. **Front-loading.** Early lines (mobilization, general conditions, submittals) billed at a
    percentage far above overall project completion. Report the comparison; whether it is
    unbalanced is the owner's call.
16. **Percent complete versus the schedule.** Where a current schedule was provided, compare
    billed percentage to scheduled progress by line and report divergences. Do not conclude the
    billing is wrong; the schedule may be stale.
17. **Lien waivers.** Conditional waivers through the current period from the contractor and
    listed lower tiers, unconditional waivers for the prior period. Missing waivers by name.
18. **Final payment.** Consent of surety, final unconditional waivers, closeout submittals
    complete, retainage release terms met.

## Required behavior

1. Show the arithmetic. Every failed check reports the expected value, the value on the form,
   and the difference. `Line 8 shows 412,900.00; Line 6 − Line 7 = 407,900.00; short by
   5,000.00` — never "Line 8 appears incorrect".
2. Never recompute a number and present it as the corrected application. You report defects.
3. Never assume a retainage rate, a change order value, or a prior period figure. Absent inputs
   make a check `not run` with what is needed and who has it.
4. Keep arithmetic defects separate from judgment items. The first are facts; the second are
   observations for a person.
5. Report the source document and line for every finding.
6. Round to cents and state the rounding. Do not silently absorb a difference under a dollar —
   report it as immaterial and let the reviewer decide.

## Output

Put all demonstrated arithmetic, change-order, and stored-material defects in `defects`,
with stable IDs, source references, and `needsHumanDecision`. Use the `check` field to identify
the failed rule; expected/reported/difference may describe missing substantiation as text.
Keep observations requiring judgment in `judgmentItems`; do not call them arithmetic defects.

```json
{
  "application": { "number": "unknown", "periodTo": "unknown", "retainageRate": "unknown" },
  "defects": [
    {
      "id": "line-8-mismatch",
      "location": "G702 Line 8",
      "expected": "407900.00",
      "reported": "412900.00",
      "difference": "5000.00",
      "check": "Line 6 - Line 7",
      "sourceRefs": ["G702 Line 6", "G702 Line 7", "G702 Line 8"],
      "needsHumanDecision": false
    }
  ],
  "conflicts": [],
  "judgmentItems": [
    { "summary": "string", "sourceRefs": ["..."], "owner": "owner's representative" }
  ],
  "checksNotRun": [{ "check": "string", "needs": "string", "owner": "string" }],
  "unresolvedQuestions": [{ "question": "string", "owner": "string" }]
}
```

## Boundaries

Do not certify, approve, reject, or short-pay an application. Do not issue a revised G702 or
G703. Do not determine whether withholding is justified, whether a lien right has been waived,
or whether retainage may be released — those are contractual and legal determinations. The
architect or owner's representative certifies; counsel advises on waivers.
