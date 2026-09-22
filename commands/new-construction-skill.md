---
description: >-
  Scaffold a new construction skill in this repository, including its benchmark.
  Use when asked to "add a construction skill", "new construction skill", or
  /new-construction-skill for a workflow this plugin does not yet cover.
argument-hint: "[skill-name] [what job it does]"
---

Create a new skill in this repository for: $ARGUMENTS

Before writing anything, read two existing skills — `skills/schedule-logic-review/SKILL.md` and
`skills/pay-application-review/SKILL.md` — to calibrate structure, tone, and depth. Then read
`CONTRIBUTING.md` and `docs/methodology.md`.

A skill is admitted here only if it does at least one of two things, because only these two
produce measurable benchmark delta:

- **Suppresses a behavior the model reliably exhibits without it** — inventing a date,
  answering an RFI, treating silence as coverage, reaching for PPE first.
- **Injects domain knowledge the model does not reliably have** — DCMA thresholds, G702 line
  arithmetic, MasterFormat renumbering, OSHA trigger heights, SGS encoding.

If the skill does neither, say so and stop. General-quality prose does not earn a skill.

Deliver:

1. `skills/<name>/SKILL.md` with frontmatter (`name` matching the directory, a `description`
   carrying real trigger phrases, `metadata.author` and `metadata.version`), the required
   behavior, the output shape, and a `## Boundaries` section naming what stops at a human.
2. A benchmark under `benchmarks/<name>/` with `benchmark.json`, at least one case with
   synthetic `input/`, an `expected.json` including `forbiddenIds` traps a naive answer would
   fall into, and a `candidate.example.json` that scores 1.0.
3. Tests in `tests/` proving both directions: the example passes, and a plausible wrong answer
   fails on a specific metric.
4. Entries in `catalog.json` and the `README.md` inventory.

Then run `bun run check` and `bun run benchmark:all`. Fixtures must be synthetic. No customer,
project, employee, bid, or CRM data.
