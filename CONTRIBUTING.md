# Contributing

Start with one narrow job and a measurable failure mode. Avoid broad "construction assistant"
prompts.

## The admission test

Before writing a skill, answer one question: **what would an unassisted model get wrong here?**

Only two answers justify a skill, because only two produce measurable delta:

1. **Behavioral suppression.** The model reliably does something wrong and the skill stops it.
   Inferring a bid date from convention. Answering an RFI instead of asking it. Reading a
   proposal's silence as coverage. Listing PPE as the only hazard control. Flagging a project
   start milestone as an open end.
2. **Genuinely novel knowledge.** Specifics a knowledgeable person would look up: DCMA
   thresholds, G702 line arithmetic, the MasterFormat Division 15/16 split, OSHA trigger
   heights that differ by activity.

If neither applies, the model would produce the same output without your skill, and the
benchmark will show zero delta. Say so and stop rather than shipping prose.

## What a proposed skill needs

1. `skills/<name>/SKILL.md` with inputs, outputs, refusal boundaries, and review gates.
   Frontmatter `name` matching the directory, a `description` carrying the phrases a user would
   actually type, and `metadata.author` / `metadata.version`.
2. At least one representative fixture set, synthetic by default.
3. An `expected.json` a reviewer can inspect, including `forbiddenIds` — the traps a naive
   answer falls into. A benchmark with no traps measures nothing.
4. A `benchmark.json` with explicit pass thresholds, set before you see a model's result.
5. A `candidate.example.json` that scores 1.0, so a grader regression is visible.
6. Tests proving both directions: the example passes, and a plausible wrong answer fails on a
   specific named metric.
7. Entries in `catalog.json` and the `README.md` inventory.
8. For a published benchmark run: the harness, model, date, repetition count, latency, and cost.

`/new-construction-skill` scaffolds all of this.

## Fixtures

Use synthetic fixtures by default. Redacting names alone is not sufficient for real project
records — scope, dates, addresses, pricing, and drawing content may still identify the work.
Mark every fixture as synthetic in the file itself, not only in a README.

## Before you commit

```bash
bun run check
bun run benchmark:all
```
