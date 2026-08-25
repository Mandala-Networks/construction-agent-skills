# Contributing

Start with one narrow job and a measurable failure mode. Avoid broad
"construction assistant" prompts.

Every proposed skill needs:

1. a SKILL.md with inputs, outputs, refusal boundaries, and review gates;
2. at least one representative fixture set;
3. expected facts and source references that a reviewer can inspect;
4. a scoring rubric with explicit pass thresholds;
5. a record of the harness, model, date, repetitions, latency, and cost used in
   each published benchmark run.

Use synthetic fixtures by default. Redacting names alone is not sufficient for
real project records because scope, dates, addresses, pricing, and drawing
content may still identify the work.

