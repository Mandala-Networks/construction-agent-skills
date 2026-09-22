# Agent responsibilities and host contract

These four roles are draft instruction definitions, not deployed services.
Claude and Grok can discover the plugin roles; workspace exports also produce
Codex TOML and OpenCode/OpenWork subagent definitions. See
[platform evidence](../plugins/README.md) for tested discovery and remaining
native/model evaluation gates.

| Role | Skill responsibility | Trigger | Evaluation priority |
| --- | --- | --- | --- |
| document-controller | Readiness and drawing issue comparison | Authorized snapshot changed | Missing pages never become unchanged sheets |
| bid-reviewer | Requirements, trade leveling, and scope gaps | Bid/proposal revision changed, or a request to level the bids | Conflicts retained; silence is not exclusion; clarifies stay human decisions |
| material-analyst | Index interpretation | Observation changed or refresh failed | No invented prices; cadence-aware freshness |
| automation-steward | Run interpretation | Run finished or overdue event | Partial success and safe deduplication |

## Execution boundary

Keep schedulers, authorization, extraction, arithmetic, queue leases, retries,
retention, and writes in deterministic host code. Invoke a model only for an
ambiguous classification or sourced narrative with useful reviewer value. Do
not create one model call per successful cron tick. Reuse existing jobs.

The host supplies a tenant-scoped task ID, role and skill version, authorized
source references and revisions, bounded input, deadline/token budget, current
run state, and permitted output destination. Credentials stay in connectors.
Schedules, tenant IDs, recipient lists, prices, and model-provider configuration
belong in the consuming deployment, never this repository.

The host validates a structured draft before storing it. Record source versions,
model/version, run status, time/cost, and reviewer disposition in private audit
storage. Deduplicate using tenant + task type + source revision + skill version;
apply a lease so concurrent ticks cannot process the same task. Recheck grants
before reading and writing. Cancellation or revoked access stops processing.

Retry transient failures only under a bounded host policy. Ambiguous write
completion must be reconciled before retry. Contractual, safety, cost, schedule,
and external-message decisions stay with the authorized reviewer. Existing
explicit authorization should be honored without redundant approval prompts.

## Delivery sequence

1. Validate packaging and synthetic cases locally (this change).
2. Run blind model evaluations with positive, missing-data, conflicting,
   permission-denied, and prompt-injection cases. Compare with no-skill baselines.
3. Integrate read-only shadow runs into an existing host job. Measure grounded
   findings, false alerts, human correction, latency, and cost.
4. Enable draft delivery only after host authorization, deduplication, replay,
   revocation, and budget tests pass. Keep rollback to deterministic jobs.

Choose small classification models only after measured agreement and abstention
behavior justify them. Route uncertain cases to review; model confidence alone
is not evidence. No model or provider is required by the generic skills.
