# Harness compatibility

One repository publishes to Claude Code, Codex, and Grok Build. The construction decision rules
are identical on all three; only packaging differs. This document records what each host reads,
so a change to one manifest is never made blind.

## What each host reads

| | Claude Code | Codex | Grok Build |
|---|---|---|---|
| Manifest | `.claude-plugin/plugin.json` | `.codex-plugin/plugin.json` | `.grok-plugin/plugin.json` |
| Marketplace | `.claude-plugin/marketplace.json` | `.agents/plugins/marketplace.json` | `.grok-plugin/marketplace.json` |
| Skills | `skills/` auto-discovered | declared: `"skills": "./skills/"` | `skills/` auto-discovered |
| Commands | `commands/` auto-discovered | not supported | `commands/` auto-discovered |
| Agents | `agents/*.md` | `codex/agents/*.toml`, installed separately | `agents/*.md` |
| Install | `/plugin install construction-skills@mandala-networks` | `codex plugin add construction-skills@mandala-networks` | `grok plugin install Mandala-Networks/construction-agent-skills --trust` |

Only `plugin.json` and `marketplace.json` belong inside the dot-prefixed plugin directories.
Every component directory — `skills/`, `commands/`, `agents/`, `hooks/` — lives at the
repository root. All three hosts enforce this.

## Manifest parity

The three manifests must agree on `name`, `version`, `description`, `author`, `homepage`,
`repository`, and `keywords`, and every marketplace file must carry the same version.
`bun run plugin:check` enforces it; `bun run plugin:bump` moves them together.

Codex caches installed plugin contents **by version**. A stale version silently preserves stale
skills even after the source commit moves, so a content change without a version bump is
invisible to Codex users. Bump on every published change.

Host-specific fields sit alongside the shared ones and are not synchronized: Codex carries an
`interface` block for its plugin surface, and `skills` because it does not auto-discover.

## Skill frontmatter that travels

Only `name` and `description` are read by all three. `description` is the routing signal on
every host, so it must carry the phrases a user would actually type, not a summary.

Claude Code additionally reads `metadata`, `tags`, and `disable-model-invocation`. Grok Build
additionally reads `when-to-use`, `paths`, `allowed-tools`, `argument-hint`, and
`user-invocable`, and accepts but ignores `model`, `effort`, `license`, and `compatibility`.
Codex reads `name` and `description` only. Anything a host does not recognize is ignored, so
extra fields are safe — but never encode required behavior in a field only one host reads.

Codex allocates roughly two percent of the model's context window to skill descriptions across
**every** installed plugin. That budget is shared, not per-plugin. Keep descriptions
trigger-dense rather than long, and split into modules before the catalog grows large enough to
crowd out another publisher's plugin.

## Agents are the one thing that genuinely differs

`agents/rob.md` is canonical.

- **Claude Code** loads it directly as a subagent and exposes it as `construction-skills:rob`.
- **Grok Build** discovers the same `agents/*.md` definitions natively; no symlink adapter is needed.
- **Codex** resolves custom agents from `.toml` files, not from the plugin manifest, and
  installs them separately from the plugin. `scripts/generate-codex-agents.ts` renders
  `codex/agents/rob.toml` from the source `.md`, prepending a runtime-translation prelude that
  maps Claude tool names to Codex equivalents. The generated file records the source hash;
  `bun run codex:agents:check` fails when it drifts, and runs as part of `bun run check`.

The prelude translates runtime concepts only. It never relaxes a sourcing, uncertainty, or
human-approval rule to accommodate a missing tool — a Codex session that cannot do something
reports the limitation rather than lowering the standard.
