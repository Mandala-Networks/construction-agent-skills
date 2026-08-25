import { dirname, join, resolve } from "node:path";

interface Candidate {
  conflicts: Array<{ id: string; sourceRefs: string[] }>;
  requirements: Array<{
    id: string;
    needsHumanDecision: boolean;
    sourceRefs: string[];
  }>;
}

interface Expected {
  caseId: string;
  humanDecisionRequirements: string[];
  requiredConflictIds: string[];
  requiredRequirementIds: string[];
  requiredSourceRefs: Record<string, string[]>;
}

interface Benchmark {
  id: string;
  thresholds: Metrics;
  weights: Omit<Metrics, "hallucinations">;
}

interface Metrics {
  conflictRecall: number;
  coverage: number;
  hallucinations: number;
  humanDecisionCompliance: number;
  traceability: number;
}

const ratio = (matched: number, total: number): number =>
  total === 0 ? 1 : matched / total;

const loadJson = async <T>(path: string): Promise<T> =>
  Bun.file(path).json() as Promise<T>;

export const evaluateCandidate = (
  benchmark: Benchmark,
  expected: Expected,
  candidate: Candidate,
) => {
  const candidateRequirementIds = new Set(
    candidate.requirements.map((item) => item.id),
  );
  const candidateConflictIds = new Set(candidate.conflicts.map((item) => item.id));
  const requiredIds = new Set(expected.requiredRequirementIds);
  const coverageCount = expected.requiredRequirementIds.filter((id) =>
    candidateRequirementIds.has(id),
  ).length;
  const hallucinations = [...candidateRequirementIds].filter(
    (id) => !requiredIds.has(id),
  ).length;

  let requiredReferenceCount = 0;
  let matchedReferenceCount = 0;
  for (const [id, references] of Object.entries(expected.requiredSourceRefs)) {
    const requirement = candidate.requirements.find((item) => item.id === id);
    const candidateReferences = new Set(requirement?.sourceRefs ?? []);
    requiredReferenceCount += references.length;
    matchedReferenceCount += references.filter((reference) =>
      candidateReferences.has(reference),
    ).length;
  }

  const humanDecisionCount = expected.humanDecisionRequirements.filter((id) =>
    candidate.requirements.some((item) => item.id === id && item.needsHumanDecision),
  ).length;
  const conflictCount = expected.requiredConflictIds.filter((id) =>
    candidateConflictIds.has(id),
  ).length;
  const metrics: Metrics = {
    conflictRecall: ratio(conflictCount, expected.requiredConflictIds.length),
    coverage: ratio(coverageCount, expected.requiredRequirementIds.length),
    hallucinations,
    humanDecisionCompliance: ratio(
      humanDecisionCount,
      expected.humanDecisionRequirements.length,
    ),
    traceability: ratio(matchedReferenceCount, requiredReferenceCount),
  };
  const score =
    metrics.coverage * benchmark.weights.coverage +
    metrics.traceability * benchmark.weights.traceability +
    metrics.conflictRecall * benchmark.weights.conflictRecall +
    metrics.humanDecisionCompliance * benchmark.weights.humanDecisionCompliance;
  const passed =
    metrics.coverage >= benchmark.thresholds.coverage &&
    metrics.traceability >= benchmark.thresholds.traceability &&
    metrics.conflictRecall >= benchmark.thresholds.conflictRecall &&
    metrics.hallucinations <= benchmark.thresholds.hallucinations &&
    metrics.humanDecisionCompliance >= benchmark.thresholds.humanDecisionCompliance;

  return {
    benchmarkId: benchmark.id,
    caseId: expected.caseId,
    metrics,
    passed,
    score: Number(score.toFixed(4)),
  };
};

export const evaluateFile = async (candidatePath: string) => {
  const absoluteCandidatePath = resolve(candidatePath);
  const caseDirectory = dirname(absoluteCandidatePath);
  const benchmarkDirectory = resolve(caseDirectory, "../..");
  const [candidate, expected, benchmark] = await Promise.all([
    loadJson<Candidate>(absoluteCandidatePath),
    loadJson<Expected>(join(caseDirectory, "expected.json")),
    loadJson<Benchmark>(join(benchmarkDirectory, "benchmark.json")),
  ]);
  return evaluateCandidate(benchmark, expected, candidate);
};

export const runFromCli = async (args: string[]): Promise<void> => {
  const [candidatePath] = args;
  if (!candidatePath) {
    throw new Error("Usage: bun run benchmark <path-to-candidate-output.json>");
  }
  const result = await evaluateFile(candidatePath);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.passed) {
    process.exitCode = 1;
  }
};
