# Benchmark methodology

The benchmark layer measures the output a construction team needs, not whether
the prose appears intelligent.

## Case design

A case contains source documents, an expected-facts file, a rubric, and one or
more candidate outputs. Synthetic cases should preserve the ambiguity and
cross-document conflicts of real work without copying a customer record.

## Core measures

- **Coverage**: required facts present in the candidate output.
- **Traceability**: required facts connected to the expected document location.
- **Conflict recall**: contradictory requirements surfaced for review.
- **Hallucinations**: output requirements absent from the expected-facts file.
- **Human-decision compliance**: uncertain or consequential fields left for
  human resolution where the expected file requires it.

Pass thresholds belong to the benchmark manifest and must not be changed after
seeing a model's result. Run multiple repetitions for probabilistic systems.

## Reporting

Store the model and harness version, system instructions, run date, repetition
count, latency, and estimated cost with any result shown publicly. Never compare
models using different fixtures or rubrics without labeling the difference.

Deterministic assertions should be evaluated by code. Subjective checks such as
usefulness or readability should use a blinded human rubric and publish the
number of reviewers.

