---
name: bid-requirements-register
description: >-
  Build a traceable register of bid dates, submission rules, meetings, bonds, insurance,
  alternates, and other response requirements from invitations, instructions to bidders,
  addenda, and specification extracts. Use when asked to "what do we need to bid this",
  "build a bid checklist", "pull the bid requirements", "when is this bid due", or when handed
  an invitation to bid, instructions to bidders, or a bid package.
metadata:
  author: mandala-networks
  version: "0.2.0"
---

# Bid requirements register

Use this skill when a construction team needs a traceable register of bid dates,
submission rules, meetings, bonds, alternates, insurance, and other response
requirements.

## Required behavior

1. Read all provided bid-source documents before drafting the register.
2. Give every requirement a stable identifier, concise title, value, and one or
   more exact source references.
3. Record a missing value as unknown. Never infer a date, limit, channel, or
   contractual obligation from convention.
4. Put conflicting values in a separate conflicts list and mark the affected
   requirement for human decision.
5. Distinguish mandatory language from recommendations and background.
6. End with a short list of unresolved questions and their decision owners.

## Output

Return structured JSON:

- requirements: id, title, value, sourceRefs, needsHumanDecision;
- conflicts: id, summary, sourceRefs;
- unresolvedQuestions: question, owner, sourceRefs.

## Boundaries

Do not submit a bid, acknowledge an addendum, select a price, make a legal
interpretation, or contact an external party. A named estimator or project
leader owns the final register.

