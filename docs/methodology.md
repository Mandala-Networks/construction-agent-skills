# Benchmark methodology

The benchmark layer measures the output a construction team needs, not whether
the prose appears intelligent.

## Case design

A case contains source documents, an expected-facts file, a rubric, and one or
more candidate outputs. Synthetic cases should preserve the ambiguity and
cross-document conflicts of real work without copying a customer record.

## Core measures

- **Coverage**: required facts present in the candidate output.
- **Traceability**: required facts connected to the expected document location.
- **Conflict recall**: contradictory requirements surfaced for review.
- **Hallucinations**: output requirements absent from the expected-facts file.
- **Human-decision compliance**: uncertain or consequential fields left for
  human resolution where the expected file requires it.

Pass thresholds belong to the benchmark manifest and must not be changed after
seeing a model's result. Run multiple repetitions for probabilistic systems.

## Reporting

Store the model and harness version, system instructions, run date, repetition
count, latency, and estimated cost with any result shown publicly. Never compare
models using different fixtures or rubrics without labeling the difference.

Deterministic assertions should be evaluated by code. Subjective checks such as
usefulness or readability should use a blinded human rubric and publish the
number of reviewers.


## Traps are part of the expected file

A case that only lists what a correct answer must contain measures recall and nothing else. Each
`expected.json` also carries `forbiddenIds`: findings a plausible wrong answer produces and a
correct one does not.

The seeded traps in the current cases:

- **schedule-logic-review** — the project start and finish milestones each have one legitimate
  open end. A reviewer that reports them as defects is applying the DCMA logic check without
  knowing its exception, and scores a hallucination.
- **pay-application-review** — a deductive change order carries a negative scheduled value. That
  is correct, not an arithmetic defect. So is Line 6, which foots even though Lines 7 and 8 do
  not; a reviewer that flags every line near a real error is pattern matching, not checking.

A trap must be something a competent-sounding answer actually does. Inventing an implausible
wrong answer to fail against inflates the score without measuring anything.

## One result contract, many output shapes

Skills return different top-level keys — `requirements`, `defects`, `submittals`,
`potentialChanges`. Each `benchmark.json` declares which key carries the primary list:

```json
{ "candidate": { "primaryKey": "defects", "conflictKey": "conflicts" } }
```

The grader normalizes against that declaration, so every skill is scored by the same code and
emits the same five measures against `schemas/benchmark-result.schema.json`. Results stay
comparable across skills without forcing every skill into one output shape.

## Status vocabulary

`catalog.json` carries one of two statuses per skill.

- **specification** — the decision rules are written and reviewed; fixtures are not built.
  Usable, but its behavior is unmeasured. Say so when reporting on it.
- **benchmark-ready** — a runnable case with synthetic fixtures, seeded traps, and an example
  submission scoring 1.0.

Never describe a specification-status skill as validated.
