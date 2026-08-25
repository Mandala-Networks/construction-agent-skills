import { describe, expect, test } from "bun:test";
import benchmark from "../benchmarks/bid-requirements-register/benchmark.json";
import candidate from "../benchmarks/bid-requirements-register/cases/case-001/candidate.example.json";
import expected from "../benchmarks/bid-requirements-register/cases/case-001/expected.json";
import { evaluateCandidate } from "../scripts/validate-benchmark.ts";

describe("bid requirements benchmark", () => {
  test("the inspectable example passes every threshold", () => {
    const result = evaluateCandidate(benchmark, expected, candidate);
    expect(result).toMatchObject({
      metrics: {
        conflictRecall: 1,
        coverage: 1,
        hallucinations: 0,
        humanDecisionCompliance: 1,
        traceability: 1,
      },
      passed: true,
      score: 1,
    });
  });

  test("missing requirements and invented scope fail visibly", () => {
    const result = evaluateCandidate(benchmark, expected, {
      conflicts: [],
      requirements: [
        {
          id: "invented-prequalification",
          needsHumanDecision: false,
          sourceRefs: [],
        },
      ],
    });
    expect(result.passed).toBe(false);
    expect(result.metrics.coverage).toBe(0);
    expect(result.metrics.hallucinations).toBe(1);
    expect(result.metrics.conflictRecall).toBe(0);
  });
});
