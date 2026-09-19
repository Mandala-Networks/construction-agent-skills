---
name: drawing-revision-change-log
description: >-
  Compare two drawing issues sheet by sheet and produce a sourced register of potential scope
  changes, with coverage reported and unreadable sheets separated from unchanged ones. Use when
  asked to "what changed in this revision", "compare these drawing sets", "review the addendum
  drawings", "build a delta log", "did the drawings change", or when given two dated or
  numbered issues of the same drawing set.
metadata:
  author: mandala-networks
  version: "0.2.0"
---

# Drawing revision change log

The dangerous output of this workflow is a clean-looking change log that silently omits the
sheets that would not open. A reviewer reads "12 changes found" as "these are the changes", and
the missing sheet is discovered during installation. **Coverage is part of the finding**, not a
caveat at the bottom.

## Establish the comparison before comparing

1. **Identify both issues explicitly** by issue date, revision number, and issue purpose (bid,
   permit, addendum, construction, as-built). Never infer which set is later from a filename.
   Ask if it is not stated.
2. **Normalize sheet identifiers.** `A-101`, `A101`, and `A1.01` may be the same sheet across
   issues, or may not be. Build the mapping explicitly and report the mapping rule you used.
3. **Classify each sheet** before looking at content: present in both, added, deleted,
   renumbered, or unmatched. A renumbered sheet read as an addition plus a deletion produces two
   wrong findings.
4. **Read the revision clouds, deltas, and the revision block** on each sheet. These are the
   designer's own statement of what changed and they are evidence — but they are frequently
   incomplete. A change not clouded is still a change; a cloud with no visible change is still
   a finding.
5. **Cross-reference the addendum or bulletin narrative** if one was issued. Where the narrative
   and the drawings disagree, that is a conflict for a person, not something to reconcile.

## What to report per sheet

Additions, removals, relocations, dimensional changes, quantity changes, material and
specification-reference changes, keynote and general-note changes, detail callout changes, and
schedule changes (door, window, finish, equipment, panel). Give the sheet number and the
detail, keynote, grid, or schedule row for each.

Note changes matter as much as graphic ones. A general note revised from "field verify" to
"contractor to provide" moves cost with no visible geometry change.

## Coverage is a first-class output

Report every sheet in one of these states, and never let a sheet go unreported:

- `compared` — both issues readable and compared
- `unreadable` — scanned, rasterized, corrupt, or password-protected, with which issue failed
- `missing` — present in one issue only, and which
- `not-comparable` — different scale, crop, orientation, or format such that a reliable visual
  comparison was not possible
- `unchanged` — compared and no difference found

`unchanged` and `unreadable` must never be merged. Vector-to-raster comparison in particular
degrades: state the comparison method used per sheet.

## Required behavior

1. Never assert that a visual difference constitutes a change in contract scope. Scope and cost
   consequence is a human determination. Report `potential change` with what you observed.
2. Never infer intent. "Beam size changed from W18x35 to W21x44" is a finding. "The engineer
   increased the beam because of the new mechanical load" is speculation.
3. Cite sheet, issue, and location for both sides of every difference.
4. Report added and deleted sheets as changes in their own right, with their titles.
5. Report the comparison method and its limitations per sheet.
6. Where a revision cloud exists with no detectable difference, and where a difference exists
   with no cloud, report both — they are different problems.
7. Sort findings by likely consequence when you can defend the ordering, and say what the
   ordering is based on. Otherwise sort by sheet.

## Output

```json
{
  "comparison": {
    "earlierIssue": { "label": "Bid Set", "date": "2026-01-14", "revision": "0" },
    "laterIssue": { "label": "Addendum 3", "date": "2026-02-02", "revision": "3" },
    "sheetMappingRule": "string"
  },
  "coverage": [
    {
      "sheet": "A-501",
      "state": "compared",
      "method": "vector text and geometry diff",
      "limitation": null
    }
  ],
  "potentialChanges": [
    {
      "id": "A-501-001",
      "sheet": "A-501",
      "location": "detail 3",
      "category": "material change",
      "earlier": "string",
      "later": "string",
      "clouded": true,
      "sourceRefs": ["A-501 rev 0, detail 3", "A-501 rev 3, detail 3"],
      "needsHumanDecision": true
    }
  ],
  "cloudsWithoutDifference": [{ "sheet": "string", "location": "string" }],
  "differencesWithoutClouds": [{ "sheet": "string", "location": "string" }],
  "conflicts": [{ "summary": "string", "sourceRefs": ["..."] }],
  "sheetsRequiringManualReview": [{ "sheet": "string", "reason": "string" }],
  "unresolvedQuestions": [{ "question": "string", "owner": "string" }]
}
```

## Boundaries

Do not price a change, prepare a change order, acknowledge an addendum, accept a revised set, or
conclude that a change is or is not within the original scope. The project manager and the
estimator own the consequence; the design team owns the intent.
