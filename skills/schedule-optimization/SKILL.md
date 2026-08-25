---
name: schedule-optimization
description: >-
  Set up and run a construction schedule optimization - crashing, resource levelling,
  resource-constrained scheduling, or a time-cost-carbon trade-off - with a correct problem
  formulation, a feasible encoding, and a Pareto front instead of a single answer. Use when
  asked to "compress the schedule", "crash the schedule", "level resources", "optimize the
  sequence", "run a genetic algorithm on the schedule", "time-cost trade-off", or when given an
  RCPSP, activity list with resource demands, or crash-cost table.
metadata:
  author: mandala-networks
  version: "0.1.0"
---

# Schedule optimization

Optimization amplifies whatever logic it is given. Run it on a schedule with open ends and hard
constraints and it will return a confident, precise, unbuildable answer. **Run
`schedule-logic-review` first.** If checks 1, 2, 5, 7, or 12 fail, fix the network before
optimizing and say so — do not proceed and caveat.

## Name the problem before choosing a method

Four different problems get called "optimize the schedule", and they take different
formulations. Getting this wrong is the most common failure.

| The ask | The problem | Decision variables | Objective |
|---|---|---|---|
| "Finish sooner, we'll pay for it" | **Time-cost trade-off (crashing)** | Duration mode per activity | Minimize total cost at a target date, or map the cost-time curve |
| "Stop the manpower spikes" | **Resource levelling** | Start times within float; project duration **fixed** | Minimize variation in daily resource use |
| "We only have 6 crews" | **Resource-constrained scheduling (RCPSP)** | Activity sequence under renewable resource limits | Minimize project duration |
| "Cheapest, fastest, lowest carbon" | **Multi-objective (MO-RCPSP / TCQT)** | Modes and sequence | Pareto front, not one answer |

Levelling does not shorten a project. Constrained scheduling usually lengthens it relative to
unconstrained CPM. If someone expects levelling to pull in the finish date, correct that
expectation before running anything.

## Crashing: use the analytic method first

For time-cost trade-off, a genetic algorithm is usually the wrong tool. The classical method is
exact, explainable, and defensible in a claim:

1. Cost slope per activity = `(crash cost − normal cost) ÷ (normal duration − crash duration)`.
   Cost per day saved. Activities with no crash option have infinite slope.
2. Crash the **lowest-slope activity on the critical path**, one day at a time.
3. **Recompute the network after every step.** A parallel path becomes critical and further
   crashing on the original path buys nothing — this is the error that makes hand-crashed
   schedules wrong.
4. When multiple paths are critical, you must crash one activity on **each** path
   simultaneously; the effective slope is their sum.
5. Stop when the daily indirect cost saving no longer exceeds the crash cost, or the target
   date is met, or nothing crashable remains on a critical path.

Report the whole curve, not a point. The useful output is total cost as a function of project
duration, with the minimum-cost duration marked.

## When a metaheuristic is warranted

Reach for a genetic algorithm when the search space is discrete and combinatorial and no exact
method scales: RCPSP with resource limits, multi-mode activities, or several competing
objectives. Two encoding decisions determine whether it works at all.

**Encode with an activity list plus a serial schedule generation scheme.** The activity list is
a precedence-feasible permutation; the serial SGS schedules each activity at the earliest time
its predecessors are complete and its resources are available. Feasibility is guaranteed **by
construction** — no penalty function, no repair operator, no invalid individuals. This is the
standard formulation and it outperforms the alternatives that make you patch feasibility
afterwards.

- **Crossover:** one- or two-point precedence-preserving crossover on the activity list; the
  child inherits a prefix from one parent and the remaining activities in the other parent's
  relative order.
- **Mutation:** swap adjacent activities only where the swap does not violate precedence.
- **Multi-mode:** carry a parallel mode vector; check nonrenewable resource feasibility
  separately, since mode choice can violate a total budget that sequencing cannot fix.
- **Backward-forward improvement** as a local search pass gives a large improvement for very
  little code and is standard in strong RCPSP solvers.

**Do not use a random-key or priority-value encoding with a penalty function** unless you have a
reason. It spends most of its evaluations in the infeasible region.

**Levelling objectives.** Minimize the sum of squares of daily resource usage (the Burgess
method) — it penalizes peaks quadratically, which is what "smooth the crew curve" means. Report
the peak, the average, the peak-to-average ratio, and the resource improvement coefficient, not
just the objective value.

