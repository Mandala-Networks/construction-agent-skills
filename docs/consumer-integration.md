# Canonical plugins and consumer integration

Status: agreed direction for implementation; publication and consumer update automation
described here are not implemented yet.

## Native plugins first

Mandala is a portable construction skill and agent library. Its preferred installation is
the target harness's native plugin system. Custom applications are consumers of the same
library, not the architecture around which portable skills are designed.

Claude Code, Codex and Grok Build already have packaging in this repository. Verify each
supported host's current installation, discovery, agent registration and update behavior.
Use native plugins wherever supported; workspace exports are explicit fallbacks where a
native route is absent or unverified. An application bundle is the adapter for custom hosts
such as an embedded web application. All routes consume the same canonical behavior.

Track packaged, discovery-tested, behavior-tested and update-tested status separately for
each host/version. Use native update mechanisms where supported and tested. Where the host
requires user action or restart, expose installed/available versions and the required step;
do not claim universal automatic installation. No hook runtime is implied by distributing
skills or agent definitions.

## Ownership

Mandala owns construction skills, reusable agent/workflow instructions, behavioral
fixtures, output contracts, templates and supported hook definitions. Improvements found
in a consuming product are authored and tested here. Portable skill bodies remain
host-independent; host-specific variants and packaging belong in explicit adapters.

Products own authentication, permissions, tool implementations, persistence, model
execution and user interfaces. Company and project facts are runtime inputs, not forks
of canonical instructions. Private customer data must never enter this repository.

Consumers must not maintain authored copies, local instruction patches or full-prompt
overrides of canonical workflows. Generated artifacts are allowed only as disposable,
verified build outputs. Legacy names may be compatibility aliases, not separate skills.

## Delivery

For managed application consumers, use an immutable bundle and an automatically advanced
validated channel. Native plugin publication must refer to the same accepted canonical
source through each host's supported release/update mechanism:

1. A canonical change passes structural, contract and required behavioral checks.
2. Publication creates an immutable bundle containing the catalog, required assets,
   canonical revision, content hashes, contract versions and capability requirements.
3. Only successful publication advances the validated channel. Reading a moving source
   branch alone does not establish acceptance.
4. Registered consumers are automatically triggered to rebuild and run their integration
   checks. Scheduled reconciliation recovers missed events. Trigger configuration and
   credentials live with deployment configuration, never in portable skills.
5. Each build resolves one revision, verifies its assets, and uses it throughout tests and
   deployment. Record the revision; do not require a person to maintain a dependency pin.
6. Accepted builds roll out under each product's release policy. Record published, tested
   and deployed revisions so blocked or missed updates remain visible.

Resolution or verification failure fails the build. Never silently use an old cache or
local skill copy and report success. An existing deployment may keep serving its previously
accepted bundle while an update is blocked, but the revision gap and cause must be visible.
Set a consumer update-latency target and escalation policy when registering that consumer.

Normal operation uses the current validated channel. Explicit rollback and reproducibility
tests may select an older immutable revision and must label that choice.

## Discovery and compatibility

The canonical catalog supplies workflow identity, discovery metadata and asset references.
Consumers declare supported capabilities and contract versions. New compatible workflows
are discovered without adding another hard-coded instruction entry in each product.

Do not equate discovery with execution authority. A new workflow does not grant a product
a new permission, connector, shell-hook runtime or external side effect. Missing capabilities
must produce explicit unsupported status; an incompatible required workflow fails consumer
acceptance. Hooks and agents follow the same canonical ownership and delivery contract,
with host compatibility declared rather than assumed.

Chat and dedicated workflow pages must consume canonical definitions or canonical variants
for their respective output contracts. Product adapters may translate tool names and data
types, but must not duplicate domain instructions. Referenced assets must be available to
the actual runtime; copying only SKILL.md while omitting its dependencies is not compliant.

## Evidence and migration

Move useful existing downstream instruction changes and their regression cases into this
repository before deleting downstream copies. Review saved overrides: promote reusable
behavior here and retain company-specific facts as explicit inputs. Preserve old text as
history, not as a competing active source.

Canonical evaluations must assess output correctness, uncertainty, omissions, unsupported
claims and source evidence. Checking tool calls or grading an authored example is not
measured model accuracy. Products run canonical cases through their actual adapters and
retain additional integration tests. Private acceptance corpora stay with their owners.

The delivery implementation is complete only when tests demonstrate:

- A canonical instruction change reaches a consumer automatically with matching hashes.
- A newly added compatible workflow appears without a consumer source-code edit.
- Missing assets, incompatible contracts and failed behavior checks block acceptance visibly.
- A missed publication event is recovered by reconciliation.
- Saved overrides cannot silently replace canonical workflow instructions.
- An immutable revision is recorded for each deployed build and review result.
- An explicit rollback uses a previous canonical bundle without creating an editable fork.

This contract eliminates divergent authored copies and hidden propagation failures. It does
not promise that arbitrary future behavior changes are compatible with every product;
compatibility is established by the canonical and consumer checks.
