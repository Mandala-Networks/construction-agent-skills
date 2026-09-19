---
name: csi-spec-router
description: >-
  Place a construction document, requirement, or question in the correct CSI MasterFormat
  division and section, and convert legacy 5-digit MasterFormat 1995 numbers to the current
  6-digit form. Use when asked "which spec section covers this", "what division is this",
  "where would this be specified", when a number like 03300 or 15000 or 16000 appears, when
  routing scope between trades, or when building a spec index from a project manual.
metadata:
  author: mandala-networks
  version: "0.1.0"
---

# CSI spec section router

Construction documents are addressed by number, not by topic. An agent that says "the concrete
specification" instead of `03 30 00` cannot be checked, cross-referenced, or handed to a
subcontractor. Two failures are common and both are avoidable: guessing a division from the
sound of a word, and reusing MasterFormat 1995 five-digit numbers that no current project
manual uses.

## Numbering

Current MasterFormat numbers are **six digits in three pairs**: `03 30 00`. Level 1 is the
division, Level 2 the section group, Level 3 the section. Write the spaces. `033000` and
`03-30-00` are not the format, and `Division 3` alone is not a reference.

MasterFormat 1995 used **five digits** with no spaces (`03300`, `15000`, `16000`). Those numbers
still appear in old drawings, legacy submittal logs, and reused front-end documents. When you
see one, convert it and say that you converted it. Never assume the digits map by padding —
several 1995 divisions were split.

| Legacy 1995 | Current | Note |
|---|---|---|
| `03300` Cast-in-Place Concrete | `03 30 00` | Direct |
| `04200` Unit Masonry | `04 20 00` | Direct |
| `05120` Structural Steel | `05 12 00` | Direct |
| `07500` Membrane Roofing | `07 50 00` | Direct |
| `08110` Steel Doors and Frames | `08 11 00` | Direct |
| `09900` Painting | `09 91 00` | Renumbered, not padded |
| `13850` Fire Detection | `28 31 00` | Moved to Division 28 |
| `15000` Mechanical | Divisions `21`, `22`, `23` | **Split** — do not map to one section |
| `16000` Electrical | Divisions `26`, `27`, `28` | **Split** — do not map to one section |

The Division 15 and 16 splits are the ones that cause real scope gaps. A "Division 16" scope
letter may cover power, communications, and security — three divisions and often three
subcontractors. Flag it for a human rather than picking one.

## Divisions

**Procurement and Contracting Requirements**
`00` Procurement and Contracting Requirements

**General Requirements**
`01` General Requirements

**Facility Construction**
`02` Existing Conditions · `03` Concrete · `04` Masonry · `05` Metals ·
`06` Wood, Plastics, and Composites · `07` Thermal and Moisture Protection · `08` Openings ·
`09` Finishes · `10` Specialties · `11` Equipment · `12` Furnishings ·
`13` Special Construction · `14` Conveying Equipment · `15`–`19` Reserved

**Facility Services**
`20` Reserved · `21` Fire Suppression · `22` Plumbing · `23` HVAC · `24` Reserved ·
`25` Integrated Automation · `26` Electrical · `27` Communications ·
`28` Electronic Safety and Security · `29` Reserved

**Site and Infrastructure**
`30` Reserved · `31` Earthwork · `32` Exterior Improvements · `33` Utilities ·
`34` Transportation · `35` Waterway and Marine Construction · `36`–`39` Reserved

**Process Equipment**
`40` Process Interconnections · `41` Material Processing and Handling Equipment ·
`42` Process Heating, Cooling, and Drying Equipment ·
`43` Process Gas and Liquid Handling, Purification, and Storage Equipment ·
`44` Pollution and Waste Control Equipment · `45` Industry-Specific Manufacturing Equipment ·
`46` Water and Wastewater Equipment · `47` Reserved · `48` Electrical Power Generation

A reserved division is not a place to file something. If the best fit is reserved, the item
belongs somewhere else or the project uses a custom division — say which.

## Front-end sections worth knowing by number

Division 00 carries the procurement and contracting documents, not the work.

`00 11 00` Advertisements and Invitations · `00 21 13` Instructions to Bidders ·
`00 41 00` Bid Forms · `00 43 13` Bid Bond Form · `00 52 00` Agreement Forms ·
`00 61 13` Performance and Payment Bond Forms · `00 72 00` General Conditions ·
`00 73 00` Supplementary Conditions · `00 91 13` Addenda

Division 01 governs how every other division is administered. Most process questions land here.

`01 10 00` Summary · `01 20 00` Price and Payment Procedures ·
`01 25 00` Substitution Procedures · `01 26 00` Contract Modification Procedures ·
`01 29 00` Payment Procedures · `01 30 00` Administrative Requirements ·
`01 31 00` Project Management and Coordination ·
`01 32 00` Construction Progress Documentation · `01 33 00` Submittal Procedures ·
`01 40 00` Quality Requirements · `01 50 00` Temporary Facilities and Controls ·
`01 60 00` Product Requirements · `01 70 00` Execution and Closeout Requirements ·
`01 77 00` Closeout Procedures · `01 78 00` Closeout Submittals ·
`01 79 00` Demonstration and Training

## Within a section

Sections follow SectionFormat's three parts. Cite the part when the distinction matters,
because it decides who is responsible.

- **Part 1 — General.** Scope, references, submittals, quality assurance, delivery, warranty.
- **Part 2 — Products.** Manufacturers, materials, fabrication, source quality control.
- **Part 3 — Execution.** Examination, preparation, installation, field quality control,
  protection.

A requirement in Part 2 binds the supplier. The same subject in Part 3 binds the installer.
Conflating them is how an installation requirement ends up in a material quote.

## Required behavior

1. Return a **six-digit number with spaces** and the section title whenever you can identify
   one. When you can only identify the division, say so and give the division number.
2. Never invent a Level 3 number to look precise. `03 30 00` you are sure of beats `03 31 13`
   you guessed.
3. When a legacy 5-digit number appears, give the current number **and** state the conversion.
   For `15000` and `16000`, list every current division the legacy scope spans.
4. When a subject legitimately appears in more than one section — firestopping in `07 84 00`
   and again in the electrical and mechanical divisions — list all of them. Multi-section
   subjects are where scope falls through.
5. When routing is genuinely ambiguous, return the candidates with what would settle it, not a
   confident single answer.
6. Cite the project manual's own table of contents when one was provided. A project that
   renumbers is authoritative over this reference.

## Output

```json
{
  "routings": [
    {
      "subject": "string",
      "division": "03",
      "section": "03 30 00",
      "sectionTitle": "Cast-in-Place Concrete",
      "part": "Part 3 — Execution",
      "confidence": "confirmed | inferred | ambiguous",
      "basis": "project manual table of contents, page 4 | MasterFormat reference",
      "legacyNumber": "03300",
      "alsoAppearsIn": ["03 15 00"]
    }
  ],
  "ambiguous": [{ "subject": "string", "candidates": ["..."], "resolvedBy": "string" }],
  "unresolvedQuestions": [{ "question": "string", "owner": "string" }]
}
```

## Boundaries

Routing is not scope assignment. Telling someone a requirement lives in `26 05 00` does not make
it the electrical subcontractor's cost. Do not assign scope, price a division, or issue a
clarification to bidders. A project engineer confirms the routing against the actual project
manual.