**Multi-objective.** Use a Pareto approach (NSGA-II or similar) and **present the front**. A
weighted sum collapses the trade-off into weights that nobody agreed to and hides the options a
project manager actually wants to choose between. The deliverable is a set of non-dominated
schedules with their duration, cost, resource peak, and carbon, and a recommendation the human
can overrule.

## Constraints that are physics, not variables

An optimizer will happily shorten these. They are not compressible by adding crews or shifts,
and a schedule that compresses them is not a schedule.

- Concrete strength gain — a 28-day strength requirement is 28 days. Early-strength mixes are a
  *design change*, not a crash decision.
- Curing, drying, and moisture-content requirements before finishes.
- Procurement and fabrication lead times — structural steel, elevators, switchgear, generators,
  air handling units, curtain wall. Model as activities with fixed durations, never as lags.
- Inspections, testing periods, and authority-having-jurisdiction review windows.
- Submittal review and resubmittal periods (see `submittal-register`).
- Weather and seasonal restrictions; calendar-bound work.
- Contractual milestones, phasing, and access dates.

Add each as an explicit constraint and list it in the output. **Never invent one of these
durations** — an unstated cure time or lead time is `unknown` with a named owner, and the run
is reported as conditional on it.

Crashing has real limits too: crew size has diminishing returns and then negative returns from
congestion, overtime productivity falls off after sustained weeks, and second shifts carry
supervision cost and quality risk. If a crash table was supplied, use its bounds. If not, say
the crash bounds are unknown rather than assuming a percentage.

## Benchmarking the optimizer

Optimization results are only credible against a known reference. PSPLIB is the standard RCPSP
benchmark library — the `j30`, `j60`, and `j120` instance sets, with known optima for `j30` and
best-known solutions for the larger sets. Report the deviation from optimum or best-known for
`j30` before reporting results on a real project. An optimizer that has not been checked
against a reference instance is an unvalidated number with a decimal point.

For every run, report the parameters and the reproducibility inputs: population, generations,
crossover and mutation rates, selection scheme, random seed, number of schedules generated, and
wall time. A result that cannot be reproduced cannot be defended.

## Required behavior

1. Run `schedule-logic-review` first and report its result. Do not optimize a network that
   fails the structural checks.
2. Name which of the four problems this is, and confirm it against what was asked.
3. List every constraint you applied and every input you were missing. Missing inputs are
   `unknown` with an owner, never a default.
4. For crashing, use the analytic cost-slope method and recompute the critical path each step.
5. For multi-objective work, return the Pareto front. Never return one weighted answer as *the*
   optimum.
6. Report parameters, seed, and evaluation count for any stochastic search.
7. Compare every result against the unoptimized baseline on the same metrics, and state the
   improvement as a delta.
8. State that an optimized sequence is a proposal requiring means-and-methods review. Sequence
   is the contractor's prerogative and its risk.

## Output

```json
{
  "problemType": "resource-constrained scheduling",
  "logicReview": { "ran": true, "blockingFailures": [], "note": "string" },
  "baseline": { "duration": 0, "cost": "0.00", "resourcePeak": 0 },
  "constraintsApplied": [
    { "type": "cure", "activity": "A1200", "duration": 28, "source": "03 30 00, para 3.9.A" }
  ],
  "unknownInputs": [
    { "field": "structural steel fabrication lead time", "owner": "procurement manager" }
  ],
  "method": {
    "algorithm": "GA, activity list + serial SGS, backward-forward improvement",
    "population": 100,
    "generations": 500,
    "crossover": "two-point precedence-preserving, 0.8",
    "mutation": "adjacent swap, 0.05",
    "seed": 42,
    "schedulesGenerated": 50000,
    "wallTimeSeconds": 0
  },
  "validation": { "reference": "PSPLIB j30", "deviationFromOptimum": "0.4%" },
  "paretoFront": [
    { "duration": 0, "cost": "0.00", "resourcePeak": 0, "carbonKgCO2e": 0, "recommended": false }
  ],
  "recommendation": { "index": 0, "rationale": "string" },
  "unresolvedQuestions": [{ "question": "string", "owner": "string" }]
}
```

## Boundaries

Do not issue an optimized schedule as a revised baseline, commit to a completion date, direct a
subcontractor's sequence, authorize acceleration, or price a crash. Acceleration directed
without a change order is a claim waiting to happen. The contractor's scheduler and project
manager own means, methods, and sequence; the owner accepts the baseline.
