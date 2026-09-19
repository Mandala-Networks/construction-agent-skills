# Platform packaging

One canonical `skills/` tree and `agents/` role library serve every platform.
Following the b-open-io/prompts design, Claude and Codex have separate real
manifests with matching identity/version metadata. No generated source copies,
cross-package symlinks, hooks, credentials, or connector installs are required.

| Platform | Entry point | Current verification |
| --- | --- | --- |
| Claude Code | `.claude-plugin/plugin.json`; native `skills/` and `agents/` discovery | Local structure checked; fresh-session install not yet tested |
| Codex | `.codex-plugin/plugin.json`; explicit `skills` path | Manifest validated; agent roles are explicit-read documents, not registered custom agents |
| Other SKILL.md hosts (including OpenCode/Grok integrations) | Select a directory under `skills/`; read role files explicitly if needed | Portable source available; native discovery not claimed |

For a local Claude smoke test, launch `claude --plugin-dir /absolute/path/to/construction-agent-skills`
and ask for a sourced bid checklist from the synthetic fixture. For Codex,
import the plugin directory through your host's supported local-plugin flow;
no marketplace or global configuration is changed by this repository.
For explicit-read use, ask the assistant to read the selected `SKILL.md` and
provide authorized task inputs separately.

Run `bun run check` before packaging. Keep each skill self-contained; if adding
resources, keep them inside its directory. Agent role links resolve inside the
whole plugin root. Test an isolated archive and fresh host session before
claiming native support. Adding a new platform must not weaken construction
source, uncertainty, or approval behavior.

No redistribution license has been selected for this repository. Do not label
it MIT/Apache or vendor external material without the owner's license decision
and upstream attribution. This does not prevent owner-authorized local work.
