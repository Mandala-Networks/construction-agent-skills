---
name: safety-jha
description: >-
  Break a construction task into steps, identify the hazard in each, and propose controls ranked
  by the hierarchy of controls with the governing OSHA 1926 reference. Use when asked for a
  "JHA", "JSA", "job hazard analysis", "activity hazard analysis", "pre-task plan", "what are
  the hazards for this work", or when planning excavation, steel erection, scaffolding, hot
  work, confined space, or crane activity.
metadata:
  author: mandala-networks
  version: "0.1.0"
---

# Job hazard analysis

The default failure is reaching for personal protective equipment first. PPE is the **last**
control, because it protects one person, only while worn correctly, and it does nothing to the
hazard itself. A JHA whose controls are a list of PPE has not analyzed anything.

## Hierarchy of controls

Work down the list. For every hazard, say what you considered at each level above the one you
landed on and why it was rejected. "Elimination not feasible" with no reason is not an analysis.

1. **Elimination** — remove the hazard. Prefabricate at grade instead of at height. Route the
   utility around the excavation.
2. **Substitution** — a less hazardous method or material. Cold cutting instead of hot work.
3. **Engineering controls** — isolate people from the hazard. Trench shield, guardrail,
   local exhaust ventilation, tool-integrated dust collection, machine guarding.
4. **Administrative controls** — change how people work. Permits, exclusion zones, sequencing,
   competent person inspections, training, rotation.
5. **PPE** — last. Name the specific equipment and its standard, not "appropriate PPE".

## OSHA 29 CFR 1926 subparts

Cite the subpart, and the section when you are sure of it. Never invent a section number to
appear precise — a wrong citation is worse than a subpart-level one.

`C` General safety and health · `D` Occupational health and environmental controls ·
`E` Personal protective and life saving equipment · `F` Fire protection and prevention ·
`G` Signs, signals, and barricades · `H` Materials handling and storage ·
`I` Tools, hand and power · `J` Welding and cutting · `K` Electrical · `L` Scaffolds ·
`M` Fall protection · `N` Cranes, derricks, hoists, elevators, conveyors ·
`O` Motor vehicles and mechanized equipment · `P` Excavations ·
`Q` Concrete and masonry construction · `R` Steel erection ·
`S` Underground construction, caissons, cofferdams, compressed air · `T` Demolition ·
`U` Blasting and explosives · `V` Electric power transmission and distribution ·
`W` Rollover protective structures · `X` Stairways and ladders · `Y` Diving ·
`Z` Toxic and hazardous substances · `AA` Confined spaces in construction ·
`CC` Cranes and derricks in construction

## Thresholds that decide the control

These are the numbers that change what is required, and they are the ones most often
misremembered. Note that the fall protection trigger is not one number.

- **Fall protection, general construction:** 6 ft to a lower level — `1926.501(b)(1)`.
- **Scaffolds:** 10 ft — `1926.451(g)(1)`.
- **Steel erection:** 15 ft — `1926.760`; connectors between 15 and 30 ft have specific
  provisions.
- **Excavation protective system:** 5 ft depth unless in stable rock — `1926.652(a)(1)`. A
  competent person may require protection at less than 5 ft. Systems deeper than 20 ft must be
  designed by a registered professional engineer.
- **Excavation egress:** ladder, ramp, or stair within 25 ft of lateral travel in trenches 4 ft
  or deeper — `1926.651(c)(2)`.
- **Excavation atmosphere:** test where a hazardous atmosphere could reasonably exist in
  excavations deeper than 4 ft — `1926.651(g)`.
- **Spoil and equipment:** kept at least 2 ft from the excavation edge — `1926.651(j)(2)`.
- **Daily inspection:** by a competent person before each shift and after any rain or changed
  condition — `1926.651(k)`.
- **Respirable crystalline silica:** PEL 50 µg/m³ as an 8-hour TWA, action level 25 µg/m³;
  Table 1 in `1926.1153` lists tasks with specified controls that satisfy the standard.
- **Permit-required confined space:** entry program under `1926.1203`; construction confined
  space rules are Subpart AA, not the general industry standard.
- **Crane assembly, operation, and power line clearance:** Subpart CC, `1926.1400` onward.

**Focus Four.** OSHA's four leading causes of construction fatalities are falls, struck-by,
caught-in/between, and electrocution. Every JHA should show that each of the four was
considered for the task, even if only to record that it does not apply.

## Competent person

Many controls are legally valid only when a **competent person** — someone capable of
identifying the hazard *and* authorized to correct it — performs them. Excavations,
scaffolds, fall protection, and confined space each require one. Name the role in the JHA. A
JHA cannot appoint a competent person; a project can.

## Required behavior

1. Break the task into sequential steps first. Hazards attach to steps, not to the task as a
   whole.
2. For every hazard, propose controls at the highest feasible level, and record what was
   considered and rejected above it.
3. Never list PPE as the only control for a hazard that has an engineering control.
4. Cite the subpart, and a section only when you are confident. Mark a citation you are unsure
   of as `subpart-level`.
5. Identify each required competent person by role and the activity that requires one.
6. Name the required permits and pre-task conditions: hot work, confined space entry, energized
   work, excavation, lift plan, lockout/tagout.
7. Record what you could not assess — soil classification, utility locations, atmospheric
   conditions, equipment condition — as a field verification item, never as an assumption.
8. State that this is a planning document requiring competent-person review and site
   verification before work begins.

## Output

```json
{
  "task": "string",
  "location": "string",
  "steps": [
    {
      "sequence": 1,
      "step": "string",
      "hazards": [
        {
          "hazard": "string",
          "focusFour": "caught-in/between",
          "controls": [
            {
              "level": "engineering",
              "control": "trench shield rated for the classified soil",
              "reference": "1926.652(c)",
              "referenceConfidence": "section"
            }
          ],
          "higherLevelsRejected": [
            { "level": "elimination", "reason": "utility tie-in must occur in place" }
          ],
          "competentPersonRequired": "excavation competent person"
        }
      ]
    }
  ],
  "permitsRequired": ["excavation permit", "utility locate ticket"],
  "fieldVerification": [
    { "item": "soil classification", "owner": "excavation competent person" }
  ],
  "focusFourConsidered": {
    "falls": "applies",
    "struckBy": "applies",
    "caughtInBetween": "applies",
    "electrocution": "applies - underground utilities present"
  },
  "unresolvedQuestions": [{ "question": "string", "owner": "string" }]
}
```

## Boundaries

Do not declare a task, a condition, or a site safe. Do not classify soil, certify equipment,
approve a lift plan, authorize a confined space entry, or sign a permit. Do not state that a
plan achieves regulatory compliance — that determination belongs to the competent person and
the site safety manager. This document supports a pre-task briefing; it does not replace one.
