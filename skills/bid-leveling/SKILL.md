---
name: bid-leveling
description: >-
  Level every current subcontractor bid for a project into one comparison sheet per trade,
  against the plan packages the project manager names and the project's responsibility matrix.
  Use when asked to "level the bids", "bid leveling", "level the incoming bids for this
  project", "run bid leveling", "trade leveling", "build the leveling sheets", or when given a
  set of subcontractor proposals organized by trade for one project. To review one proposal
  against its scope, use subcontractor-scope-gap-review.
metadata:
  author: mandala-networks
  version: "0.1.0"
---

# Bid leveling

Leveling a whole bid set fails in four specific ways: the low number is read as the answer, an
empty trade is read as covered, a sheet missing from a newer issue is read as deleted, and an
owner-furnish / GC-install split is collapsed into one party. This skill is the multi-bidder
orchestrator that prevents them. It produces one sheet per trade for the project manager and
the estimator, who own the buyout.

## Compose with the sibling skills

Call these for their part of the task and say which findings came from which. Do not restate
their rules.

| Situation | Skill |
|---|---|
| Classify one proposal against the governing scope | `subcontractor-scope-gap-review`, once per current proposal. Its classifications, verbatim qualifications, and commercial terms roll up into the trade sheet with the same values. |
| An invitation, instructions to bidders, addenda, or submission rules are in the package | `bid-requirements-register`, before leveling. |
| Two drawing issues must be compared sheet by sheet | `drawing-revision-change-log`. This skill records only which issue governs each sheet. |

## Confirm the leveling instructions

Before leveling, record what the project manager stated. Each item is an input, not a default:

- The plan packages to level against. If none are named, stop and ask. Folder recency is not a
  substitute for that instruction.
- The baseline rule, such as newest date or revision wins per sheet.
- Any discipline override, such as interiors governing finishes over architectural.
- Named exceptions that bring scope outside a proposal's normal trade or area into the level.
- Whether superseded bids and history are wanted.
- Whether a recommendation is wanted on each trade sheet.
- The trade order. Without one, order trades alphabetically.

## Plan baseline

1. Use every plan package the project manager named, and only those.
2. Apply the baseline rule per sheet. Record in `sheetBaseline` each issue of the sheet, its date
   and revision, and which issue governs.
3. Take the sheet delta from `drawing-revision-change-log`. Record a `conflict` when that delta
   changes a requirement that a bid prices.
4. A discipline missing from the newer package still governs from the older package. Absence is
   not deletion.
5. Apply a discipline override only when the project manager stated one. Write the conflict as
   `<discipline A> says X / <discipline B> says Y / using <B>`.
6. Do not level against an issue marked superseded or retired unless history was requested.
7. When the project has more than one area or program, record which programs each bid covers.
8. When the specification book or another expected document is missing, list it in
   `coverage.missingDocuments` and level against the documents in hand. Do not invent
   specification sections or quantities.

## Inventory the bid set

1. List every trade in the bid set. Open each one. A trade you did not open is a coverage gap,
   not an empty success.
2. Skip superseded proposals unless history was requested. Report what you skipped and why.
3. Treat the responsibility matrix, bid trackers, and similar indexes as inputs, not trades.
4. Take bidder, date, revision, and commercial terms from the `subcontractor-scope-gap-review`
   output for each proposal. A figure in a tracker or an email does not replace the figure in
   the proposal.
5. A proposal that prices a different trade is misfiled. Level it with the trade it prices,
   record where it was filed in `filedUnder`, and report the misfile.
6. A superseded RFI, note, or earlier bid is not a source for a current quantity or unit price.

## Responsibility matrix

Read the matrix before leveling. It decides which party owes each scope, so it decides what a
missing proposal means.

Keep these four assignments apart. Never merge two of them into one party:

- owner furnish and install
- owner furnish, GC install
- GC furnish and install
- subcontractor furnish and install

A proposal sentence such as "furnish and install" does not resolve a matrix item marked
`clarify`. The clarify stays a human decision.

Classify every trade that has no current, readable, correctly filed proposal:

| `coverageClass` | When it applies | What to report |
|---|---|---|
| `must solicit` | The matrix assigns the scope to the GC or a subcontractor | A gap. Silence is not coverage. |
| `expected empty / hold` | The matrix assigns the scope to the owner, or marks it `clarify` | An expected empty trade. Hold the buyout. It is not a failed bid. |
| `carried in another trade` | Another trade's proposal claims the scope | A claim to confirm at buyout, with the carrying trade in `carriedBy`. Do not add a second price. |
| `amount unknown` | A proposal exists but its amount cannot be read | The amount is `unknown`. |
| `misfiled` | The only proposal prices a different trade | The misfile, and the trade it belongs to. |

## Named exceptions

Include scope outside a proposal's normal trade or area, such as exterior work on an interior
package, only when the project manager names it. Carry the quantity the project manager named.

