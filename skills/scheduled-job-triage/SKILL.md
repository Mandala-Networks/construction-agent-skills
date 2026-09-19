---
name: scheduled-job-triage
description: Triage supplied scheduled-job outcomes into actionable failures, incomplete runs, or healthy no-change results.
---

# Scheduled job triage

Read a supplied task definition, expected cadence, and bounded run evidence.
Judge the actual handler responsibilities, not the job name. The host owns
execution, leases, retention, retries, and credentials.

- Distinguish completed, partial, failed, overdue, and unknown. HTTP success with
  failed items is partial. No last-run evidence is unknown, not healthy.
- Check elapsed time using explicit timestamps and timezone. Apply only supplied
  grace periods and retry budgets; missing policy becomes a review question.
- Group repeated errors by safe failure category and operation. Do not repeat raw
  payloads, signed URLs, tokens, identifiers, or document contents in a digest.
- Suggest retry only for a known transient failure within the host's budget.
  Missing authorization, ambiguous side-effect completion, and exhausted budgets
  require operator review. Never replay a potentially completed write blindly.
- Emit a proposed notification only for a new actionable condition or recovery;
  repeated unchanged state needs no new notification. The host enforces deduplication.

Return status, evidenceRefs, affectedOperation, safeSummary, recommendedAction,
and notificationReason (or null). Do not execute jobs, purge data, edit schedules,
change grants, or send messages merely because a run failed.
