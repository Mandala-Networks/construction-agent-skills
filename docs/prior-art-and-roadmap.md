# Prior art and roadmap

## Why this library is small on purpose

There are large public collections of construction skills. They are worth reading and worth
borrowing from, and they are not what this repository is trying to be.

- [datadrivenconstruction/DDC_Skills_for_AI_Agents_in_Construction](https://github.com/datadrivenconstruction/DDC_Skills_for_AI_Agents_in_Construction)
  — 200+ skills across BIM analysis, CAD conversion, cost estimation, scheduling, document
  control, and ERP integration. Broad coverage; largely code-generation recipes (pandas,
  ifcopenshell, pdfplumber) rather than behavioral constraints. MIT, with the CWICR database
  under CC BY-NC 4.0.
- [dleerdefi/claude-code-construction](https://github.com/dleerdefi/claude-code-construction)
  — eight practical GC-side skills: sheet and spec splitting, schedule extraction, submittal
  log generation, bid tabulation and evaluation, code research, subcontract drafting. Ships an
  `evals/` harness. MIT.
- [AlpacaLabsLLC/skills-for-architects](https://github.com/AlpacaLabsLLC/skills-for-architects)
  — a local-first framework for firms to build and govern their own AEC workflows, with bundled
  skills as reference implementations.

Coverage is cheap and correctness is not. A 200-skill catalog also costs real context budget on
every host, and on Codex that budget is shared across every installed plugin. This library
admits a skill only when it changes what the model does — see the admission test in
`CONTRIBUTING.md` — and pairs each with a benchmark that proves it.

The document-splitting and format-conversion skills in those repositories are genuinely useful
and complementary. Install them alongside this one rather than reimplementing them here.

## Optimization: where genetic algorithms actually belong

Evolutionary methods are well established in AEC for structural and topology optimization,
generative building form, truss design, resource-constrained scheduling, multi-year
infrastructure maintenance, and cost-weight-carbon trade-offs. Representative open source:

| Repository | Domain |
|---|---|
| [f0uriest/GASTOp](https://github.com/f0uriest/GASTOp) | GA for structural design and topology optimization |
| [gigatskhondia/gigala](https://github.com/gigatskhondia/gigala) | 2D/3D topology optimization combining FEA, RL, and GA |
| [SaaadRaaa/Truss-Optimization](https://github.com/SaaadRaaa/Truss-Optimization) | Truss strength-versus-weight optimization |
| [Tahernezhad/Cartesian-Genetic-Programming-for-Truss-Optimization](https://github.com/Tahernezhad/Cartesian-Genetic-Programming-for-Truss-Optimization) | Cartesian genetic programming for 2D truss topology |
| [ritchie46/computer-build-me-a-bridge](https://github.com/ritchie46/computer-build-me-a-bridge) | Genetic and evolution strategies over structural configurations |
| [EverseDevelopment/GeneticSharp.Building](https://github.com/EverseDevelopment/GeneticSharp.Building) | 3D building generation under height and cost constraints |
| [renatogcruz/generative_design](https://github.com/renatogcruz/generative_design) | Parametric modeling plus GA for steel structures |
| [amirkfard/EnhancedGA](https://github.com/amirkfard/EnhancedGA) | Multi-year infrastructure maintenance and rehabilitation |
| [giacomelli/GeneticSharp](https://github.com/giacomelli/GeneticSharp) | The underlying C# GA library several of the above build on |

Only one of those domains is a *staple* — something most construction teams touch most weeks.
Structural topology optimization is specialist design work; resource-constrained scheduling and
time-cost trade-off are ordinary project controls. That is why `schedule-optimization` is in the
library and a structural GA skill is not.

`schedule-optimization` encodes the part a model gets wrong without help: naming which of four
problems it is actually solving, using the analytic cost-slope method for crashing instead of
reaching for a metaheuristic, choosing an activity-list plus serial-SGS encoding that is
precedence-feasible by construction rather than a penalty function, returning a Pareto front
instead of a weighted single answer, and refusing to compress cure times and procurement lead
times. PSPLIB (`j30`/`j60`/`j120`) is the reference set for validating any optimizer before its
numbers are quoted on a real project.

## Roadmap

Candidates, in rough order of how often a team hits them.

**Next up**

- `change-order-review` — pricing structure, markup stacking against the contract, entitlement
  versus quantum kept separate, time impact stated or absent.
- `daily-report-normalizer` — manpower, equipment, weather, delays, and visitors into a
  consistent record; the substrate for a delay claim, so unrecorded is never zero.
- `punchlist-normalizer` — deduplicate across walkthroughs, route by responsible trade, keep
  open items distinct from disputed items.

**Fixtures needed before the existing specifications become benchmark-ready**

- `submittal-register` — a synthetic multi-division project manual.
- `drawing-revision-change-log` — paired synthetic vector and raster drawing sets. The raster
  pair matters most; degradation on scans is the real failure mode.
- `csi-spec-router` — a routing set with legacy 5-digit numbers and multi-section subjects.
- `safety-jha` — task fixtures whose correct answer requires an engineering control, to catch
  PPE-first answers.
- `quantity-takeoff-audit` — a takeoff with a seeded `SQ`/`SF` mismatch and a doubly applied
  waste factor.
- `schedule-optimization` — a PSPLIB `j30` instance with a known optimum.

**Deliberately out of scope**

Anything that submits, prices, certifies, approves, or interprets a contract. The library
prepares those decisions and hands them to a named person. That boundary is the product.
