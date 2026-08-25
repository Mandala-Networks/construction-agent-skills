# Changelog

All notable changes to this plugin are recorded here. This file is a release artifact.

## [Unreleased]

## [0.2.0] - 2026-08-25

### Added

- **Rob**, a construction operations agent, shipping to all three hosts: canonical Claude Code
  definition at `agents/rob.md`, a Grok Build `AGENTS.md` adapter, and a generated Codex custom
  agent at `codex/agents/rob.toml`.
- Tri-harness plugin packaging: `.claude-plugin/`, `.codex-plugin/`, and `.grok-plugin/`
  manifests over one shared `skills/` directory, with marketplace catalogs for each host and
  `.agents/plugins/marketplace.json` for Codex.
- Eight staple skills: `csi-spec-router`, `submittal-register`, `rfi-drafting`,
  `schedule-logic-review`, `pay-application-review`, `quantity-takeoff-audit`, `safety-jha`,
  and `schedule-optimization`.
- Runnable benchmarks with seeded traps for `schedule-logic-review` and
  `pay-application-review`.
- `bun run benchmark:all` runs every checked-in example submission.
- `scripts/check-plugin.ts` enforces manifest, marketplace, catalog, and README parity, and
  bumps every host version together with `--bump-patch`.
- `scripts/generate-codex-agents.ts` generates and freshness-checks the Codex agent adapters.
- Slash commands `/rob` and `/new-construction-skill`.

### Changed

- Renamed from `construction-agent-skills` to `construction-skills`. The agent has a name now;
  the repository does not need one.
- `drawing-revision-change-log` and `subcontractor-scope-gap-review` promoted from stub
  specifications to full skills with defined output shapes and boundaries.
- The benchmark grader normalizes any skill's output shape through a `candidate` declaration in
  `benchmark.json`, so one result contract covers every skill.
- `bun run check` now also verifies plugin manifest parity and Codex adapter freshness.

## [0.1.0]

### Added

- Initial benchmark harness, result schema, and the `bid-requirements-register`,
  `drawing-revision-change-log`, and `subcontractor-scope-gap-review` specifications.
