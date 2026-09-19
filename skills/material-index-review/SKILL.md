---
name: material-index-review
description: Explain material index changes and stale observations from supplied dated series, without inventing supplier prices.
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
