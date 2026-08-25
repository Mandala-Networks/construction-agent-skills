import { describe, expect, test } from "bun:test";
import bidBenchmark from "../benchmarks/bid-requirements-register/benchmark.json";
import bidCandidate from "../benchmarks/bid-requirements-register/cases/case-001/candidate.example.json";
import bidExpected from "../benchmarks/bid-requirements-register/cases/case-001/expected.json";
import payBenchmark from "../benchmarks/pay-application-review/benchmark.json";
import payCandidate from "../benchmarks/pay-application-review/cases/case-001/candidate.example.json";
import payExpected from "../benchmarks/pay-application-review/cases/case-001/expected.json";
import scheduleBenchmark from "../benchmarks/schedule-logic-review/benchmark.json";
import scheduleCandidate from "../benchmarks/schedule-logic-review/cases/case-001/candidate.example.json";
import scheduleExpected from "../benchmarks/schedule-logic-review/cases/case-001/expected.json";
import { evaluateCandidate } from "../scripts/validate-benchmark.ts";

const perfect = {
  metrics: {
    conflictRecall: 1,
    coverage: 1,
    hallucinations: 0,
    humanDecisionCompliance: 1,
    traceability: 1,
  },
  passed: true,
  score: 1,
};

describe("bid requirements benchmark", () => {
  test("the inspectable example passes every threshold", () => {
    expect(evaluateCandidate(bidBenchmark, bidExpected, bidCandidate)).toMatchObject(
      perfect,
    );
  });

  test("missing requirements and invented scope fail visibly", () => {
    const result = evaluateCandidate(bidBenchmark, bidExpected, {
      conflicts: [],
      requirements: [
        { id: "invented-prequalification", needsHumanDecision: false, sourceRefs: [] },
      ],
    });
    expect(result.passed).toBe(false);
    expect(result.metrics.coverage).toBe(0);
    expect(result.metrics.hallucinations).toBe(1);
    expect(result.metrics.conflictRecall).toBe(0);
  });
});

describe("schedule logic review benchmark", () => {
  test("the inspectable example passes every threshold", () => {
    expect(
      evaluateCandidate(scheduleBenchmark, scheduleExpected, scheduleCandidate),
    ).toMatchObject(perfect);
  });

  test("flagging the project start milestone as an open end counts as a hallucination", () => {
    const withTrap = {
      ...scheduleCandidate,
      defects: [
        ...scheduleCandidate.defects,
        {
          id: "dcma-01-open-end-A1000",
          check: 1,
          summary: "Notice to Proceed has no predecessor",
          sourceRefs: ["A1000"],
          needsHumanDecision: false,
        },
      ],
    };
    const result = evaluateCandidate(scheduleBenchmark, scheduleExpected, withTrap);
    expect(result.metrics.hallucinations).toBe(1);
    expect(result.passed).toBe(false);
  });

  test("a defect reported without the failing activity loses traceability", () => {
    const untraceable = {
      ...scheduleCandidate,
      defects: scheduleCandidate.defects.map((defect) =>
        defect.id === "dcma-07-negative-float-A1600"
          ? { ...defect, sourceRefs: [] }
          : defect,
      ),
    };
    const result = evaluateCandidate(scheduleBenchmark, scheduleExpected, untraceable);
    expect(result.metrics.traceability).toBeLessThan(1);
    expect(result.passed).toBe(false);
  });
});

describe("pay application review benchmark", () => {
  test("the inspectable example passes every threshold", () => {
    expect(evaluateCandidate(payBenchmark, payExpected, payCandidate)).toMatchObject(
      perfect,
    );
  });

  test("silently resolving retainage instead of escalating it fails the human gate", () => {
    const decided = {
      ...payCandidate,
      defects: payCandidate.defects.map((defect) =>
        defect.id === "g702-line-05b-retainage-on-stored-materials"
          ? { ...defect, needsHumanDecision: false }
          : defect,
      ),
    };
    const result = evaluateCandidate(payBenchmark, payExpected, decided);
    expect(result.metrics.humanDecisionCompliance).toBeLessThan(1);
    expect(result.passed).toBe(false);
  });

  test("calling a legitimate deductive change order a defect counts as a hallucination", () => {
    const withTrap = {
      ...payCandidate,
      defects: [
        ...payCandidate.defects,
        {
          id: "g703-line-08-negative-scheduled-value",
          location: "G703 line 8",
          expected: "0.00",
          reported: "-15000.00",
          difference: "15000.00",
          check: "Scheduled value must be positive",
          sourceRefs: ["G703 line 8"],
          needsHumanDecision: false,
        },
      ],
    };
    const result = evaluateCandidate(payBenchmark, payExpected, withTrap);
    expect(result.metrics.hallucinations).toBe(1);
    expect(result.passed).toBe(false);
  });
});
