import { describe, expect, test } from "bun:test";
import levelingBenchmark from "../benchmarks/bid-leveling/benchmark.json";
import levelingCandidate from "../benchmarks/bid-leveling/cases/case-001/candidate.example.json";
import levelingExpected from "../benchmarks/bid-leveling/cases/case-001/expected.json";
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

describe("bid leveling benchmark", () => {
  test("the inspectable example passes every threshold", () => {
    expect(
      evaluateCandidate(levelingBenchmark, levelingExpected, levelingCandidate),
    ).toMatchObject(perfect);
  });

  test("awarding the low number and reading an empty trade as coverage are hallucinations", () => {
    const naive = {
      ...levelingCandidate,
      findings: [
        ...levelingCandidate.findings,
        {
          id: "award-lowest-plumbing",
          summary: "Harbor Pipe is the low bid",
          sourceRefs: ["proposals.txt Harbor Pipe"],
          needsHumanDecision: false,
        },
        {
          id: "glazing-covered-by-silence",
          summary: "No glazing proposal means glazing is not required",
          sourceRefs: ["bid-set.txt glazing"],
          needsHumanDecision: false,
        },
      ],
    };
    const result = evaluateCandidate(levelingBenchmark, levelingExpected, naive);
    expect(result.metrics.hallucinations).toBe(2);
    expect(result.passed).toBe(false);
  });

  test("reading silence on WH-2 as coverage loses the gap", () => {
    const silentAsCovered = {
      ...levelingCandidate,
      findings: levelingCandidate.findings.filter(
        (finding) => finding.id !== "harbor-pipe-wh2-not-addressed",
      ),
    };
    const result = evaluateCandidate(
      levelingBenchmark,
      levelingExpected,
      silentAsCovered,
    );
    expect(result.metrics.coverage).toBeLessThan(1);
    expect(result.passed).toBe(false);
  });

  test("deciding the carpet clarify instead of escalating it fails the human gate", () => {
    const decided = {
      ...levelingCandidate,
      findings: levelingCandidate.findings.map((finding) =>
        finding.id === "carpet-owner-furnish-gc-install-clarify"
          ? { ...finding, needsHumanDecision: false }
          : finding,
      ),
    };
    const result = evaluateCandidate(levelingBenchmark, levelingExpected, decided);
    expect(result.metrics.humanDecisionCompliance).toBeLessThan(1);
    expect(result.passed).toBe(false);
  });

  test("a clarify cited without the matrix loses traceability", () => {
    const untraceable = {
      ...levelingCandidate,
      findings: levelingCandidate.findings.map((finding) =>
        finding.id === "carpet-owner-furnish-gc-install-clarify"
          ? { ...finding, sourceRefs: ["proposals.txt Soft Floor"] }
          : finding,
      ),
    };
    const result = evaluateCandidate(levelingBenchmark, levelingExpected, untraceable);
    expect(result.metrics.traceability).toBeLessThan(1);
    expect(result.passed).toBe(false);
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

describe("documented output contracts", () => {
  for (const [skill, benchmark, candidate, expected] of [
    ["pay-application-review", payBenchmark, payCandidate, payExpected],
    ["schedule-logic-review", scheduleBenchmark, scheduleCandidate, scheduleExpected],
  ] as const) {
    test(`${skill}: findings retain grading fields through the documented shape`, async () => {
      const text = await Bun.file(`skills/${skill}/SKILL.md`).text();
      const example = JSON.parse(text.match(/```json\n([\s\S]*?)\n```/)?.[1] ?? "{}");
      const key = benchmark.candidate.primaryKey;
      expect(Array.isArray(example[key])).toBe(true);
      const fields = Object.keys(example[key][0]);
      const findings = candidate.defects.map((finding) =>
        Object.fromEntries(fields.map((field) => [field, Reflect.get(finding, field)])),
      );
      expect(
        evaluateCandidate(benchmark, expected, { [key]: findings, conflicts: [] }),
      ).toMatchObject(perfect);
    });
  }
});

describe("construction arithmetic regression cases", () => {
  for (const [skill, caseId, trap] of [
    ["pay-application-review", "case-002", "still-stored-carryforward"],
    ["quantity-takeoff-audit", "case-001", "roofing-uom-overstatement"],
  ]) {
    test(`${skill}: the correct finding passes and the seeded opposite fails`, async () => {
      const base = `benchmarks/${skill}`;
      const benchmark = await Bun.file(`${base}/benchmark.json`).json();
      const candidate = await Bun.file(
        `${base}/cases/${caseId}/candidate.example.json`,
      ).json();
      const expected = await Bun.file(`${base}/cases/${caseId}/expected.json`).json();
      expect(evaluateCandidate(benchmark, expected, candidate)).toMatchObject(perfect);
      const key = benchmark.candidate.primaryKey;
      candidate[key].push({ id: trap, sourceRefs: [] });
      expect(evaluateCandidate(benchmark, expected, candidate).passed).toBe(false);
    });
  }
});
