---
name: schedule-logic-review
description: >-
  Assess a CPM construction schedule for logic defects using the DCMA 14-point checks, reporting
  each failing activity and relationship with its threshold. Use when asked to "review this
  schedule", "check the schedule logic", "run a DCMA assessment", "is this baseline
  acceptable", "why is the critical path wrong", or when given an activity list, P6/MSP export,
  or logic table.
metadata:
  author: mandala-networks
  version: "0.1.0"
---

# Schedule logic review

A schedule can be arithmetically consistent and still be unusable: dates that no longer respond
to logic, a critical path that terminates in a constraint, floats that mean nothing. Reviewing
one by reading dates finds none of that. The checks below are the industry's standard
assessment (the DCMA 14-point) and they are mechanical — each has a stated metric and a stated
threshold, so a review either passes a check or names the activities that failed it.

## The 14 checks

Percentages are computed against **incomplete** activities unless stated otherwise. Exclude
level-of-effort and hammock activities from checks 1, 5, 6, and 8, and say that you excluded
them and how many.

| # | Check | Metric | Threshold |
|---|---|---|---|
| 1 | **Logic** | Incomplete activities missing a predecessor or a successor | ≤ 5% |
| 2 | **Leads** | Relationships with negative lag | 0 |
| 3 | **Lags** | Relationships with positive lag | ≤ 5% |
| 4 | **Relationship types** | Finish-to-Start share of all relationships | ≥ 90% |
| 5 | **Hard constraints** | Incomplete activities with a hard constraint | ≤ 5% |
| 6 | **High float** | Incomplete activities with total float > 44 working days | ≤ 5% |
| 7 | **Negative float** | Activities with total float < 0 | 0 |
| 8 | **High duration** | Incomplete activities with duration > 44 working days | ≤ 5% |
| 9 | **Invalid dates** | Actual dates after the data date, or forecast dates before it | 0 |
| 10 | **Resources** | Activities with duration > 0 lacking resource or cost assignment | 0 |
| 11 | **Missed tasks** | Activities finishing later than baseline finish, or missed baseline | ≤ 5% |
| 12 | **Critical path test** | Inject a 600-day duration into a critical activity; project finish must move by a comparable amount | Finish responds |
| 13 | **Critical path length index (CPLI)** | (Critical path length + total float) ÷ critical path length | ≥ 0.95 |
| 14 | **Baseline execution index (BEI)** | Activities actually completed ÷ activities baselined to complete | ≥ 0.95 |

Check 10 applies only to a resource-loaded schedule. If the schedule carries no resources at
all, report check 10 as `not applicable` — not as a failure and not as a pass.

## What each failure actually means

Thresholds without meaning produce reports nobody acts on.

- **Open ends (1).** Exactly two open ends are legitimate: the project start milestone has no
  predecessor and the project finish milestone has no successor. Every other open end means an
  activity floats free — it cannot push the finish date and it will not show delay. Report
  start-only and finish-only separately; a *dangling* activity has one end tied and the other
  free, which is the harder defect to see.
- **Leads (2).** A negative lag lets a successor start before its predecessor finishes, which
  breaks forward and backward pass integrity and can hide a delay. Model the overlap with a
  Start-to-Start relationship and a positive lag instead.
- **Lags (3).** A lag is time with no owner, no resource, and no progress. Cure time and
  procurement duration should be activities, so they can be tracked and claimed.
- **Relationship types (4).** Heavy SS/FF use often signals overlapped logic tuned to produce a
  wanted finish date rather than to model the work.
- **Hard constraints (5).** *Must Finish On*, *Mandatory Start/Finish*, and *Start On* override
  logic. A constrained schedule stops responding to reality, and constraints are the usual cause
  of a critical path that ends in the middle of the project.
- **High float (6).** Float over 44 working days usually means missing successor logic rather
  than genuine slack.
- **Negative float (7).** The schedule is already telling you the completion date is not
  achievable as logicked. Never present a schedule with negative float as a plan without saying
  so.
- **High duration (8).** Activities over 44 working days cannot be progressed meaningfully;
  percent complete on them is an estimate, not a measurement.
- **Critical path test (12).** This is the one check that finds a *broken* critical path. If
  adding 600 days to a critical activity does not move the project finish, the path is severed
  by a constraint or an open end and every float number downstream is fiction. Run it if you
  can; if you cannot compute the network, say the check was not run rather than assuming a pass.
- **CPLI (13).** Below 1.00, the critical path is behind. Below 0.95 is the flag.
- **BEI (14).** Below 0.95 means work is completing slower than baselined regardless of what
  percent-complete says.

## Required behavior

1. State the **data date** and the working calendar you used. Every duration and float figure
   depends on both, and working days are not calendar days. If the data date is absent, stop
   and ask — do not assume today.
2. Report each check as `pass`, `fail`, or `not run`, with the computed metric, the threshold,
   and the **activity IDs** that failed. A percentage with no ID list is not actionable.
3. Never report a check as passing because you could not compute it. `not run` with the reason.
4. Do not restate percent complete as progress. Physical percent complete, duration percent
   complete, and units percent complete are different measures; name which one the file carries.
5. Do not invent activity IDs, durations, floats, or baseline dates. An absent baseline means
   checks 11 and 14 are `not run`.
6. Separate **defects** (the schedule is wrong) from **observations** (the schedule is unusual
   but may be intentional). A 60-day activity for a curtain wall procurement is not a defect.
7. A failed assessment is not a rejection. Say what would have to change and who decides.

## Output

```json
{
  "dataDate": "2026-03-31",
  "calendar": "5-day work week, 10 holidays",
  "activityCounts": { "total": 0, "incomplete": 0, "excludedLevelOfEffort": 0 },
  "checks": [
    {
      "id": 1,
      "name": "Logic",
      "status": "fail",
      "metric": 0.083,
      "threshold": "<= 0.05",
      "failingActivities": ["A1120", "A1330"],
      "note": "string"
    }
  ],
  "defects": [{ "summary": "string", "activityIds": ["..."], "severity": "high" }],
  "observations": [{ "summary": "string", "activityIds": ["..."] }],
  "notRun": [{ "id": 12, "reason": "network could not be recalculated from the export" }],
  "unresolvedQuestions": [{ "question": "string", "owner": "string" }]
}
```

## Boundaries

Do not accept, reject, approve, or certify a schedule. Do not recalculate and issue a revised
baseline. Do not assert that a delay is excusable, compensable, or concurrent — delay
entitlement is a contractual determination. The scheduler and the project manager own the
response; the owner or its representative accepts the baseline.
