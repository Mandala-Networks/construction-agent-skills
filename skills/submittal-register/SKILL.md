---
name: submittal-register
description: >-
  Build a submittal log from a project manual by extracting every submittal a specification
  section requires, classified by type with its governing section reference. Use when asked to
  "create a submittal log", "build a submittal register", "what submittals are required",
  "extract submittals from the specs", or when preparing a submittal schedule under Section
  01 33 00.
metadata:
  author: mandala-networks
  version: "0.1.0"
---

# Submittal register

A submittal log is built by reading, not by pattern matching on the word "submit". Sections
require submittals in Part 1 (Submittals article), again in Part 2 (source quality control),
and again in Part 3 (field quality control and closeout). A log built from Part 1 alone misses
the test reports and the warranties, which is exactly the material that holds up substantial
completion.

## Classification is the whole job

Section `01 33 00` distinguishes three families, and they have different review consequences.
Collapsing them is the most expensive error in this workflow, because an action submittal that
is logged as informational never gets returned and the work proceeds unapproved.

**Action submittals** — reviewed and returned with an action stamp. Work may not proceed on the
affected item until returned.

- Product data — manufacturer literature, catalog cuts, performance data
- Shop drawings — fabrication and installation drawings prepared for this project
- Samples — physical samples for verification, or for selection of color/finish/pattern

Samples split further. *Samples for selection* must be submitted early enough for the architect
to make a choice that then drives fabrication. *Samples for verification* confirm a decision
already made. A log that does not separate them will schedule selection samples too late.

**Informational submittals** — reviewed for compliance, not returned with an action stamp.
Work is not held, but a missing one is still a contract breach.

- Qualification data (installer, fabricator, testing agency)
- Certificates: product, material, welding, compliance, source
- Test and evaluation reports, source and field
- Manufacturer's instructions and field reports
- Delegated design submittals
- Sustainable design / LEED documentation
- Preconstruction test reports, mockup reports

**Closeout submittals** — Section `01 78 00`. Due at substantial completion or as specified.

- Operation and maintenance data
- Warranties, guarantees, and bonds
- Record drawings and specifications
- Demonstration and training records (`01 79 00`)
- Spare parts, extra stock, maintenance materials, special tools

## Three things a correct log carries that a naive one does not

**Delegated design.** A delegated design submittal transfers engineering responsibility to the
contractor's engineer and requires a professional engineer's seal from an engineer licensed in
the project jurisdiction. Common on cold-formed framing, precast, curtain wall, fire sprinkler,
steel connections, and stair and rail systems. Flag every one — the licensure and insurance
implications are a decision a person makes, not a log entry.

**Long lead.** Items whose fabrication or delivery drives the schedule must be identified in the
log with their required-on-site date, not just a submittal date. If a submittal date is not
tied backward from an installation date through review time plus fabrication plus delivery, the
log is decorative. Where the specifications do not state the lead time, mark it `unknown` and
name who must supply it. Never estimate a lead time.

**Review duration.** Section `01 33 00` states the review period — commonly 15 days, but read
it, do not assume. Resubmittals typically get the same period again. Sequential submittals
(product data before shop drawings before samples) stack these periods. Record the stated
period and its source; if the section is silent, mark it `unknown`.

## Required behavior

1. Read every specification section. Report the sections you could not read as a coverage gap
   with the reason — a log silently missing Division 23 is worse than no log.
2. Extract from all three parts of each section, not the Submittals article alone.
3. Classify each item as action, informational, or closeout, and give the specific type. Never
   merge product data, shop drawings, and samples into one row.
4. Cite the section number and the article or paragraph for every entry. `09 91 00, ¶1.3.B`.
5. Record the contractor's review-and-stamp obligation where the section imposes one. A
   submittal forwarded without contractor review is typically returned unreviewed.
6. Flag delegated design submittals and the seal requirement separately.
7. Where a section requires a submittal but the project manual sets no quantity, format,
   copies, or portal, record `unknown` with the section you checked. Do not supply a default.
8. Note where an addendum added, deleted, or modified a submittal requirement, with the
   addendum number.

## Output

```json
{
  "submittals": [
    {
      "id": "23-05-93-001",
      "specSection": "23 05 93",
      "specSectionTitle": "Testing, Adjusting, and Balancing for HVAC",
      "sourceRefs": ["23 05 93, ¶1.3.A"],
      "family": "informational",
      "type": "test and evaluation report",
      "title": "TAB report",
      "delegatedDesign": false,
      "sealRequired": false,
      "reviewPeriodDays": 15,
      "reviewPeriodSource": "01 33 00, ¶1.5.A",
      "longLead": false,
      "requiredOnSite": "unknown",
      "contractorReviewRequired": true,
      "needsHumanDecision": false
    }
  ],
  "coverageGaps": [
    { "specSection": "26 00 00", "reason": "scanned image, text not extractable" }
  ],
  "conflicts": [{ "summary": "string", "sourceRefs": ["..."] }],
  "unresolvedQuestions": [
    { "question": "string", "owner": "string", "sourceRefs": ["..."] }
  ]
}
```

## Boundaries

Do not submit, transmit, approve, reject, or stamp a submittal. Do not set a submittal date
that has not been derived from a stated installation date and stated durations. Do not decide
whether a delegated design engineer is qualified. The project engineer owns the log and the
architect owns the review.
