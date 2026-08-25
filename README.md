# Construction Agent Skills

Benchmark-tested skills and workflow components for construction agents.

This private Mandala Networks repository turns narrow, repeatable construction
tasks into portable skills, fixtures, and measurable evaluations. A skill is
not ready because its prompt sounds convincing. It earns that label by running
against representative documents, preserving source traceability, avoiding
invented facts, and leaving consequential decisions with a person.

## What is here

| Skill | Job to be done | Benchmark |
| --- | --- | --- |
| **bid-requirements-register** | Build a sourced bid checklist from invitation and specification documents | Runnable synthetic case |
| **drawing-revision-change-log** | Compare drawing issues and record changed scope with sheet references | Specification drafted |
| **subcontractor-scope-gap-review** | Compare proposal inclusions and exclusions against bid requirements | Specification drafted |

The first runnable benchmark uses synthetic source documents. No customer,
project, or private CRM data is included.

## Quick start

~~~bash
bun install
bun run check
bun run benchmark:example
~~~

The example benchmark returns four directly inspectable measures:

- requirement coverage;
- source-reference coverage;
- contradiction recall;
- invented-requirement count.

The command exits non-zero when a threshold is missed, making the same gate
usable locally and in CI.

## Repository map

~~~text
skills/       Portable SKILL.md packages
benchmarks/   Cases, expected facts, rubrics, and example submissions
schemas/      Stable result contracts for dashboards and comparisons
scripts/      Deterministic validation and scoring
docs/         Evaluation and data-handling methodology
plugins/      Packaging notes for harness-specific adapters
~~~

## Product principle

Construction errors are expensive because the work is contextual. Every
workflow in this library should therefore:

1. cite the source document and location for material claims;
2. distinguish missing information from a negative finding;
3. flag conflicts instead of silently choosing a version;
4. ask for human judgment at contractual, safety, cost, and schedule gates;
5. expose an evaluation that another team can reproduce.

See [the benchmark methodology](docs/methodology.md) and
[contribution rules](CONTRIBUTING.md) before adding a skill.
