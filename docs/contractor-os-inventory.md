# Contractor OS: reconstructed skill inventory

Competitive analysis of the largest commercial construction skill library, assembled **entirely
from the vendor's own public YouTube channel**. No paywalled material was accessed.

## The source

| | |
|---|---|
| Author | Tim Fairley — 10 years construction estimating and contract management |
| Channel | [@ConstructIQ](https://www.youtube.com/@ConstructIQ) — 48.4k subscribers, 393 videos |
| Product | Contractor OS, a Skool community — $97/month, rising to $149, 594 members |
| Claim | "One-click install. 93 construction workflows bundled." Video title says 95. |
| Anchor video | [I've Built 95 Claude Skills for Construction — Here Are the 8 Best](https://www.youtube.com/watch?v=G7vndKEihP0) (11 Jul 2026, 10.2k views) |

The library is sold as a bundle with 1-on-1 coaching and weekly workshops. The skills are the
hook; the coaching is the product.

## He published the generator

The inventory did not need to be guessed at. In *The AI Operating System for Construction* he
states the taxonomy the whole catalogue is built from — **11 domains**, each mapped step by step
into a workflow, with one skill per step:

1. Pre-construction and estimating
2. Procurement
3. Head contract management
4. Subcontract management
5. Project controls
6. Scheduling
7. Cost tracking and financial
8. Document control and design management
9. Quality and completions
10. Safety, environmental and compliance
11. Business-level systems

Eleven domains at eight to ten steps each is ninety-odd skills. That is the entire catalogue's
construction rule, stated on camera. Everything below is that framework populated from skills he
demonstrates by name across eleven transcribed videos.

## Reconstructed inventory

Roughly 64 of the ~95 are identifiable by name and function from public video alone.

### Pre-construction and estimating

| Skill | What it does |
|---|---|
| `project-indexer` | Converts all project documents into a `0.ai-context/` folder of markdown mirrors, plus `claude.md`/`agents.md`, `project.md`, `memory.md`, `drawings.md` |
| `drawing-analyzer` | Splits drawings, renders images, extracts vector data by script, writes a per-sheet markdown summary, builds a structured element database |
| `requirements-register` | Extracts every **product** requirement (what is built) and **process** requirement (how it is delivered) from the bid documents |
| `conceptual-estimate` | Matches scope activities to a historic cost library, returns a budget price with per-line confidence bands, exports Excel |
| `go-no-go` | Executive summary, inclusions and exclusions, commercial terms, unusual scope, top risks, proceed recommendation against business strategy |
| `clarifications-register` | Finds contradictions and unanswerable requirements, drafts the pre-bid query list |
| `assembly` | Customizes the estimator's own template assembly library to the project's actual products, formatted for takeoff-software import |
| `construction-takeoff` | Three stages: what is countable and at what confidence, count via text tags, mark up the PDF for audit |
| `line-by-line-estimating` | Populates the client's pricing schedule from takeoff plus assemblies, with confidence scores |
| `tender-schedule` | Estimates duration from man-hours or historic durations — drives time-related overheads |
| `reconciliation-check` | Three layers of pre-submission checks on the completed estimate |
| `cash-flow-forecaster` | Schedule plus payment terms plus labour/plant/material/subcontract split, solving for maximum deficit |

### Procurement

`procurement-packaging` (head contract requirements plus templates into a trade package
register) · per-package `scope-of-works` drafting with discipline examples nested in the skill ·
per-package `pricing-schedule` · `bid-levelling` for subcontractor quotes against their own
departures

### Head contract management

`departures-register` (client contract against the company's standard terms, clause by clause,
with bid-back positions) · `scope-departures-register` · `contract-obligations-register`
(setup / business-as-usual / event-driven / closeout tasks) · `payment-claim` ·
`progress-report` · `correspondence-sweep` (scan the register, flag new variations) ·
`contract-notice` (nested templates: extension of time, intention to claim, practical
completion, site access delay, variation for additional works) · `variation-register` with cost
and time entitlement · `contract-review`

### Subcontract management

`subcontractor-obligations` (plain-language scope summary for supervisors) ·
`pre-mobilisation-checklist` · `subcontract-performance-check` (baseline versus actual) ·
`subcontract-payment-claim-assessment` (assessed percentage, uncertain lines flagged) ·
`subcontract-variation-assessment` (grounds and reasonableness, then draft the upstream head
contract notice) · `subcontract-notice` and notice register · `subcontract-final-account` ·
`lessons-learned-register`

### Project controls

`wbs-generator` (design / procurement / installation / commissioning breakdown from estimate,
schedule, quality requirements, scope and head contract) · `site-diary-update` (voice note to
structured database) · `forecast` (cost code by cost code) · root-cause deep dive ·
`client-report` · `cost-tracker` (accounting data to cost codes) · live dashboard artifact

### Quality and completions

`qms-plan` · `lot-register` / `itp-register` (match the ITP template library to project scope) ·
`itp-builder` · `itc-builder` (field check sheets) · `completions-register` (contract process
requirements and their evidence) · `submittals-register` · `quality-audit` (plan against actual
implementation) · `lot-summary` for handover · defects closeout

### Document control and autonomous routines

Eight scheduled routines: `email-manager` (project inbox to a categorized correspondence
register with a commercially-significant flag) · `crm-update` · `cost-tracker` ·
`project-context-refresh` · `payment-claim` · `weekly-progress-report` · `weather-log` against
the contract's inclement weather threshold · `document-controller` (revision checking and
register sync)

### Not yet identified

Roughly thirty, concentrated in **safety, environmental and compliance** (SWMS, incident
reporting, toolbox talks, environmental monitoring), **design management**, and the deeper
procurement set. The taxonomy above says where they sit even where the names are unknown.

## What is actually worth taking

The skill list is the least valuable thing here. Skill names and topic coverage are not
protectable and are mostly obvious to anyone who has run a project. Four architectural ideas are
worth more than the catalogue:

**1. The context-conversion primitive.** `project-indexer` plus `drawing-analyzer` run once and
convert the project into small markdown files under `0.ai-context/`, with a `claude.md` naming
where everything lives and which sources are live rather than mirrored. Every later skill reads
that instead of a 25 MB PDF set. His framing is exact: these harnesses were built for code, so
the unit of retrieval is the file, and a 500-page drawing set is not a file. **This is the
load-bearing primitive under all 95 skills and the biggest single gap in our library.**

He also names its failure mode, which is the part most people would miss: a mirror goes stale.
Only static documents (contract, scope, specifications) belong in the mirror. Live registers —
variations, RFIs — must be read from source, and `claude.md` has to say which is which.

**2. The requirements register as the spine.** Splitting bid requirements into **product** (what
we build) and **process** (how we must deliver) and using the result as the pre-submission
checklist. His argument for it is the strongest commercial case in the whole channel: money is
not lost mispricing known scope, it is lost on the odd requirement buried on page 50 that the
client produces later. Our `bid-requirements-register` covers part of this and does not make the
product/process split.

**3. Progressive disclosure carrying the user's templates.** A skill bundles the output template
and per-discipline examples — electrical, mechanical, civil — and loads only the one it needs.
The skill emits the customer's format, not a generic one. Our skills define output shapes but
ship no templates.

**4. Step decomposition as a reliability argument.** He does the arithmetic on camera: at 98%
per step, ten steps is 80% and twenty steps is 60%. So the workflow is broken into small skills
with a human check between them. This is the same conclusion our library reached from the
benchmarking side, arrived at from a different direction.

## How this differs from what we are building

His skills are **template-and-data-shaped**: thin instruction files whose value comes from the
customer's own historic cost library, standard terms, assembly library, and ITP templates. He
says so directly — the conceptual estimate "isn't so much about the skill, this is almost more
about how good your data is behind it." That is his moat and his weakness. Without the
customer's data the skills do comparatively little, which is why the product is sold with
coaching.

Ours are **correctness-shaped**: they encode what an unassisted model gets wrong and prove it
against a benchmark. Nothing in his library is benchmarked; there is no measurement layer at
all, and the quality bar is "run it and be insanely critical of the output."

The two are complementary rather than competing. His decomposition is better than ours — eleven
domains fully mapped against our eleven skills. Our per-skill rigour is better than his. The
opportunity is his coverage with our verification.

## Position on the paid library

Buying a $97 subscription to read the library is ordinary competitive research and worth doing —
mainly to see the workflow-mapping templates and confirm the domains above. What comes back from
that is **reference, not source material**: skill names, domain coverage, and workflow structure
are free to use, and the prompt text is his copyrighted expression. Copying SKILL.md bodies into
this repository would be infringement and would wreck the licensing story for a library we
intend to publish. Everything in this document was reconstructed from public video precisely so
that no such question arises.

## Sources

Eleven transcripts pulled from the public channel. Highest yield:

- [I've Built 95 Claude Skills for Construction — Here Are the 8 Best](https://www.youtube.com/watch?v=G7vndKEihP0)
- [8 Claude Skills for Construction Estimating (Tender Docs → Submitted Price)](https://www.youtube.com/watch?v=-m-8kBLrdFI)
- [I Turned Claude Into an Operating System for Construction Projects](https://www.youtube.com/watch?v=X0P7ZuvGLa4) — the 11 domains
- [How to Manage Construction Contracts with Claude AI — Award to Final Account](https://www.youtube.com/watch?v=_rmpKkQMcv8)
- [I Built an AI Subcontractor Management System for Construction](https://www.youtube.com/watch?v=04Vw2WqI2dE)
- [I Built an AI Construction Quality System (ITPs, ITCs & Handover)](https://www.youtube.com/watch?v=T6Dllr4JEss)
- [I Built an AI Project Controls System for Construction](https://www.youtube.com/watch?v=4qCbJ1WBenU)
- [I Built 8 Autonomous Construction Routines with Claude](https://www.youtube.com/watch?v=Lif1JRdnfko)

Transcripts were pulled to a scratch directory for analysis and deliberately not committed —
they are his content, and mirroring them in a repository we intend to publish would republish
them.
