---
name: rfi-drafting
description: >-
  Draft a request for information that asks a single answerable question with its contract
  references, proposed resolutions, and impact flags. Use when asked to "write an RFI", "draft
  an RFI", "we need a clarification from the architect", when a field condition conflicts with
  the drawings, or when a document is ambiguous and someone wants the answer written down.
metadata:
  author: mandala-networks
  version: "0.1.0"
---

# RFI drafting

The failure mode this skill exists to prevent is answering the question. Asked about a conflict
between a structural detail and a mechanical routing, the reflex is to reason out the likely
intent and present it as a resolution. That reasoning is not worthless — it belongs in the
proposed-resolution field, clearly labeled as the contractor's proposal. It is not the answer,
and presenting it as one transfers design liability to the contractor for free.

**You are drafting a question, not resolving a condition.** Every RFI leaves the deciding to
the design team.

## Before drafting, try not to need one

An RFI that the contract documents already answer is returned as "refer to" and costs the
project a review cycle and credibility. Search first and record where you looked.

1. The specification section and its referenced standards.
2. The drawings, including the general notes, typical details, and the schedules.
3. Issued addenda and previously answered RFIs — the same question is often already answered.
4. The precedence clause in the general or supplementary conditions, which states what governs
   when documents disagree.

If the documents do answer it, say so with the citation and do not draft the RFI.

## An RFI is not three other things

Sending the wrong instrument delays the answer and can waive a claim.

| The situation | The right instrument |
|---|---|
| The documents are unclear, incomplete, or conflicting | **RFI** |
| You want to use a different product than specified | Substitution request, `01 25 00` |
| You want to change scope, price, or time | Change proposal / change order request, `01 26 00` |
| You are documenting a condition for the record | Field report or notice, per general conditions |

An RFI that proposes a cost-bearing change is a change request wearing an RFI's clothes.
Reviewers treat it as one, and the schedule impact is not preserved. Split it.

## One question per RFI

Bundling three questions produces one partial answer and two forgotten ones. When a condition
raises several questions, draft several RFIs and cross-reference them.

## Required content

- **Subject** — specific enough to be found later. "Beam penetration conflict at Grid C-4,
  Level 3" not "Structural question".
- **Location** — grid, level, room number, station, or sheet and detail.
- **References** — the drawing sheets, details, and specification paragraphs that create the
  ambiguity. Both sides of a conflict, cited exactly.
- **Description of condition** — what is observed or read, stated as fact. Photographs and
  markups attached and named.
- **The question** — a single interrogative sentence that can be answered.
- **Proposed resolution** — one or more options with the contractor's recommendation, labeled
  as a proposal. Include what each option would require.
- **Cost impact** — `yes`, `no`, or `to be determined`. Never `no` unless you know. An
  unqualified `no` can waive the claim.
- **Schedule impact** — same three values, with the affected activity and its float when the
  schedule was provided. Never state a float value that was not in the schedule.
- **Response required by** — derived backward from the installation or procurement date. State
  the driving activity and the derivation. If you cannot derive it, mark `unknown` and name who
  supplies it; do not put a placeholder date.
- **Discipline and suggested responder** — architectural, structural, mechanical, electrical,
  civil.

## Required behavior

1. Never provide the answer as the answer. Design intent, code interpretation, and dimensional
   resolution belong to the design team.
2. Never state `cost impact: no` or `schedule impact: no` by default. Absent information is
   `to be determined`.
3. Cite both sides of every conflict with exact locations.
4. Do not invent an RFI number, a project number, or a response date. Mark them `unknown` and
   name the owner.
5. Keep the description factual and neutral. An RFI is a project record that may be read in a
   dispute; characterizing another party's work as an error is a claim, not a question.
6. When the answer might be a change, say so plainly in the transmittal and prepare the change
   request separately rather than burying the cost in the RFI.

## Output

```json
{
  "rfi": {
    "number": "unknown",
    "subject": "string",
    "discipline": "structural",
    "suggestedResponder": "structural engineer of record",
    "location": "string",
    "references": [
      { "type": "drawing", "ref": "S-301, detail 5" },
      { "type": "specification", "ref": "05 12 00, ¶3.4.C" }
    ],
    "conditionDescription": "string",
    "question": "string",
    "proposedResolutions": [
      { "option": "A", "description": "string", "recommended": true, "requires": "string" }
    ],
    "costImpact": "to be determined",
    "scheduleImpact": "to be determined",
    "affectedActivity": "string | unknown",
    "affectedActivityFloat": "unknown",
    "responseRequiredBy": "unknown",
    "responseDateDerivation": "string | unknown",
    "attachments": ["string"]
  },
  "documentsSearched": [{ "ref": "string", "result": "does not address the condition" }],
  "alreadyAnswered": false,
  "shouldBeDifferentInstrument": null,
  "relatedRfis": ["string"],
  "unresolvedQuestions": [{ "question": "string", "owner": "string" }]
}
```

## Boundaries

Do not transmit the RFI, assign it a number in a live log, contact the design team, accept a
verbal response as an answer, or proceed with work on the strength of a proposed resolution. A
project manager reviews and issues. Only the responding design professional's written answer
resolves the condition.
