# Install and verify

Canonical skills live in `skills/`; role instructions live in `agents/`.
Platform marketplace catalogs share one plugin root, following b-open-io/prompts.
Exports translate file layout and role metadata without forking the instructions.
The marketplace is named **mandala-networks** and the plugin is
**construction-skills**. These local changes must reach a remote branch
before a GitHub installation can retrieve them.

## Compatibility evidence (2026-09-19)

| Platform | Distribution | Verified locally | Still unverified |
| --- | --- | --- | --- |
| Claude Code 2.1.276 | Claude marketplace or workspace export | Isolated marketplace installation; 14 skills and 5 roles inventoried | Model behavior |
| Grok Build 1.0.34 | Claude-compatible plugin/marketplace or workspace export | Isolated plugin installation discovers 14 skills and 5 roles | Direct workspace skill discovery was absent in an untrusted folder; verify trust in the UI |
| Codex CLI 0.154.0 | Codex marketplace or workspace export | Manifest validation, TOML parsing, contained role references | Native marketplace install and agent discovery |
| OpenCode 1.18.30 | `.opencode/skills` and `.opencode/agents` export | Native discovery of 14 skills and 5 subagents | Model behavior |
| OpenWork 0.18.48 | Claude-compatible plugin import; OpenCode-layout workspace export | Previous six-skill bundle visible in desktop skill picker after opening exported local workspace | Desktop subagent behavior, manifest import, managed Cloud publication |

The table counts are from 2026-09-19. On 2026-09-22, after `bid-leveling` was added,
`bun run smoke:platforms` discovered 15 skills and 5 roles in Claude Code 2.1.280 and Grok
Build 1.0.40. OpenCode was not re-run.

A manifest check is not an installation test; a discovery check is not a domain
evaluation. The table deliberately separates them. No provider or MCP connection
is required to install these instructions. Host credentials and tool permissions
stay outside the bundle.

## Marketplace installation from a checkout

Run these in this repository root, only for the host you intend to configure:

```sh
# Claude Code
claude plugin marketplace add .
claude plugin install construction-skills@mandala-networks
claude plugin details construction-skills@mandala-networks

# Codex
codex plugin marketplace add .
codex plugin add construction-skills@mandala-networks

# Grok Build (shared Claude-compatible catalog)
grok plugin marketplace add .
# Direct local plugin installation is also supported:
grok plugin install .
grok inspect --json
```

After merging these catalogs into the default branch, replace `.` with
`Mandala-Networks/construction-agent-skills` to use a Git source. Do not pass a
raw marketplace.json URL: relative source paths require the whole checkout.
Restart the host after installation or updates and verify the skill names in catalog.json.
Use each host's native update/uninstall commands; don't edit its cache manually.
Install the plugin OR workspace export to avoid duplicate capabilities.

## Workspace exports

Bun is a build-time dependency; exported instruction bundles do not require it.
Choose a new directory whose parent already exists:

```sh
bun run export:workspace openwork /tmp/construction-openwork
bun run export:workspace opencode /tmp/construction-opencode
bun run export:workspace codex /tmp/construction-codex
bun run export:workspace grok /tmp/construction-grok
bun run export:workspace claude /tmp/construction-claude
bun run export:workspace plugin /tmp/construction-plugin
```

Each command writes only to the requested new directory and refuses an existing
destination, including symlinks. No overwrite, shell hooks, credentials, or global
configuration is installed. The source allowlist is skills, roles, commands in plugin bundles, and plugin
manifests/catalogs where needed. Text-only resources are currently supported;
symlinks, runtime-data names, invalid UTF-8, and suspicious secret patterns fail
before destination creation. Human privacy review remains necessary.

`construction-export.json` records version and SHA-256 for every capability file.
Review the export, then open it as a workspace or selectively copy its hidden
platform directories into a project after resolving collisions. Generate a fresh
export for updates and review a diff; no merge/uninstall manager is implied.

Codex exports native `.codex/agents/*.toml` role definitions and skills under
`.agents/skills/`. OpenCode/OpenWork exports use `.opencode/` with `mode: subagent`.
Claude and Grok exports use their respective hidden directories. Role references
are relative to the role file and tested within the exported tree. Model choice,
execution permission, and schedules remain host settings, not portable promises.

## OpenWork

OpenWork's [migration guide](https://openworklabs.com/docs/start-here/migrate-from-claude-cowork)
supports SKILL.md folders and Claude-compatible plugin manifests. The tested
OpenWork 0.18.48 path is **Add workspace → Local workspace → Select folder**:
choose the generated OpenWork directory, create the workspace, then open the
composer's capability picker → Skills. The previous six-skill bundle appeared; the expanded
fourteen-skill bundle is covered by export tests, not a new desktop interaction.
No prompt was sent. Its Agents picker showed primary agents only; subagent
behavior remains unverified in the desktop app.

The Library's Add Plugin flow in this version creates an organization plugin;
it is not the local workspace flow. We cancelled it without publishing. Manifest
import is documented upstream but not verified here; use the tested workspace
path rather than assuming an import button exists in every app version.

OpenWork's [managed publication guide](https://openworklabs.com/docs/start-here/do-work-with-it/publish-and-copy-a-skill)
uses Plugin Directory and Collections for team distribution. That is an optional
organization publication step, not something this exporter configures. Do not
upload project data or credentials with the generic plugin. Existing application
schedules do not migrate into OpenWork merely by installing a skill.

## Reproducible verification

```sh
bun run check
bun run benchmark:example
bun run smoke:platforms
```

The optional smoke runner uses temporary Claude/Grok configuration and temporary
OpenCode XDG directories. It makes no inference calls, cleans up its own test
workspace, and reports unavailable CLIs as skipped. It never rewrites HOME or
CODEX_HOME. Codex native installation and OpenWork subagent/manifest-import testing remain
manual gates. Export/link/hash tests run in the existing CI via `bun run check`.

Sources: [Claude marketplaces](https://code.claude.com/docs/en/plugin-marketplaces),
[Grok skills and plugins](https://docs.x.ai/build/features/skills-plugins-marketplaces),
[OpenCode skills](https://opencode.ai/docs/skills/),
[OpenCode agents](https://opencode.ai/docs/agents/), and installed Codex CLI help.
Installed Grok 1.0.34 rejected the documented `--plugin-dir` flag, so the tested
path uses `grok plugin install`; do not assume every docs feature exists locally.

No redistribution license has been selected. Do not label the repository MIT or
Apache, or add third-party material without its license and attribution.
