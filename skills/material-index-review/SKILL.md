---
name: material-index-review
description: >-
  Explain material index changes and stale observations from a supplied dated
  series, without inventing supplier prices. Use when asked "what changed in the
  material index", "is this index stale", "explain the cost index movement", or
  when given dated index observations, a series vintage, or a failed refresh.
---

# Material index review

Use supplied observations and series metadata to prepare a sourced change memo.
The host retrieves and stores data; this skill does not choose vendors or prices.

1. Keep series identity, units, adjustment method, observation period, retrieval
   time, and revision vintage distinct. Compare only compatible series.
2. Calculate changes with a deterministic calculator using supplied values.
   Report unavailable comparison if the baseline is absent or zero; do not
   substitute a nearby period silently.
3. Judge freshness against the supplied publication cadence, not the job tick.
   A monthly observation can remain current across weekly fetches. Flag failed
   series separately from successfully refreshed series.
4. Attribute interpretation to the specific observations. An index level is
   not a dollar price, supplier quote, project estimate, or contractual allowance.

Return observationsUsed, comparableChanges, freshness, failedSeries, sourceRefs,
and reviewQuestions. Request missing metadata when needed. No buying, repricing,
contract escalation, external messaging, or automatic budget changes.

## Boundaries

Provide evidence and recommendations only. Execution permissions, production changes, and
contractual or financial decisions remain with the host and the named human owner.
