# Construction Skills

Benchmark-tested construction workflows for AI coding agents, packaged as a plugin for
**Claude Code**, **Codex**, and **Grok Build**, with **Rob** — a construction operations agent —
routing work to the right skill.

A skill is not ready because its prompt sounds convincing. It earns that label by running
against representative documents, preserving source traceability, avoiding invented facts, and
leaving consequential decisions with a person.

## Install

```bash
# Claude Code
/plugin marketplace add Mandala-Networks/construction-agent-skills
/plugin install construction-skills@mandala-networks

# Codex
codex plugin marketplace add Mandala-Networks/construction-agent-skills
codex plugin add construction-skills@mandala-networks

# Grok Build
grok plugin install Mandala-Networks/construction-agent-skills --trust
```

One `skills/` directory serves all three hosts. Claude Code and Grok Build discover it
automatically; the Codex manifest declares it. Rob ships as a Claude Code subagent
(`agents/rob.md`) shared with Grok Build, and as a generated Codex custom
agent (`codex/agents/rob.toml`).

See [installation and compatibility evidence](plugins/README.md) for workspace exports,
OpenCode/OpenWork support, native smoke checks, and remaining runtime limitations.
The package also includes bid-reviewer, document-controller, material-analyst, and automation-steward roles.

## Skills

| Skill | Job to be done | Status |
| --- | --- | --- |
| **bid-leveling** | One comparison sheet per trade from a whole bid set, named plan baselines, and the responsibility matrix | Benchmarked |
| **bid-requirements-register** | Sourced bid checklist from invitations, addenda, and spec extracts | Benchmarked |
| **schedule-logic-review** | DCMA 14-point assessment of a CPM schedule, defect by activity | Benchmarked |
| **pay-application-review** | G702/G703 arithmetic, retainage, stored materials, change order tie-out | Benchmarked |
| **document-readiness-review** | Document coverage, extraction quality, and revision readiness | Specification |
| **material-index-review** | Material index freshness and sourced changes | Specification |
| **scheduled-job-triage** | Scheduled job outcomes and human-owned follow-up | Specification |
| **csi-spec-router** | Place a document or requirement in the right MasterFormat section; convert legacy 5-digit numbers | Specification |
| **submittal-register** | Submittal log from a project manual, classified by action, informational, and closeout | Specification |
| **rfi-drafting** | An RFI that asks one answerable question instead of answering it | Specification |
| **subcontractor-scope-gap-review** | Crosswalk a proposal against scope; silence stays `not addressed` | Specification |
| **drawing-revision-change-log** | Sheet-by-sheet delta between two drawing issues, with coverage reported | Specification |
| **quantity-takeoff-audit** | Unit-of-measure errors, double-counted waste, unstated geometry assumptions | Benchmarked |
| **safety-jha** | Task hazard analysis ranked by the hierarchy of controls with OSHA 1926 references | Specification |
| **schedule-optimization** | Crashing, levelling, RCPSP, and multi-objective trade-offs with a Pareto front | Specification |

**Benchmarked** means a runnable case with synthetic fixtures, an expected-answer file, traps a
naive answer falls into, and an example submission that scores 1.0. **Specification** means the
decision rules are written and reviewed but the fixtures are not built yet.

## Quick start

```bash
bun install
bun run check           # typecheck, lint, tests, manifest parity, Codex adapter freshness
bun run benchmark:all   # every checked-in example submission
```

Score a single submission:

```bash
bun run benchmark benchmarks/schedule-logic-review/cases/case-001/candidate.example.json
```

Every benchmark returns the same five measures, so results are comparable across skills:

- **coverage** — required findings the answer actually reported;
- **traceability** — required source references present on those findings;
- **conflictRecall** — conflicting values surfaced rather than silently resolved;
- **hallucinations** — findings that are not real, including the seeded traps;
- **humanDecisionCompliance** — findings correctly escalated instead of decided.

The command exits non-zero when a threshold is missed, so the same gate runs locally and in CI.

## Why these skills

Two kinds of skill produce measurable improvement over an unassisted model, and this library
only admits those two:

1. **Behavioral suppression.** The model reliably does something wrong and the skill stops it —
   inferring a bid date from convention, answering an RFI instead of asking it, reading a
   proposal's silence as coverage, listing PPE as the only hazard control.
2. **Genuinely novel knowledge.** Domain specifics a knowledgeable person would look up: the
   DCMA thresholds, G702 line arithmetic, the MasterFormat Division 15/16 split, OSHA fall
   protection triggers that differ by activity, precedence-feasible GA encodings for RCPSP.

Everything else is prose the model would have produced anyway, and it benchmarks at zero delta.

## Repository map

```text
skills/           Portable SKILL.md packages, shared by all three hosts
agents/           Rob, canonical agent definition shared with Grok Build
codex/agents/     Generated Codex custom agent adapters - do not edit by hand
commands/         Slash commands
benchmarks/       Cases, synthetic fixtures, expected facts, and example submissions
schemas/          The stable result contract for dashboards and comparisons
scripts/          Deterministic validation, scoring, and adapter generation
docs/             Evaluation and data-handling methodology
.claude-plugin/   Claude Code manifest and marketplace
.codex-plugin/    Codex manifest
.grok-plugin/     Grok Build manifest and marketplace
.agents/plugins/  Codex marketplace catalog
```

## Product principle

Construction errors are expensive because the work is contextual. Every workflow here must:

1. cite the source document and location for material claims;
2. distinguish missing information from a negative finding;
3. flag conflicts instead of silently choosing a version;
4. ask for human judgment at contractual, safety, cost, and schedule gates;
5. expose an evaluation another team can reproduce.

No customer, project, employee, bid, or CRM data appears in this repository. Every fixture is
synthetic.

See [the benchmark methodology](docs/methodology.md) and [contribution rules](CONTRIBUTING.md)
before adding a skill.
