# Repository instructions

This repository is a plugin for three agent harnesses. Its canonical behavior lives in
`skills/` and `agents/`; everything under `.claude-plugin/`, `.codex-plugin/`,
`.grok-plugin/`, `.agents/`, and `codex/` is packaging.

## Working rules

- Use Bun for installation, scripts, and tests.
- Run `bun run check` before committing. It covers typecheck, lint, tests, plugin manifest
  parity, and Codex adapter freshness.
- Never add real customer, project, employee, bid, CRM, or credential data. Fixtures must be
  synthetic, licensed, or explicitly approved.
- Add or update a benchmark whenever behavior changes.

## Skills

- One skill, one narrow job. No broad "construction assistant" prompts.
- A skill is admitted only if it suppresses a behavior the model reliably gets wrong, or
  injects domain knowledge the model does not reliably have. Nothing else produces measurable
  delta over an unassisted model.
- Every SKILL.md needs frontmatter `name` matching its directory, a `description` carrying real
  trigger phrases, a defined output shape, and a `## Boundaries` section.
- Every skill must cite source locations, expose uncertainty as `unknown` rather than a default,
  and preserve human approval at contractual, safety, cost, and schedule decisions.
- `skills/` is shared verbatim across Claude Code, Codex, and Grok Build. Do not write
  host-specific instructions into a SKILL.md; put host differences in the manifests.

## Agents

- `agents/<name>.md` is canonical and discovered by Claude Code and Grok Build.
- `codex/agents/*.toml` is generated. Never hand-edit it — change the source `.md` and run
  `bun run codex:agents`.

## Releasing

- The three host manifests and every marketplace file must carry the same version. Bump them
  together with `bun run plugin:bump`.
- Update `CHANGELOG.md` and the `README.md` inventory whenever the public skill set, install
  flow, or runtime behavior changes.
- Pushing to the default branch publishes the plugin. Do not leave a committed version bump
  unpushed.