## Recommendation

Write a recommendation only when one was requested. A recommendation is a sourced scope-fit
rationale for the people who own the buyout. It is not an award, and it is not "the low
number".

State which bid is the closer fit to the governing sheets and why: scope covered, exclusions,
qualifications, alternates kept separate, and what is still `unknown`. Do not recommend a bid
on its base bid alone. When a lower base bid excludes or is silent on scope that a governing
sheet shows, the lower number is not the recommendation. Every recommendation has
`needsHumanDecision: true`.

The per-proposal crosswalk from `subcontractor-scope-gap-review` stays neutral. The trade-sheet
recommendation is the only comparison between bidders.

## Output

Return one record. `findings` holds baseline decisions, gaps, clarifies, unknown amounts,
misfiles, coverage (skipped or unopened items), and recommendations. `conflicts` holds values
you refused to reconcile silently. `tradeSheets` is the deliverable: one entry per trade opened,
and nothing else.

```json
{
  "project": { "name": "string" },
  "instructions": {
    "packages": [
      { "label": "string", "issueDate": "unknown", "revision": "unknown", "sourceRef": "string" }
    ],
    "baselineRule": "string",
    "overrides": [{ "discipline": "string", "over": "string", "scope": "string", "sourceRef": "string" }],
    "namedExceptions": [{ "scope": "string", "quantity": "unknown", "sourceRef": "string" }],
    "historyRequested": false,
    "recommendationRequested": true
  },
  "sheetBaseline": [
    {
      "sheet": "string",
      "issues": [{ "package": "string", "revision": "unknown", "date": "unknown", "sourceRef": "string" }],
      "governs": "string",
      "rule": "string"
    }
  ],
  "coverage": {
    "tradesOpened": ["string"],
    "skipped": [{ "item": "string", "reason": "string" }],
    "unreadable": ["string"],
    "missingDocuments": ["string"]
  },
  "tradeSheets": [
    {
      "trade": "string",
      "assignment": { "party": "unknown", "clarify": false, "sourceRef": "string" },
      "coverageClass": null,
      "carriedBy": null,
      "bids": [
        {
          "bidder": "string",
          "file": "string",
          "filedUnder": "string",
          "date": "unknown",
          "revision": "unknown",
          "sourceRef": "string",
          "baseBid": "unknown",
          "alternates": [{ "id": "string", "description": "string", "value": "unknown" }],
          "unitPrices": [{ "item": "string", "unit": "string", "rate": "unknown" }],
          "allowances": [{ "item": "string", "amount": "unknown", "basisStated": false }],
          "inclusions": ["string"],
          "exclusions": ["string"],
          "qualificationsVerbatim": ["string"],
          "programsCovered": ["string"]
        }
      ],
      "planCrossCheck": [
        {
          "requirement": "string",
          "governingRef": "string",
          "byBidder": [
            {
              "bidder": "string",
              "classification": "not addressed",
              "proposalRef": "string",
              "qualificationVerbatim": null
            }
          ]
        }
      ],
      "recommendation": {
        "summary": "string",
        "reasoning": "string",
        "sourceRefs": ["string"],
        "needsHumanDecision": true
      }
    }
  ],
  "findings": [
    {
      "id": "string",
      "kind": "baseline | gap | clarify | unknown-amount | misfile | coverage | recommendation",
      "trade": "string",
      "summary": "string",
      "sourceRefs": ["string"],
      "needsHumanDecision": true
    }
  ],
  "conflicts": [
    { "id": "string", "summary": "string", "sourceRefs": ["string"], "needsHumanDecision": true }
  ],
  "unresolvedQuestions": [{ "question": "string", "owner": "string" }]
}
```

Field values:

- `assignment.party` is one of the four assignments above, or `unknown`.
- `coverageClass` is one of the five classes in the table, or `null` when the trade has a
  current, readable, correctly filed proposal.
- `carriedBy` names the carrying trade when `coverageClass` is `carried in another trade`, and is
  `null` otherwise.
- `classification` uses the `subcontractor-scope-gap-review` vocabulary: `included`, `excluded`,
  `qualified`, `unclear`, or `not addressed`.
- `recommendation` is `null` when no recommendation was requested.

Every gap, clarify, unknown amount, misfile, and recommendation carries
`needsHumanDecision: true`. A baseline decision or conflict that the project manager's stated
rule resolves may carry `needsHumanDecision: false`.

## Boundaries

Do not award, buy out, order bidders by price, negotiate, or contact a bidder. Do not decide a
matrix clarify or a GC / owner / subcontractor split. Do not invent a bid amount, a quantity, or
a unit price, and do not fill one from a superseded document. Do not treat silence or an empty
trade as coverage. Do not add scope the project manager did not name. Do not level against a
superseded issue unless history was requested. The project manager and the estimator own the
buyout, the clarify answers, and the named exceptions.
