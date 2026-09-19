import { dirname, join, resolve } from "node:path";

interface Finding {
  id: string;
  needsHumanDecision?: boolean;
  sourceRefs?: string[];
}

interface Candidate {
  [key: string]: unknown;
  conflicts?: Finding[];
  requirements?: Finding[];
}

interface NormalizedCandidate {
  conflicts: Finding[];
  findings: Finding[];
}

/**
 * Every skill returns its own top-level key - requirements, findings,
 * submittals, potentialChanges. The benchmark declares which key carries the
 * primary list so one grader and one result contract cover every skill.
 */
interface CandidateShape {
  conflictKey: string;
  primaryKey: string;
}

const DEFAULT_SHAPE: CandidateShape = {
  conflictKey: "conflicts",
  primaryKey: "requirements",
};

const asFindings = (value: unknown): Finding[] =>
  Array.isArray(value)
    ? value.filter(
        (item): item is Finding =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as Finding).id === "string",
      )
    : [];

export const normalizeCandidate = (
  candidate: Candidate,
  shape: CandidateShape = DEFAULT_SHAPE,
): NormalizedCandidate => ({
  conflicts: asFindings(candidate[shape.conflictKey]),
  findings: asFindings(candidate[shape.primaryKey]),
});

interface Expected {
  caseId: string;
  humanDecisionRequirements: string[];
  /** Ids a correct answer must never report. Unlisted extras also count. */
  forbiddenIds?: string[];
  requiredConflictIds: string[];
  requiredRequirementIds: string[];
  requiredSourceRefs: Record<string, string[]>;
}

interface Benchmark {
  candidate?: CandidateShape;
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
  const normalized = normalizeCandidate(
    candidate,
    benchmark.candidate ?? DEFAULT_SHAPE,
  );
  const candidateRequirementIds = new Set(normalized.findings.map((item) => item.id));
  const candidateConflictIds = new Set(normalized.conflicts.map((item) => item.id));
  const requiredIds = new Set(expected.requiredRequirementIds);
  const coverageCount = expected.requiredRequirementIds.filter((id) =>
    candidateRequirementIds.has(id),
  ).length;
  const forbiddenIds = new Set(expected.forbiddenIds ?? []);
  const hallucinations = [...candidateRequirementIds].filter(
    (id) => !requiredIds.has(id) || forbiddenIds.has(id),
  ).length;

  let requiredReferenceCount = 0;
  let matchedReferenceCount = 0;
  for (const [id, references] of Object.entries(expected.requiredSourceRefs)) {
    const requirement = normalized.findings.find((item) => item.id === id);
    const candidateReferences = new Set(requirement?.sourceRefs ?? []);
    requiredReferenceCount += references.length;
    matchedReferenceCount += references.filter((reference) =>
      candidateReferences.has(reference),
    ).length;
  }

  const humanDecisionCount = expected.humanDecisionRequirements.filter((id) =>
    normalized.findings.some(
      (item) => item.id === id && item.needsHumanDecision === true,
    ),
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
